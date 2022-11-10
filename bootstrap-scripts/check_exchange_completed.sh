#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
  esac
  shift
done


IFS=$'\n'
node_dirs=($(find $TENANTS_DIR/$federation_id -mindepth 1 -maxdepth 1 -type d -iname 'heimdall*'))
unset IFS

exchange_done=true
for node_dir in "${node_dirs[@]}"
do
	if [ ! -f "$node_dir/config" ]; then
		completed=false
	fi
done

if [[ "$exchange_done"=="true" ]]; then
   cp "$TENANTS_DIR/$federation_id/heimdall-1/client.json" "$TENANTS_DIR/$federation_id/"
   exec ./bootstrap-scripts/setup_lightning_gateway.sh --federation-id=$federation_id
fi
