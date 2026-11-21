#!/bin/sh
# WebOS Guest Scripting — Positional Arguments & Parameter Handling
# Target: Tiny Core Linux 17.1 (BusyBox ash)

echo "=== SCRIPTING_ARGS_START ==="
echo "[1] Script self-name (\$0): $0"
echo "[2] Total argument count (\$#): $#"

if [ "$#" -eq 0 ]; then
    echo "[3] No arguments provided; demonstrating default behavior."
else
    echo "[3] Arguments received: $@"
    INDEX=1
    for arg in "$@"; do
        echo "  - Argument $INDEX: $arg"
        INDEX=$(( INDEX + 1 ))
    done
fi

echo "=== SCRIPTING_ARGS_COMPLETE ==="
