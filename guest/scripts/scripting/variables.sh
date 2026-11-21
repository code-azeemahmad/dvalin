#!/bin/sh
# WebOS Guest Scripting — Variables & Parameter Expansion
# Target: Tiny Core Linux 17.1 (BusyBox ash)

echo "=== SCRIPTING_VARS_START ==="

# 1. Standard assignment
GREETING="Hello"
TARGET="WebOS"
echo "[1] Direct interpolation: $GREETING, $TARGET!"

# 2. Default value expansion (${VAR:-default})
UNSET_VAR=""
RESOLVED="${UNSET_VAR:-DefaultValue}"
echo "[2] Default expansion: $RESOLVED"

# 3. String length calculation
STR="OperatingSystem"
LEN=${#STR}
echo "[3] String '$STR' length: $LEN"

# 4. Command substitution
KERNEL=$(uname -r)
echo "[4] Kernel from command substitution: $KERNEL"

echo "=== SCRIPTING_VARS_COMPLETE ==="
