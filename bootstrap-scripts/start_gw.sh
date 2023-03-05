#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

BTC_DAEMON=$(which bitcoind)
$BTC_DAEMON -regtest -fallbackfee=0.0004 -txindex -server -rpcuser=bitcoin -rpcpassword=bitcoin -datadir="$BTC_CONFIG_DIR" &
npm run dev 2>&1 > gw.log &
