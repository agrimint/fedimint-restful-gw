#!/usr/bin/env bash
FM_ROOT="$FM_LOC"
FM_BIN_DIR="$FM_LOC/target/debug"
TENANTS_DIR="../tenants/federations"
USE_PUBLIC_IP_ADDR="$USE_PUBLIC_ADDR"
mkdir -p "$TENANTS_DIR"

if [[ "$USE_PUBLIC_IP_ADDR" == "true" ]]
then
	HOST_ADDR=`dig TXT +short o-o.myaddr.l.google.com @ns1.google.com | awk -F'"' '{ print $2}'`
else
	HOST_ADDR=$(/sbin/ifconfig  | sed -ne $'/127.0.0.1/ ! { s/^[ \t]*inet[ \t]\\{1,99\\}\\(addr:\\)\\{0,1\\}\\([0-9.]*\\)[ \t\/].*$/\\2/p; }')
fi
