#!/usr/bin/env bash

UPSTREAM=${1:-dev}
CURRENT=${2:-$(git rev-parse --abbrev-ref HEAD)}

# echo "comparing ${UPSTREAM} <- ${CURRENT}" 1>&2

git --no-pager diff --name-only ${UPSTREAM}..${CURRENT} \
    | grep -E ".*\.js$"
