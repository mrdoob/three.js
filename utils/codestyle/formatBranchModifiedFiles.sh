#!/usr/bin/env bash

# Get absolute path to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=${DIR}/../..

# ensure all changes are committed
# ignore files not in the repo
if [[ -z $(git status -s | grep -E "^[^?]{2}") ]]; then
    echo "You have committed changes"
    exit 1
fi

# only format files that differ from dev in current branch
for f in $(${DIR}/filesChangedBetweenBranches.sh); do

    # format file
    ${DIR}/codestyle.sh ${f}

    # enter git patch mode to approve all formatting changes
    git add --patch ${f}

done

echo ""
read -p "Commit formatting changes to current branch [yn]?" -n 1 -r
echo    # (optional) move to a new line

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "formatBranchModifiedFiles script run on modified files"
fi
