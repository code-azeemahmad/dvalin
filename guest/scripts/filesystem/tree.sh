#!/bin/sh
# WebOS Guest Script — POSIX-compatible directory tree visualizer
# Target: Tiny Core Linux 17.1 (BusyBox ash)

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory '$TARGET_DIR' does not exist." >&2
    exit 1
fi

echo "$TARGET_DIR"
find "$TARGET_DIR" -maxdepth 3 2>/dev/null | sed -e "s/[^-][^\/]*\// |-- /g" -e "s/|-- \([^ ]\)/+-- \1/"
