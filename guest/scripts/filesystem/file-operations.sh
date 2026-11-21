#!/bin/sh
# WebOS Guest Script — Filesystem Operations Demonstration
# Target: Tiny Core Linux 17.1 (BusyBox ash)

set -e

WORK_DIR="/tmp/webos_fs_demo_$$"
echo "=== FS_DEMO_START ==="
echo "[1] Creating working directory: $WORK_DIR"
mkdir -p "$WORK_DIR/nested/sub"

echo "[2] Writing test files"
printf "Apple\nBanana\nCherry\n" > "$WORK_DIR/fruits.txt"
printf "Orange\nGrape\n" >> "$WORK_DIR/fruits.txt"

echo "[3] Counting lines in file"
LINES=$(wc -l < "$WORK_DIR/fruits.txt" | tr -d ' ')
echo "Line count: $LINES (Expected: 5)"

echo "[4] Copying and moving file"
cp "$WORK_DIR/fruits.txt" "$WORK_DIR/nested/fruits_copy.txt"
mv "$WORK_DIR/nested/fruits_copy.txt" "$WORK_DIR/nested/sub/fruits_final.txt"

if [ -f "$WORK_DIR/nested/sub/fruits_final.txt" ]; then
    echo "[5] PASS: File successfully relocated through directory hierarchy."
fi

echo "[6] Cleaning up test directory"
rm -rf "$WORK_DIR"
echo "=== FS_DEMO_COMPLETE ==="
