#!/usr/bin/env bash

source /home/ubuntu/fedimint-rest-gw/bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
    --node=*)
      node="${1#*=}"
      ;;
	--secret=*)
	  secret="${1#*=}"
	  ;;
  esac
  shift
done

FEDERATION_DIR="$TENANTS_DIR/$federation_id"
NODE_ID="heimdall-$node"

FM_PID_FILE="$FEDERATION_DIR/$federation_id-node$node.pid"

$FM_BIN_DIR/fedimintd $FEDERATION_DIR/$NODE_ID --pasword "$secret" 2>&1 & echo $! >&3 3>>$FM_PID_FILE

# wait for awhile and make sure the daemon has started
sleep 15
if $(test -d /proc/`cat "$FM_PID_FILE"`); then
  exit 0
fi
