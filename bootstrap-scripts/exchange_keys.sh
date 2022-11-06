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
	--federation-name=*)
	  federation_name="${1#*=}"
	  ;;
  esac
  shift
done

IFS=$'\n'
node_dirs=($(find $TENANTS_DIR/$federation_id -mindepth 1 -maxdepth 1 -type d))
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

(
  exec </dev/null
  exec >> "$LOG_FILE"
  exec 2>> "$LOG_ERROR_FILE"
  exec setsid $FM_BIN_DIR/distributedgen run --out-dir "$guardian_dir" --federation-name="$federation_name" \
	--certs "$CERTS" --password "$secret"
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
