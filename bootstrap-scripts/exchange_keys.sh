#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
	--federation-base-port=*)
	  federation_base_port="${1#*=}"
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

IFS=$'\n'
node_dirs=($(find $TENANTS_DIR/$federation_id -mindepth 1 -maxdepth 1 -type d -iname 'heimdall*'))
unset IFS

CERTS=""
for node_dir in "${node_dirs[@]}"
do
	CERTS="$CERTS,$(cat $node_dir/tls-cert)"
done
CERTS=${CERTS:1}

guardian_dir="$TENANTS_DIR/$federation_id/heimdall-$node"


LOG_FILE="$TENANTS_DIR/$federation_id/key-exchange-$node.log"
LOG_ERROR_FILE="$TENANTS_DIR/$federation_id/key-exchange-$node.error.log"

node_base_port=$(($federation_base_port+$node*10))
node_api_port=$(($node_base_port + 1))
(
  exec </dev/null
  exec >> "$LOG_FILE"
  exec 2>> "$LOG_ERROR_FILE"
  exec setsid FM_SECRET="$secret" $FM_BIN_DIR/distributedgen run --bind-p2p "$HOST_ADDR:$node_base_port" \
	--bind-api "$HOST_ADDR:$node_api_port" --out-dir "$guardian_dir" --certs "$CERTS"
) &
PID=$(echo $!)
wait $PID
RESULT=$?
if [[ $RESULT -ne 0 ]]; then
	echo "exchange for node $node in federation $federation_id has failed"
	exit 1
else
	echo "exchange for node $node in federation $federation_id has succeded"
	exit 0
fi
