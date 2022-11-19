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

FEDERATION_DIR="/home/ubuntu/tenants/federations/xmpxaJpeWcskcN5r"
LIGHTNING_DAEMON=`which lightningd`
ln_secret=`head -c 4096 /dev/urandom | openssl sha256 | cut -b1-256 | awk '{ print $2 }'`

GW_CLI="$FM_BIN_DIR/gateway-cli"
FEDERATION_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $FEDERATION_DIR"
$GW_CLI --rpcpassword="$ln_secret" generate-config 127.0.0.1:8080 "$FEDERATION_DIR"

echo "$FEDERATION_DIR"

$LIGHTNING_DAEMON --dev-fast-gossip --dev-bitcoind-poll=1 --network regtest \
	--bitcoin-rpcuser=bitcoin --bitcoin-rpcpassword=bitcoin \
	--lightning-dir="$FEDERATION_DIR/ln" --addr=127.0.0.1:9000 \
	--plugin="$FM_BIN_DIR/ln_gateway" --fedimint-cfg="$FEDERATION_DIR" &

until [ -e /home/ubuntu/tenants/federations/xmpxaJpeWcskcN5r/ln/regtest/lightning-rpc ]; do
    sleep 10
done

FM_CONNECT_STR="$($FEDERATION_CLIENT connect-info | jq -r '.connect_info')"
$GW_CLI --rpcpassword="$ln_secret" --url=http://127.0.0.1:8080 register-fed "$FM_CONNECT_STR"
