#!/usr/bin/env bash

source ./bootstrap-scripts/set_env.sh


while [ $# -gt 0 ]; do
  case "$1" in
    --federation-id=*)
      federation_id="${1#*=}"
      ;;
	--member-id=*)
	  member_id="${1#*=}"
	  ;;
	--amount=*)
	  amount="${1#*=}"
	  ;;
  esac
  shift
done

FEDERATION_DIR="$TENANTS_DIR/$federation_id"
FEDERATION_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $FEDERATION_DIR"

$FEDERATION_CLIENT spend "$amount"

MEMBER_CLIENT_DIR="$TENANTS_DIR/$federation_id/members/$member_id"
MEMBER_CLIENT="$FM_BIN_DIR/fedimint-cli --workdir $MEMBER_CLIENT_DIR"

token=$($FEDERATION_CLIENT spend "$amount" | jq -r ".token")
$FEDERATION_CLIENT validate "$token"

$MEMBER_CLIENT reissue "$token"
tx=$($MEMBER_CLIENT fetch | jq -r '.fetch.issuance[0]')
echo "$tx"
