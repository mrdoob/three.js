#!/usr/bin/env bash

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
