#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
	--federation-base-port=*)
	  federation_base_port="${1#*=}"
  esac
  shift
done


IFS=$'\n'
node_dirs=($(find $TENANTS_DIR/$federation_id -mindepth 1 -maxdepth 1 -type d -iname 'heimdall*'))
unset IFS

federation_ready=true
for node_dir in "${node_dirs[@]}"
do
	if [ ! -f "$node_dir/node-*.pid" ]; then
		federation_ready=false
	fi
done

if [[ "$federation_ready"=="true" ]]; then
   if [ ! -e "$TENANTS_DIR/$federation_id/client.json" ]; then
   	cp "$TENANTS_DIR/$federation_id/heimdall-1/client.json" "$TENANTS_DIR/$federation_id/"
   fi
   exec ./bootstrap-scripts/setup_lightning_gateway.sh --federation-id=$federation_id --federation-base-port=$federation_base_port
fi
