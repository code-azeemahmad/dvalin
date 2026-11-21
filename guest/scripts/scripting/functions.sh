#!/bin/sh
# WebOS Guest Scripting — Modular Shell Functions
# Target: Tiny Core Linux 17.1 (BusyBox ash)

echo "=== SCRIPTING_FUNCS_START ==="

# Function 1: Math calculation using POSIX arithmetic expansion
add_numbers() {
    num1="$1"
    num2="$2"
    result=$(( num1 + num2 ))
    echo "$result"
}

SUM=$(add_numbers 14 28)
echo "[1] Function return value: 14 + 28 = $SUM"

# Function 2: Conditional status code
is_file_present() {
    target="$1"
    if [ -e "$target" ]; then
        return 0
    else
        return 1
    fi
}

if is_file_present "/etc/os-release"; then
    echo "[2] PASS: /etc/os-release validated via function exit code 0."
fi

if ! is_file_present "/invalid_file_test"; then
    echo "[3] PASS: Missing file validated via function non-zero return."
fi

echo "=== SCRIPTING_FUNCS_COMPLETE ==="
