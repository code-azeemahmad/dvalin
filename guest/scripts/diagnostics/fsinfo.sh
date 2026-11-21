#!/bin/sh
# WebOS Guest Diagnostic Suite — Filesystem & Loop Mounts
# Target: Tiny Core Linux 17.1 (i686)

echo "=== WEBOS_FSINFO_START ==="
echo "ROOT_FS_TYPE=$(stat -f -c %T / 2>/dev/null || echo 'tmpfs/rootfs')"
echo "ROOT_FREE_KB=$(df -k / 2>/dev/null | tail -n1 | awk '{print $4}')"
echo "--- DISK_FREE ---"
df -h
echo "--- MOUNTED_EXTENSIONS ---"
ls -la /tmp/tcloop 2>/dev/null || echo "No extensions mounted in /tmp/tcloop"
echo "=== WEBOS_FSINFO_END ==="
