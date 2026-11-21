#!/bin/sh
# WebOS Guest Diagnostic Suite — System & Hardware Information
# Target: Tiny Core Linux 17.1 (i686)

echo "=== WEBOS_SYSINFO_START ==="
echo "KERNEL_RELEASE=$(uname -r)"
echo "MACHINE_ARCH=$(uname -m)"
echo "HOST_NAME=$(uname -n)"
echo "OS_NAME=$(grep '^NAME=' /etc/os-release 2>/dev/null | cut -d= -f2 | tr -d '\"')"
echo "OS_VERSION=$(grep '^VERSION=' /etc/os-release 2>/dev/null | cut -d= -f2 | tr -d '\"')"
echo "UPTIME_SECONDS=$(cut -d. -f1 /proc/uptime 2>/dev/null || echo 0)"
echo "CPU_MODEL=$(grep 'model name' /proc/cpuinfo 2>/dev/null | head -n1 | cut -d: -f2 | sed 's/^[ \t]*//')"
echo "CPU_CORES=$(grep -c 'processor' /proc/cpuinfo 2>/dev/null || echo 1)"
echo "LOAD_AVG=$(cat /proc/loadavg 2>/dev/null || echo '0.00 0.00 0.00')"
echo "CURRENT_USER=$(id -un 2>/dev/null || echo 'tc')"
echo "USER_UID=$(id -u 2>/dev/null || echo '1001')"
echo "=== WEBOS_SYSINFO_END ==="
