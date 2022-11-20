#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

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

FM_PID_FILE="$FEDERATION_DIR/$NODE_ID/node-$node.pid"
NODE_LOG_FILE="$FEDERATION_DIR/node-$node.log"
NODE_LOG_ERROR_FILE="$FEDERATION_DIR/node-$node.error.log"
rm -f $FM_PID_FILE

(
  exec </dev/null
  exec >> "$NODE_LOG_FILE"
  exec 2>> "$NODE_LOG_ERROR_FILE"
  exec setsid $FM_BIN_DIR/fedimintd $FEDERATION_DIR/$NODE_ID "$secret"
) &
echo $! > $FM_PID_FILE
exit 0
