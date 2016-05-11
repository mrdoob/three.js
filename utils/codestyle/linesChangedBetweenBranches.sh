#!/usr/bin/env bash

# Determine lines modified by feature branch
git --no-pager diff dev..cleanup \
    | grep -E "^(diff|index|---|\+\+\+|@@)" \
    | while read line; do
        if [[ $line =~ ^\+\+\+.*\.js$ ]]; then

            file="$(echo $line | cut -d ' ' -f 2 )"
            echo "File: ${file}"

        elif [[ $line =~ ^@@.*@@$ ]]; then

            oldchunk="$(echo $line | cut -d ' ' -f 2)"
            newchunk="$(echo $line | cut -d ' ' -f 3)"
            echo "  modified: $newchunk (old: $oldchunk)"

        fi
    done

# approach
# 1. `diff dev..current` to figure out which lines are modified by feature branch
# 2. execute formatter
# 3. `git diff HEAD..HEAD~1` to see changes made by formatter
# 4. generate patch from git previous output, filtering out changes not included
#    in the line ranges found in (1)
