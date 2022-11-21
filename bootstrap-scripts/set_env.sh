#!/usr/bin/env bash

FM_ROOT="$FM_LOC"
FM_BIN_DIR="$FM_LOC/target/debug"
TENANTS_DIR="$TENANTS_STORE/tenants/federations"
USE_PUBLIC_IP_ADDR="$USE_PUBLIC_ADDR"
BTC_CONFIG_DIR="$TENANTS_STORE/bitcoind"

mkdir -p "$BTC_CONFIG_DIR"
mkdir -p "$TENANTS_DIR"

if [[ "$USE_PUBLIC_IP_ADDR" == "true" ]]
then
	HOST_ADDR=`dig TXT +short o-o.myaddr.l.google.com @ns1.google.com | awk -F'"' '{ print $2}'`
else
	HOST_ADDR="$HOST_IP_ADDR"
fi
