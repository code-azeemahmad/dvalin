#!/bin/sh
# WebOS Guest Scripting — Conditional Branches & File Tests
# Target: Tiny Core Linux 17.1 (BusyBox ash)

echo "=== SCRIPTING_COND_START ==="

# 1. Directory existence test
if [ -d "/proc" ]; then
    echo "[1] PASS: /proc pseudo-filesystem exists."
else
    echo "[1] FAIL: /proc missing!"
fi

# 2. File test & numeric comparison
PID_COUNT=$(ls -d /proc/[0-9]* 2>/dev/null | wc -l)
if [ "$PID_COUNT" -gt 0 ]; then
    echo "[2] PASS: Detected $PID_COUNT active processes."
else
    echo "[2] FAIL: No processes found."
fi

# 3. String comparison
ROLE="admin"
if [ "$ROLE" = "admin" ]; then
    echo "[3] PASS: String equality verified."
else
    echo "[3] FAIL: String comparison failed."
fi

# 4. Case branch statement
ARCH=$(uname -m)
case "$ARCH" in
    i*86)
        echo "[4] Architecture branch: 32-bit x86 ($ARCH)"
        ;;
    x86_64)
        echo "[4] Architecture branch: 64-bit x86_64"
        ;;
    *)
        echo "[4] Unknown architecture: $ARCH"
        ;;
esac

echo "=== SCRIPTING_COND_COMPLETE ==="
