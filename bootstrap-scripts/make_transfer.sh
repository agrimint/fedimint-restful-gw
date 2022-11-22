#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh

while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
    federation_id="${1#*=}"
    ;;
	--sender-id=*)
	sender_id="${1#*=}"
	;;
	--recipient-id=*)
	recipient_id="${1#*=}"
	;;
	--amount=*)
	amount="${1#*=}"
    ;;
  esac
  shift
done

SENDER_DIR="$TENANTS_DIR/$federation_id/members/$sender_id"
SENDER_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $SENDER_DIR"

RECIPIENT_DIR="$TENANTS_DIR/$federation_id/members/$recipient_id"
RECIPIENT_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $RECIPIENT_DIR"


token=$($SENDER_CLIENT spend "$amount" | jq -r ".spend.token")

$SENDER_CLIENT validate "$token"

$RECIPIENT_CLIENT reissue "$token"
tx=$($RECIPIENT_CLIENT fetch | jq -r '.fetch.issuance[0]')

