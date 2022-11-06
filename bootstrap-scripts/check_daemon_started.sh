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
  esac
  shift
done

FEDERATION_DIR="$TENANTS_DIR/$federation_id"
NODE_ID="heimdall-$node"

FM_PID_FILE="$FEDERATION_DIR/node-$node.pid"
echo "checking node $node started for federation $federation_id..."

# wait for awhile and make sure the daemon has started
sleep 5
if $(test -d /proc/`cat "$FM_PID_FILE"`); then
  echo "daemon started for node $node, federation id $federation_id" >&1
else
	echo "failed to start daemon for node $node, federation id $federation_id" >&1
  exit 1
fi
