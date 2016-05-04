#!/usr/bin/env bash

# get dir of this script file
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# allow passing custom paths
DEFAULT_PATHS="${DIR}/../../src/**/*.js"
PATHS="${1:-${DEFAULT_PATHS}}"

${DIR}/../../node_modules/.bin/esformatter \
    --config ${DIR}/esformatter.config.json \
    -i \
    ${PATHS}

