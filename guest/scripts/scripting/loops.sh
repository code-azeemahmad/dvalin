#!/bin/sh
# WebOS Guest Scripting — Loops & Iteration
# Target: Tiny Core Linux 17.1 (BusyBox ash)

echo "=== SCRIPTING_LOOPS_START ==="

# 1. For loop over list
echo "[1] For-in list iteration:"
for item in CPU Memory Storage Network; do
    echo "  - Subsystem: $item"
done

# 2. While loop with numeric counter
echo "[2] While loop counter:"
COUNT=1
while [ "$COUNT" -le 3 ]; do
    echo "  - Count: $COUNT"
    COUNT=$(( COUNT + 1 ))
done

# 3. Iteration over command output (seq)
echo "[3] Seq iteration:"
for i in $(seq 1 3); do
    echo "  - Sequence step: $i"
done

echo "=== SCRIPTING_LOOPS_COMPLETE ==="
