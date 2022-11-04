#!/usr/bin/env bash
export FM_ROOT="$FM_LOC"
export FM_BIN_DIR="$FM_ROOT/target/debug"
export TENANTS_DIR="../tenants/federations"
export USE_PUBLIC_IP_ADDR="$USE_PUBLIC_ADDR"
mkdir -p "$TENANTS_DIR"
