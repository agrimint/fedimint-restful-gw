#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
	--federation-id=*)
	federation_id="${1#*=}"
	;;
    --transaction-id=*)
    tx_id="${1#*=}"
	;;
  esac
  shift
done

if [ ! -e "$BTC_CONFIG_DIR/regtest/wallets/default" ]; then
 $BTC_CLIENT createwallet default
fi

MEMBER_DIR="$TENANTS_DIR/$federation_id"
FM_MEMBER_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $MEMBER_DIR"

function get_txout_proof() {
    local TX_ID
    TX_ID=$1

    local TXOUT_PROOF
    TXOUT_PROOF="$($BTC_CLIENT gettxoutproof "[\"$TX_ID\"]")"
    echo "$TXOUT_PROOF"
}

function get_raw_transaction() {
    local TX_ID
    TX_ID=$1

    local TRANSACTION
    TRANSACTION="$($BTC_CLIENT getrawtransaction "$TX_ID")"
    echo "$TRANSACTION"
}

function get_finality_delay() {
    DELAY=$(cat $TENANTS_DIR/$federation_id/client.json | jq -r '.modules.wallet.finality_delay')
	echo "$DELAY"
}

function await_block_sync() {
  EXPECTED_BLOCK_HEIGHT="$(( $($BTC_CLIENT getblockchaininfo | jq -r '.blocks') - $(get_finality_delay) ))"
  $FM_MEMBER_CLIENT wait-block-height $EXPECTED_BLOCK_HEIGHT
}

function mine_blocks() {
	PEG_IN_ADDR="$($BTC_CLIENT getnewaddress)"
    $BTC_CLIENT generatetoaddress "$1" "$PEG_IN_ADDR"
}

mine_blocks 11
await_block_sync

TXOUT_PROOF=$(get_txout_proof "$tx_id")
TX=$(get_raw_transaction "$tx_id")

$FM_MEMBER_CLIENT peg-in "$TXOUT_PROOF" "$TX"

$FM_MEMBER_CLIENT fetch
