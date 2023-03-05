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
	--name=*)
	  name="${1#*=}"
	  ;;
	--secret=*)
	  secret="${1#*=}"
	  ;;
	--federation-base-port=*)
	  federation_base_port="${1#*=}"
	  ;;
  esac
  shift
done

node_dir="heimdall-$node"
node_base_port=$(($federation_base_port+$node*10))
node_api_port=$(($node_base_port + 1))
(FM_PASSWORD="$secret" $FM_BIN_DIR/distributedgen create-cert --out-dir "$TENANTS_DIR/$federation_id/$node_dir" \
	--p2p-url "ws://$HOST_ADDR:$node_base_port" --api-url "ws://$HOST_ADDR:$node_api_port" --name "$name")
