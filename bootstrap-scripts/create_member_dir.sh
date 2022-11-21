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
  esac
  shift
done

FEDERATION_DIR="$TENANTS_DIR/$federation_id"
MEMBERS_DIR="$FEDERATION_DIR/members"

mkdir -p "$MEMBERS_DIR/$member_id"
