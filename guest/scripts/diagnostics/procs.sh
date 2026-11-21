#!/bin/sh
# WebOS Guest Diagnostic Suite — Process Tree & State
# Target: Tiny Core Linux 17.1 (i686)

echo "=== WEBOS_PROCS_START ==="
echo "TOTAL_PROCS=$(ls -d /proc/[0-9]* 2>/dev/null | wc -l)"
echo "--- PROCESS_LIST ---"
ps -o pid,user,stat,comm 2>/dev/null || ps
echo "--- TOP_RESOURCE_SUMMARY ---"
top -b -n 1 2>/dev/null | head -n 15 || echo "top utility not available"
echo "=== WEBOS_PROCS_END ==="
