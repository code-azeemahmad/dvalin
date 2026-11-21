#!/bin/sh
# WebOS OS Lab 1 — Process Lifecycle, Signals & Exit Codes
# Target: Tiny Core Linux 17.1 (i686)

echo "=== LAB1_START: Process Lifecycle ==="

# Step 1: Examine Parent Process & Shell PID
echo "[Step 1] Current Shell PID: $$"
echo "[Step 1] Parent PID: $PPID"

# Step 2: Spawn a Background Child Process
echo "[Step 2] Spawning background worker: sleep 30 &"
sleep 30 &
CHILD_PID=$!
echo "[Step 2] Child spawned with PID: $CHILD_PID"

# Step 3: Inspect Process State in /proc
if [ -d "/proc/$CHILD_PID" ]; then
    STATE=$(grep '^State:' "/proc/$CHILD_PID/status" 2>/dev/null | awk '{print $2}')
    echo "[Step 3] Child /proc/$CHILD_PID state: $STATE (S=Sleeping)"
else
    echo "[Step 3] Error: Process not found in /proc"
fi

# Step 4: Signal Delivery (SIGTERM = 15)
echo "[Step 4] Sending SIGTERM to PID $CHILD_PID"
kill -15 "$CHILD_PID" 2>/dev/null
wait "$CHILD_PID" 2>/dev/null
EXIT_CODE=$?
echo "[Step 4] Process terminated with wait status: $EXIT_CODE"

# Step 5: Verification of Clean Exit
if [ ! -d "/proc/$CHILD_PID" ]; then
    echo "[Step 5] PASS: Process $CHILD_PID successfully reaped from process table."
else
    echo "[Step 5] FAIL: Process remains active or zombie."
fi

echo "=== LAB1_COMPLETE: Process Lifecycle Verified ==="
