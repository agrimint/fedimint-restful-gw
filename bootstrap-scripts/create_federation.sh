#!/usr/bin/env bash

source /home/ubuntu/fedimint-rest-gw/bootstrap-scripts/set_env.sh


while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
    --nodes=*)
      number_of_nodes="${1#*=}"
      ;;
  esac
  shift
done

FEDERATION_CONFIG_DIR="$TENANTS_DIR/$federation_id"
mkdir -p "$FEDERATION_CONFIG_DIR"
for nodeIdx in $(seq 1 $number_of_nodes)
do
	node_name="heimdall-$nodeIdx"
	mkdir -p "$FEDERATION_CONFIG_DIR/$node_name"
done
