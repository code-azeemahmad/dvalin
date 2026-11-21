#!/bin/sh
# WebOS Guest Scripting — Signal Traps & Guaranteed Resource Cleanup
# Target: Tiny Core Linux 17.1 (BusyBox ash)

TEMP_LOG="/tmp/trap_demo_$$.log"

# Register trap on EXIT, SIGINT, SIGTERM
cleanup() {
    echo "[Trap] Invoking cleanup routine for $TEMP_LOG"
    rm -f "$TEMP_LOG"
}
trap cleanup EXIT INT TERM

echo "=== SCRIPTING_TRAPS_START ==="
echo "[1] Creating temporary file: $TEMP_LOG"
echo "Temporary data" > "$TEMP_LOG"

if [ -f "$TEMP_LOG" ]; then
    echo "[2] Temp file successfully written."
fi

echo "[3] Script exiting normally; trap will trigger automatically."
echo "=== SCRIPTING_TRAPS_COMPLETE ==="
