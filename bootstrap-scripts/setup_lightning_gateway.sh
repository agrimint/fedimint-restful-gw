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
  esac
  shift
done

HTTP_SCHEMA=http://
FEDERATION_DIR="$TENANTS_DIR/$federation_id"
LN_LOCK="$FEDERATION_DIR/ln.lock"
if [ ! -f "$LN_LOCK" ]; then
	touch "$LN_LOCK"

	LN_GW_PORT=$federation_base_port
	LN_GW_RPC_PORT=$(($LN_GW_PORT+1))
	LIGHTNING_DAEMON=`which lightningd`
	ln_secret=`head -c 4096 /dev/urandom | openssl sha256 | cut -b1-256 | awk '{ print $2 }'`

	GW_CLI="$FM_BIN_DIR/gateway-cli"
	FEDERATION_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $FEDERATION_DIR"
	$GW_CLI --rpcpassword="$ln_secret" generate-config "${HOST_IP_ADDR}:${LN_GW_RPC_PORT}" "$FEDERATION_DIR"

	$LIGHTNING_DAEMON --dev-fast-gossip --dev-bitcoind-poll=1 --network regtest \
		--bitcoin-rpcuser=bitcoin --bitcoin-rpcpassword=bitcoin \
		--lightning-dir="$FEDERATION_DIR/ln" --addr="${HOST_IP_ADDR}:${LN_GW_PORT}" \
		--plugin="$FM_BIN_DIR/ln_gateway" --fedimint-cfg="$FEDERATION_DIR" &

	until [ -e $FEDERATION_DIR/ln/regtest/lightning-rpc ]; do
	  sleep 5
	done

	FM_CONNECT_STR="$($FEDERATION_CLIENT connect-info | jq -r '.connect_info')"
	$GW_CLI --rpcpassword="$ln_secret" --url="${HTTP_SCHEMA}${HOST_IP_ADDR}:${LN_GW_RPC_PORT}" register-fed "$FM_CONNECT_STR"
fi
