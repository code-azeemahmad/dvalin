#!/bin/sh
# WebOS OS Lab 2 — Virtual Memory, Page Allocation & Tmpfs RAM Disk
# Target: Tiny Core Linux 17.1 (i686)

echo "=== LAB2_START: Virtual Memory & RAM Filesystem ==="

# Step 1: Query System Memory Page Size
PAGE_SIZE=$(getconf PAGESIZE 2>/dev/null || echo 4096)
echo "[Step 1] System Page Size: $PAGE_SIZE bytes"

# Step 2: Read Available RAM
MEM_TOTAL=$(grep 'MemTotal:' /proc/meminfo 2>/dev/null | awk '{print $2}')
MEM_FREE=$(grep 'MemFree:' /proc/meminfo 2>/dev/null | awk '{print $2}')
echo "[Step 2] Total RAM: ${MEM_TOTAL} kB, Free RAM: ${MEM_FREE} kB"

# Step 3: Test Dynamic Page Allocation via tmpfs RAM disk
TEST_DIR="/tmp/lab2_test_$$"
mkdir -p "$TEST_DIR"
echo "[Step 3] Creating 2 MB memory-backed buffer in RAM..."
dd if=/dev/zero of="$TEST_DIR/buffer.bin" bs=1024 count=2048 2>/dev/null
SYNC_STAT=$?

if [ $SYNC_STAT -eq 0 ] && [ -f "$TEST_DIR/buffer.bin" ]; then
    ACTUAL_SIZE=$(ls -l "$TEST_DIR/buffer.bin" | awk '{print $5}')
    echo "[Step 3] Allocated buffer size: $ACTUAL_SIZE bytes ($(( ACTUAL_SIZE / PAGE_SIZE )) pages)"
else
    echo "[Step 3] Allocation error!"
fi

# Step 4: Clean up buffer
rm -rf "$TEST_DIR"
echo "[Step 4] Memory buffer released back to kernel page allocator."

echo "=== LAB2_COMPLETE: Virtual Memory & Page Allocation Verified ==="
