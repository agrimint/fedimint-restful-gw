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

FEDERATION_DIR="$TENANTS_DIR/$federation_id"
ln_secret=`head -c 4096 /dev/urandom | openssl sha256 | cut -b1-256 | awk '{ print $2 }'`
$FM_BIN_DIR/gateway-cli --rpcpassword="$ln_secret" generate-config "$FEDERATION_DIR"


nix-shell "$FM_ROOT/flake.nix" && nix develop
LIGHTNING_DAEMON=`which lightningd`
$LIGHTNING_DAEMON --dev-fast-gossip --dev-bitcoind-poll=1 --network regtest \
	--bitcoin-rpcuser=bitcoin --bitcoin-rpcpassword=bitcoin --lightning-dir=$FEDERATION_DIR/ln \
	--addr=192.168.64.12:9000 --plugin=$FM_BIN_DIR/ln_gateway --fedimint-cfg=$FEDERATION_DIR &
