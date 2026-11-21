#!/bin/sh
# WebOS Guest Script — Process Lifecycle, Signals & Process Table
# Target: Tiny Core Linux 17.1 (BusyBox ash)

echo "=== PROCESS_DEMO_START ==="
echo "[1] Parent Shell PID: $$"

# Spawn a long-running background worker
sleep 60 &
CHILD_PID=$!
echo "[2] Background child spawned with PID: $CHILD_PID"

# Inspect child in process table
if [ -d "/proc/$CHILD_PID" ]; then
    STATE=$(grep '^State:' "/proc/$CHILD_PID/status" 2>/dev/null | awk '{print $2}')
    echo "[3] Child process state in /proc: $STATE (S=Sleep)"
fi

# Send SIGTERM (15)
echo "[4] Sending SIGTERM to PID $CHILD_PID"
kill -15 "$CHILD_PID" 2>/dev/null
wait "$CHILD_PID" 2>/dev/null
EXIT_STATUS=$?
echo "[5] Process reaped with exit status: $EXIT_STATUS"

if [ ! -d "/proc/$CHILD_PID" ]; then
    echo "[6] PASS: Child process entry removed from /proc table."
fi

echo "=== PROCESS_DEMO_COMPLETE ==="
