#!/usr/bin/env bash

# Get absolute path to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=${DIR}/../..

# Allow formatting specific file paths
# default to all files
FILES=${@:-${BASE}/}

${BASE}/node_modules/.bin/esformatter \
   --config ${DIR}/esformatter.json \
   -i \
   "${@}"

# apply rules that jscs can auto-fix
${BASE}/node_modules/.bin/jscs \
    --fix \
    --config=${DIR}/config.json \
    "${@}"

