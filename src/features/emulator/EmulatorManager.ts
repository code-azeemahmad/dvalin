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
      if (!container) {
        container = document.getElementById('v86-screen-container');
      }

      const v86Options: any = {
        wasm_path: this.config.wasmPath,
        memory_size: this.config.memorySize,
        vga_memory_size: this.config.vgaMemorySize,
        bios: { url: this.config.biosUrl },
        vga_bios: { url: this.config.vgaBiosUrl },
        autostart: true,
        screen_container: container,
      };

      if (this.config.cdromUrl) {
        v86Options.cdrom = { url: this.config.cdromUrl };
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
    try {
      this.v86Instance.restart();
      this.setStatus('booting');
    } catch (err: any) {
      this.addLog('error', `Error restarting emulator: ${err?.message}`);
    }
  }

  public async destroy(): Promise<void> {
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

  public lockMouse(): void {
    if (this.v86Instance && typeof this.v86Instance.lock_mouse === 'function') {
      this.v86Instance.lock_mouse();
    }
  }

  public goFullscreen(): void {
    if (this.v86Instance && typeof this.v86Instance.screen_go_fullscreen === 'function') {
      this.v86Instance.screen_go_fullscreen();
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
