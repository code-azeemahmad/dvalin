# WebOS — User Guide & Operating Manual

Welcome to **WebOS**, a browser-hosted operating system environment running a genuine x86 Linux guest (Tiny Core Linux 17.1) inside the v86 PC emulator, wrapped in a React desktop environment.

---

## 1. Getting Started

### 1.1 Opening WebOS
When you first open WebOS, you are greeted with the desktop interface:
- **Desktop Icons:** Quick access to Terminal, Linux Desktop, OS Lab, Settings, and About.
- **Bottom Taskbar:** Houses the Start Menu button, running window tabs, and system status indicators.
- **System Toolbar:** Displays machine lifecycle status (`[STOPPED]`, `[BOOTING]`, `[RUNNING]`, `[RESTORING]`).

### 1.2 Booting the Virtual Machine
Click the **"Start Machine"** button on the toolbar or double-click the **"Linux Desktop"** icon.
1. The machine begins loading SeaBIOS and the Tiny Core Linux ISO.
2. The bootloader boots into the Linux kernel (`6.18.35-tinycore`).
3. Within approximately 60 seconds, the virtual machine reaches the interactive BusyBox ash shell prompt (`tc@box:~$ `) and starts the graphical FLWM desktop.

---

## 2. Working with the Desktop & Applications

### 2.1 Window Controls
- **Moving Windows:** Click and drag any window title bar.
- **Resizing Windows:** Drag any window edge or corner.
- **Minimizing:** Click the minimize icon (`-`) to hide the window to the taskbar.
- **Maximizing:** Click the square icon (`□`) to expand to full desktop size.
- **Closing:** Click (`✕`) to close. Closing a window does not shut down the virtual machine.

### 2.2 Terminal Application
The Terminal connects directly to the guest BusyBox ash shell:
- Execute standard POSIX and Linux utilities (`ls`, `ps`, `df`, `free`, `cat`, `grep`, `mkdir`).
- Use the **Up/Down arrow keys** to recall previous command history.
- Click into the terminal to focus keyboard input.

### 2.3 Guest Linux Desktop
Opening the **"Linux Desktop"** window reveals the emulated VGA framebuffer (1024x768 @ 32bpp) running FLWM:
- Click the canvas to focus mouse and keyboard input.
- Click the **"Fullscreen"** icon to expand the VM to fill your physical monitor.
- Press **Escape** (`Esc`) to release the mouse pointer back to the host browser.

---

## 3. Session Persistence & Snapshots

WebOS provides fast, reliable session persistence powered by IndexedDB and v86 memory snapshots.

### 3.1 Saving a Session
1. Open **Settings** from the desktop or Start Menu.
2. Navigate to the **"Sessions & Storage"** tab.
3. Enter a session name (e.g., "Lab 1 Progress") and click **"Save Snapshot"**.
4. The system serializes the entire 128 MB RAM and CPU register state in ~500 ms and stores it with SHA-256 integrity verification.

### 3.2 Restoring a Session
1. In the **"Sessions & Storage"** tab, find your saved session in the list.
2. Click **"Restore"**.
3. The virtual machine resumes in **under 1 second**, restoring all open terminal sessions, running background jobs, and guest files exactly as they were.

### 3.3 Exporting & Importing
- Click **"Export"** to download your session as a `.bin` snapshot file.
- Click **"Import"** to restore a snapshot file from another machine or browser.

---

## 4. Operating Systems Laboratory (OS Lab)

The **OS Lab** is an interactive educational suite designed to teach operating systems concepts hands-on:
1. Double-click the **"OS Lab"** icon.
2. Browse 20 structured experiments across 7 categories:
   - **Processes:** Process IDs, fork/exec lifecycle, POSIX signals, CPU scheduling.
   - **Memory:** `/proc/meminfo`, dynamic allocation, 4KB paging, OOM pressure.
   - **Filesystem:** Directory hierarchy, inodes, hard/soft links, mount points.
   - **Permissions:** Discretionary Access Control (DAC) and mode bits.
   - **Shell Scripting:** Variables, loops, functions, and pipelines.
   - **Kernel & Devices:** Kernel architecture, `/proc`, `/dev` device nodes, boot sequence.
3. Click **"Run Step"** to execute the step command in the genuine Linux guest.
4. Review the real terminal output and pass/fail indicators.
5. Answer the **Knowledge Check** quiz question to reinforce your understanding.
6. Track your global progress bar across sessions.

---

## 5. Shutting Down & Restarting

- **Orderly Shutdown:** Open the Start Menu, click **Power**, and select **"Shut Down"**. The guest Linux kernel will execute `sudo poweroff`, cleanly unmounting filesystems before stopping.
- **Reboot:** Select **"Restart Machine"** to perform an orderly `sudo reboot`.
- **Reset:** Click the toolbar reset button to perform an immediate hardware reset.
