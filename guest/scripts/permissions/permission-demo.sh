#!/bin/sh
# WebOS Guest Script — Permission Bits & Execute Bit Enforcement
# Target: Tiny Core Linux 17.1 (BusyBox ash)

TEST_FILE="/tmp/perm_test_$$.sh"
echo "=== PERM_DEMO_START ==="

# Create a test script without execute permissions
printf '#!/bin/sh\necho "SCRIPT_EXECUTED_SUCCESSFULLY"\n' > "$TEST_FILE"
chmod 644 "$TEST_FILE"
echo "[1] Created script with mode: $(ls -l "$TEST_FILE" | awk '{print $1}')"

# Test execution failure when 'x' is missing
echo "[2] Attempting execution without +x bit..."
if "$TEST_FILE" 2>/dev/null; then
    echo "[2] FAIL: Script executed without +x bit!"
else
    echo "[2] PASS: Kernel blocked execution with Permission Denied."
fi

# Add execute permission
echo "[3] Granting execute permission (chmod 755)..."
chmod 755 "$TEST_FILE"
echo "[3] Updated mode: $(ls -l "$TEST_FILE" | awk '{print $1}')"

# Execute again
echo "[4] Executing with +x bit..."
OUTPUT=$("$TEST_FILE")
echo "[4] Output: $OUTPUT"

# Clean up
rm -f "$TEST_FILE"
echo "=== PERM_DEMO_COMPLETE ==="
