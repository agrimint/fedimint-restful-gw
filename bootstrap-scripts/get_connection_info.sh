#!/usr/bin/env bash

source /home/ubuntu/fedimint-rest-gw/bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
  esac
  shift
done

FEDERATION_DIR="$TENANTS_DIR/$federation_id"
$FM_BIN_DIR/fedimint-cli --workdir "$FEDERATION_DIR/heimdall-1" connect-info | jq -r
