#!/bin/sh
# WebOS Guest Diagnostic Suite — Memory Hierarchy & Utilization
# Target: Tiny Core Linux 17.1 (i686)

echo "=== WEBOS_MEMINFO_START ==="
MEM_TOTAL_KB=$(grep 'MemTotal:' /proc/meminfo 2>/dev/null | awk '{print $2}')
MEM_FREE_KB=$(grep 'MemFree:' /proc/meminfo 2>/dev/null | awk '{print $2}')
MEM_AVAIL_KB=$(grep 'MemAvailable:' /proc/meminfo 2>/dev/null | awk '{print $2}')
BUFFERS_KB=$(grep 'Buffers:' /proc/meminfo 2>/dev/null | awk '{print $2}')
CACHED_KB=$(grep '^Cached:' /proc/meminfo 2>/dev/null | awk '{print $2}')
SWAP_TOTAL_KB=$(grep 'SwapTotal:' /proc/meminfo 2>/dev/null | awk '{print $2}')
SWAP_FREE_KB=$(grep 'SwapFree:' /proc/meminfo 2>/dev/null | awk '{print $2}')

echo "MEM_TOTAL_KB=${MEM_TOTAL_KB:-0}"
echo "MEM_FREE_KB=${MEM_FREE_KB:-0}"
echo "MEM_AVAILABLE_KB=${MEM_AVAIL_KB:-0}"
echo "BUFFERS_KB=${BUFFERS_KB:-0}"
echo "CACHED_KB=${CACHED_KB:-0}"
echo "SWAP_TOTAL_KB=${SWAP_TOTAL_KB:-0}"
echo "SWAP_FREE_KB=${SWAP_FREE_KB:-0}"
echo "--- FREE_OUTPUT ---"
free -m 2>/dev/null || cat /proc/meminfo
echo "=== WEBOS_MEMINFO_END ==="
