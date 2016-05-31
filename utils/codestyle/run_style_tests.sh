#!/usr/bin/env bash

# Get absolute path to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# clean out old generated files
rm samples/*.actual.* 2> /dev/null

# Allow formatting specific file paths
# default to all files
FILES=${@:-samples/*.js}

for f in ${FILES}; do

    NAME=$(basename $f ".js")
    FDIR=$(dirname $f)
    ORIG="${f}"

    echo ""
    echo "=========="
    echo $NAME
    echo "=========="

    # expected result and errors
    EXPE="${FDIR}/${NAME}.expected.out"
    ERRS="${FDIR}/${NAME}.expected.err"

    # actual result and errors
    FIX="${FDIR}/${NAME}.actual.out"
    FIX_ERRS="${FDIR}/${NAME}.actual.err"

    # echo "cp ${ORIG} ${FIX}"
    cp ${ORIG} ${FIX}

    # echo "${DIR}/codestyle.sh ${FIX} > ${FIX_ERRS}"
    ${DIR}/codestyle.sh ${FIX} > ${FIX_ERRS}

    FIX_DIFF=$(colordiff -r ${FIX} ${EXPE})
    ERR_DIFF=$(colordiff -r ${FIX_ERRS} ${ERRS})

    if [[ -z "${FIX_DIFF}" && -z "${ERR_DIFF}" ]]; then
        echo ""
        echo "PASS"
    else
        echo ""
        echo "code diff"
        echo "---------"
        colordiff -r ${EXPE} ${FIX}
        echo ""

        echo "errors diff"
        echo "-----------"
        colordiff -r ${ERRS} ${FIX_ERRS}
    fi

    done
