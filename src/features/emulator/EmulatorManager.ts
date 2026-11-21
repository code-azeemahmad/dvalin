import {
  EmulatorStatus,
  EmulatorConfig,
  EmulatorLogEntry,
  LogLevel,
  DownloadProgress,
  ScreenDimensions,
  StateChangeListener,
  LogListener,
  ProgressListener,
  SerialListener,
  ScreenSizeListener,
} from './types';
import { DEFAULT_EMULATOR_CONFIG } from './config';

declare global {
  interface Window {
    V86?: any;
    V86Starter?: any;
  }
}

/**
 * Singleton service responsible for managing the v86 emulator instance lifecycle.
 * Ensures strict single-instance semantics, clean teardown, and typed event propagation.
 */
export class EmulatorManager {
  private static instance: EmulatorManager | null = null;

  private v86Instance: any = null;
  private status: EmulatorStatus = 'idle';
  private config: EmulatorConfig = DEFAULT_EMULATOR_CONFIG;
  private screenContainer: HTMLElement | null = null;
  private serialOutputBuffer: string = '';
  private logs: EmulatorLogEntry[] = [];
  private lastError: string | null = null;
  private screenDimensions: ScreenDimensions = { width: 640, height: 400, bpp: 8 };
  private instructionCount: number = 0;
  private isShellReady: boolean = false;
  private sentEnterToIsolinux: boolean = false;
  private autoBootTimer: any = null;

  // Listeners
  private stateListeners = new Set<StateChangeListener>();
  private logListeners = new Set<LogListener>();
  private progressListeners = new Set<ProgressListener>();
  private serialListeners = new Set<SerialListener>();
  private screenSizeListeners = new Set<ScreenSizeListener>();

  private constructor() {}

  public static getInstance(): EmulatorManager {
    if (!EmulatorManager.instance) {
      EmulatorManager.instance = new EmulatorManager();
    }
    return EmulatorManager.instance;
  }

  public getStatus(): EmulatorStatus {
    return this.status;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public getLogs(): EmulatorLogEntry[] {
    return [...this.logs];
  }

  public getSerialOutput(): string {
    return this.serialOutputBuffer;
  }

  public getScreenDimensions(): ScreenDimensions {
    return this.screenDimensions;
  }

  public getIsShellReady(): boolean {
    return this.isShellReady;
  }

  public getInstructionCount(): number {
    if (this.v86Instance && typeof this.v86Instance.get_instruction_counter === 'function') {
      try {
        this.instructionCount = this.v86Instance.get_instruction_counter();
      } catch {
        // Ignore if disposed
      }
    }
    return this.instructionCount;
  }

  public setScreenContainer(container: HTMLElement | null): void {
    this.screenContainer = container;
  }

  public configure(configPartial: Partial<EmulatorConfig>): void {
    if (this.status !== 'idle' && this.status !== 'stopped' && this.status !== 'error') {
      throw new Error(`Cannot configure emulator while in state: ${this.status}`);
    }
    this.config = { ...this.config, ...configPartial };
    this.addLog('info', `Emulator configured: ${JSON.stringify(configPartial)}`);
  }

  /**
   * Initializes and starts the v86 virtual machine.
   */
  public async boot(screenElement?: HTMLElement | null): Promise<void> {
    if (this.status === 'initializing' || this.status === 'booting' || this.status === 'running') {
      this.addLog('warn', `Boot requested while emulator is already in state: ${this.status}`);
      return;
    }

    if (screenElement) {
      this.screenContainer = screenElement;
    }

    this.setStatus('initializing');
    this.lastError = null;
    this.isShellReady = false;
    this.sentEnterToIsolinux = false;
    this.addLog('info', 'Starting WebOS virtual machine initialization...');

    try {
      // Dynamically import v86
      const v86Module = await import('v86');
      const V86Constructor = v86Module.V86 || (v86Module as any).default || window.V86 || window.V86Starter;

      if (!V86Constructor) {
        throw new Error('v86 emulator library could not be loaded from module bundle.');
      }

      this.addLog('info', 'Loaded v86 WebAssembly emulator module.');

      // Prepare screen container structure as required by v86
      let container: HTMLElement | null = this.screenContainer;
      if (!container && typeof document !== 'undefined') {
        container = document.getElementById('v86-screen-container');
      }

      // In Node.js testing environments (including jsdom), resolve root-relative paths to public/
      let wasmPath = this.config.wasmPath;
      let biosUrl = this.config.biosUrl;
      let vgaBiosUrl = this.config.vgaBiosUrl;
      let cdromUrl = this.config.cdromUrl;

      const isNodeEnvironment = typeof process !== 'undefined' && Boolean(process.versions?.node);
      if (isNodeEnvironment) {
        const root = process.cwd();
        if (wasmPath.startsWith('/')) wasmPath = root + '/public' + wasmPath;
        if (biosUrl.startsWith('/')) biosUrl = root + '/public' + biosUrl;
        if (vgaBiosUrl.startsWith('/')) vgaBiosUrl = root + '/public' + vgaBiosUrl;
        if (cdromUrl && cdromUrl.startsWith('/')) cdromUrl = root + '/public' + cdromUrl;
      }

      const v86Options: any = {
        wasm_path: wasmPath,
        memory_size: this.config.memorySize,
        vga_memory_size: this.config.vgaMemorySize,
        bios: { url: biosUrl },
        vga_bios: { url: vgaBiosUrl },
        autostart: true,
        screen_container: container,
      };

      if (cdromUrl) {
        v86Options.cdrom = { url: cdromUrl };
      }
      if (this.config.hdaUrl) {
        v86Options.hda = { url: this.config.hdaUrl };
      }

      this.addLog('info', `Initializing virtual hardware: RAM=${this.config.memorySize / 1024 / 1024}MB, CDROM=${this.config.cdromUrl}`);

      const emulator = new V86Constructor(v86Options);
      this.v86Instance = emulator;

      // Register event listeners
      emulator.add_listener('download-progress', (e: any) => {
        const loaded = e.loaded || 0;
        const total = e.total || 0;
        const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
        const progress: DownloadProgress = {
          fileName: e.file_name || 'asset',
          fileIndex: e.file_index || 0,
          fileCount: e.file_count || 1,
          loaded,
          total,
          percent,
        };
        this.progressListeners.forEach((fn) => fn(progress));
      });

      emulator.add_listener('download-error', (e: any) => {
        const errorMsg = `Failed to load asset: ${e.file_name || 'unknown'}`;
        this.addLog('error', errorMsg);
        this.lastError = errorMsg;
        this.setStatus('error');
      });

      emulator.add_listener('emulator-ready', () => {
        this.addLog('info', 'SeaBIOS and hardware initialized. Booting Linux kernel...');
        this.setStatus('booting');

        // Fallback auto-send Enter scancodes (press 0x1c, release 0x9c) to ISOLINUX
        // in case screen detection does not fire
        if (this.autoBootTimer) clearTimeout(this.autoBootTimer);
        this.autoBootTimer = setTimeout(() => {
          if (!this.sentEnterToIsolinux && this.v86Instance && (this.status === 'booting' || this.status === 'running')) {
            this.sentEnterToIsolinux = true;
            try {
              this.v86Instance.keyboard_send_scancodes([0x1c, 0x9c]);
              this.addLog('info', 'Dispatched Enter key to launch Linux kernel.');
            } catch {
              // Ignore
            }
          }
        }, 5000);
      });

      emulator.add_listener('emulator-started', () => {
        this.addLog('info', 'Emulator core started execution.');
        if (this.status === 'booting' || this.status === 'initializing') {
          this.setStatus('running');
        }
      });

      emulator.add_listener('emulator-stopped', () => {
        this.addLog('info', 'Emulator stopped.');
        this.setStatus('stopped');
      });

      emulator.add_listener('screen-set-size', (dims: [number, number, number]) => {
        const [width, height, bpp] = dims;
        this.screenDimensions = { width, height, bpp };
        this.addLog('info', `Display resolution changed: ${width}x${height} @ ${bpp}bpp`);
        this.screenSizeListeners.forEach((fn) => fn(this.screenDimensions));
      });

      let textBuffer = '';
      emulator.add_listener('screen-put-char', ([_row, _col, chr]: [number, number, number]) => {
        const char = String.fromCharCode(chr);
        textBuffer += char;
        if (textBuffer.length > 500) {
          textBuffer = textBuffer.slice(-300);
        }

        // Fast-path prompt-aware Enter dispatch
        if (!this.sentEnterToIsolinux && (textBuffer.includes('Press ENTER to boot') || textBuffer.includes('boot:'))) {
          this.sentEnterToIsolinux = true;
          try {
            this.v86Instance?.keyboard_send_scancodes([0x1c, 0x9c]);
            this.addLog('info', 'Detected ISOLINUX menu; dispatched Enter key to trigger Linux boot.');
          } catch {
            // Ignore
          }
        }

        if (!this.isShellReady && (textBuffer.includes('tc@box:') || textBuffer.includes('box:~$'))) {
          this.isShellReady = true;
          this.addLog('info', 'Real Linux shell prompt reached: tc@box:~$');
        }
      });

      emulator.add_listener('serial0-output-byte', (byte: number) => {
        const char = String.fromCharCode(byte);
        this.serialOutputBuffer += char;
        if (this.serialOutputBuffer.length > 50000) {
          this.serialOutputBuffer = this.serialOutputBuffer.slice(-40000);
        }
        this.serialListeners.forEach((fn) => fn(char));
      });

    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error occurred while initializing v86.';
      this.addLog('error', `Initialization failed: ${errorMsg}`);
      this.lastError = errorMsg;
      this.setStatus('error');
    }
  }

  public async stop(): Promise<void> {
    if (!this.v86Instance) return;
    this.setStatus('stopping');
    this.addLog('info', 'Stopping emulator...');
    if (this.autoBootTimer) clearTimeout(this.autoBootTimer);
    try {
      await this.v86Instance.stop();
      this.setStatus('stopped');
    } catch (err: any) {
      this.addLog('error', `Error stopping emulator: ${err?.message}`);
      this.setStatus('error');
    }
  }

  public async restart(): Promise<void> {
    if (!this.v86Instance) return;
    this.addLog('info', 'Triggering guest hardware reset...');
    this.isShellReady = false;
    try {
      this.v86Instance.restart();
      this.setStatus('booting');
    } catch (err: any) {
      this.addLog('error', `Error restarting emulator: ${err?.message}`);
    }
  }

  public async destroy(): Promise<void> {
    if (this.autoBootTimer) {
      clearTimeout(this.autoBootTimer);
      this.autoBootTimer = null;
    }
    this.lastError = null;
    this.isShellReady = false;
    this.sentEnterToIsolinux = false;
    if (!this.v86Instance) {
      this.setStatus('idle');
      return;
    }
    this.addLog('info', 'Destroying emulator instance and freeing resources...');
    try {
      await this.v86Instance.destroy();
    } catch (err: any) {
      this.addLog('warn', `Warning during emulator destroy: ${err?.message}`);
    } finally {
      this.v86Instance = null;
      this.setStatus('idle');
    }
  }

  public reportError(message: string): void {
    this.lastError = message;
    this.addLog('error', message);
    this.setStatus('error');
  }

  public sendSerialCommand(cmd: string): void {
    if (!this.v86Instance) {
      throw new Error('Emulator is not running');
    }
    const fullCmd = cmd.endsWith('\n') ? cmd : cmd + '\n';
    this.v86Instance.serial0_send(fullCmd);
    this.addLog('serial', `> ${cmd}`);
  }

  public sendText(text: string): void {
    if (!this.v86Instance) return;
    this.v86Instance.keyboard_send_text(text);
  }

  /**
   * Dispatches an application launch command to the genuine Linux guest.
   * If the emulator is running, the command is forwarded to the guest environment.
   */
  public launchGuestApp(command: string): boolean {
    if (this.status !== 'running' || !this.v86Instance) {
      this.addLog('warn', `Cannot launch guest application '${command}': emulator is in status '${this.status}'.`);
      return false;
    }
    const fullCmd = command.endsWith('\n') ? command : command + '\n';
    try {
      this.v86Instance.keyboard_send_text(fullCmd);
      this.addLog('info', `Dispatched guest application launch command: ${command.trim()}`);
      return true;
    } catch (e: any) {
      this.addLog('warn', `Failed to dispatch guest command: ${e?.message || e}`);
      return false;
    }
  }

  /**
   * Captures an in-memory snapshot of the current virtual machine state.
   * Returns an ArrayBuffer containing CPU registers, RAM, device states, and instruction counter.
   */
  public async saveState(): Promise<ArrayBuffer | null> {
    if (!this.v86Instance || typeof this.v86Instance.save_state !== 'function') {
      this.addLog('warn', 'saveState failed: emulator is not active.');
      return null;
    }
    try {
      this.addLog('info', 'Serializing virtual machine snapshot state...');
      const state = await this.v86Instance.save_state();
      this.addLog('info', `Snapshot state saved successfully (${state.byteLength} bytes).`);
      return state;
    } catch (e: any) {
      this.addLog('error', `Failed to save virtual machine state: ${e?.message || e}`);
      return null;
    }
  }

  /**
   * Restores virtual machine state from an in-memory snapshot ArrayBuffer.
   */
  public async restoreState(state: ArrayBuffer): Promise<boolean> {
    if (!this.v86Instance || typeof this.v86Instance.restore_state !== 'function') {
      this.addLog('warn', 'restoreState failed: emulator is not active.');
      return false;
    }
    try {
      this.addLog('info', `Restoring virtual machine state from snapshot (${state.byteLength} bytes)...`);
      await this.v86Instance.restore_state(state);
      this.addLog('info', 'Virtual machine snapshot restored successfully.');
      return true;
    } catch (e: any) {
      this.addLog('error', `Failed to restore virtual machine state: ${e?.message || e}`);
      return false;
    }
  }

  public lockMouse(): void {
    if (this.v86Instance && typeof this.v86Instance.lock_mouse === 'function') {
      try {
        this.v86Instance.lock_mouse();
      } catch (e: any) {
        this.addLog('warn', `Mouse lock: ${e?.message || e}`);
      }
    }
  }

  public goFullscreen(): void {
    if (this.v86Instance && typeof this.v86Instance.screen_go_fullscreen === 'function') {
      try {
        this.v86Instance.screen_go_fullscreen();
      } catch (e: any) {
        this.addLog('warn', `Fullscreen: ${e?.message || e}`);
      }
    }
  }

  // Listener subscriptions
  public onStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    listener(this.status);
    return () => this.stateListeners.delete(listener);
  }

  public onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public onProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  public onSerial(listener: SerialListener): () => void {
    this.serialListeners.add(listener);
    return () => this.serialListeners.delete(listener);
  }

  public onScreenSize(listener: ScreenSizeListener): () => void {
    this.screenSizeListeners.add(listener);
    return () => this.screenSizeListeners.delete(listener);
  }

  private setStatus(status: EmulatorStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.stateListeners.forEach((fn) => fn(status));
  }

  private addLog(level: LogLevel, message: string): void {
    const entry: EmulatorLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      level,
      message,
    };
    this.logs.push(entry);
    if (this.logs.length > 500) {
      this.logs.shift();
    }
    this.logListeners.forEach((fn) => fn(entry));
  }
}
