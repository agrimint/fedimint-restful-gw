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

nix-shell "$FM_ROOT/flake.nix" && nix develop

($FM_BIN_DIR/fedimintd $FEDERATION_DIR/$NODE_ID "$secret" 2>&1 &)
