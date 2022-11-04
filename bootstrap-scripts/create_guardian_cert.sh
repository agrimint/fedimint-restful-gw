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
  esac
  shift
done

base_port=`echo "4000 + $node * 10" | bc -l`
node_dir="heimdall-$node"

public_address=`dig TXT +short o-o.myaddr.l.google.com @ns1.google.com | awk -F'"' '{ print $2}'`
address=192.168.64.6

nix-shell "$FM_ROOT/flake.nix" && nix develop

$FM_BIN_DIR/distributedgen create-cert --out-dir "$TENANTS_DIR/$federation_id/$node_dir" \
	--address "$address" --base-port "$base_port" --name "$name" --password "$secret"
