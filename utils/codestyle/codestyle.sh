#!/usr/bin/env bash

# Get absolute path to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Allow formatting specific file paths
# default to all files
FILES=${@:-${DIR}/../../}

${DIR}/../../node_modules/.bin/jscs \
    --fix \
    --config=${DIR}/config.json \
    "${@}" 

