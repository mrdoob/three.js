#!/usr/bin/env bash

# get dir of this script file
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

${DIR}/../../node_modules/.bin/esformatter \
    --config ${DIR}/esformatter.config.json \
    -i \
    "${DIR}/../../src/**/*.js"

