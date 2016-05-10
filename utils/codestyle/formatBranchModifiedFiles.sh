#!/usr/bin/env bash

# Get absolute path to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=${DIR}/../..

# ensure all changes are committed
# ignore files not in the repo
if [[ -n $(git status -s | grep -E "^[^?]{2}") ]]; then
    echo "You have committed changes"
    exit 1
fi

# only format files that differ from dev in current branch
for f in $(${DIR}/filesChangedBetweenBranches.sh); do

    # format file
    ${DIR}/codestyle.sh ${BASE}/${f}

    echo ""
    echo "============================="
    echo "| Accept formatting changes |"
    echo "============================="
    echo ""

    # enter git patch mode to approve all formatting changes
    git add --patch ${BASE}/${f}

done

echo ""
echo "============"
echo "| ALL DONE |"
echo "============"
echo ""

read -p "Commit formatting changes to current branch [yn]?" -n 1 -r
echo    # (optional) move to a new line

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "formatBranchModifiedFiles script run on modified files"
fi
