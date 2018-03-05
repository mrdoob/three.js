// LICENSE
//
//   This software is dual-licensed to the public domain and under the following
//   license: you are granted a perpetual, irrevocable license to copy, modify,
//   publish, and distribute this file as you see fit.
//
// VERSION
//   0.1.0  (2016-03-28)  Initial release
//
// AUTHOR
//   Forrest Smith
//
// CONTRIBUTORS
//   Jørgen Tjernø - async helper


// Returns true if each character in pattern is found sequentially within str
function fuzzy_match_simple(pattern, str) {

    var patternIdx = 0;
    var strIdx = 0;
    var patternLength = pattern.length;
    var strLength = str.length;

    while (patternIdx != patternLength && strIdx != strLength) {
        var patternChar = pattern.charAt(patternIdx).toLowerCase();
        var strChar = str.charAt(strIdx).toLowerCase();
        if (patternChar == strChar)
            ++patternIdx;
        ++strIdx;
    }

    return patternLength != 0 && strLength != 0 && patternIdx == patternLength ? true : false;
}

// Returns [bool, score, formattedStr]
// bool: true if each character in pattern is found sequentially within str
// score: integer; higher is better match. Value has no intrinsic meaning. Range varies with pattern.
//        Can only compare scores with same search pattern.
// formattedStr: input str with matched characters marked in <b> tags. Delete if unwanted.
function fuzzy_match(pattern, str) {

    // Score consts
    var adjacency_bonus = 5;                // bonus for adjacent matches
    var separator_bonus = 10;               // bonus if match occurs after a separator
    var camel_bonus = 10;                   // bonus if match is uppercase and prev is lower
    var leading_letter_penalty = -3;        // penalty applied for every letter in str before the first match
    var max_leading_letter_penalty = -9;    // maximum penalty for leading letters
    var unmatched_letter_penalty = -1;      // penalty for every letter that doesn't matter

    // Loop variables
    var score = 0;
    var patternIdx = 0;
    var patternLength = pattern.length;
    var strIdx = 0;
    var strLength = str.length;
    var prevMatched = false;
    var prevLower = false;
    var prevSeparator = true;       // true so if first letter match gets separator bonus

    // Use "best" matched letter if multiple string letters match the pattern
    var bestLetter = null;
    var bestLower = null;
    var bestLetterIdx = null;
    var bestLetterScore = 0;

    var matchedIndices = [];

    // Loop over strings
    while (strIdx != strLength) {
        var patternChar = patternIdx != patternLength ? pattern.charAt(patternIdx) : null;
        var strChar = str.charAt(strIdx);

        var patternLower = patternChar != null ? patternChar.toLowerCase() : null;
        var strLower = strChar.toLowerCase();
        var strUpper = strChar.toUpperCase();

        var nextMatch = patternChar && patternLower == strLower;
        var rematch = bestLetter && bestLower == strLower;

        var advanced = nextMatch && bestLetter;
        var patternRepeat = bestLetter && patternChar && bestLower == patternLower;
        if (advanced || patternRepeat) {
            score += bestLetterScore;
            matchedIndices.push(bestLetterIdx);
            bestLetter = null;
            bestLower = null;
            bestLetterIdx = null;
            bestLetterScore = 0;
        }

        if (nextMatch || rematch) {
            var newScore = 0;

            // Apply penalty for each letter before the first pattern match
            // Note: std::max because penalties are negative values. So max is smallest penalty.
            if (patternIdx == 0) {
                var penalty = Math.max(strIdx * leading_letter_penalty, max_leading_letter_penalty);
                score += penalty;
            }

            // Apply bonus for consecutive bonuses
            if (prevMatched)
                newScore += adjacency_bonus;

            // Apply bonus for matches after a separator
            if (prevSeparator)
                newScore += separator_bonus;

            // Apply bonus across camel case boundaries. Includes "clever" isLetter check.
            if (prevLower && strChar == strUpper && strLower != strUpper)
                newScore += camel_bonus;

            // Update patter index IFF the next pattern letter was matched
            if (nextMatch)
                ++patternIdx;

            // Update best letter in str which may be for a "next" letter or a "rematch"
            if (newScore >= bestLetterScore) {

                // Apply penalty for now skipped letter
                if (bestLetter != null)
                    score += unmatched_letter_penalty;

                bestLetter = strChar;
                bestLower = bestLetter.toLowerCase();
                bestLetterIdx = strIdx;
                bestLetterScore = newScore;
            }

            prevMatched = true;
        }
        else {
            // Append unmatch characters
            formattedStr += strChar;

            score += unmatched_letter_penalty;
            prevMatched = false;
        }

        // Includes "clever" isLetter check.
        prevLower = strChar == strLower && strLower != strUpper;
        prevSeparator = strChar == '_' || strChar == ' ';

        ++strIdx;
    }

    // Apply score for last match
    if (bestLetter) {
        score += bestLetterScore;
        matchedIndices.push(bestLetterIdx);
    }

    // Finish out formatted string after last pattern matched
    // Build formated string based on matched letters
    var formattedStr = "";
    var lastIdx = 0;
    for (var i = 0; i < matchedIndices.length; ++i) {
        var idx = matchedIndices[i];
        formattedStr += str.substr(lastIdx, idx - lastIdx) + "<b>" + str.charAt(idx) + "</b>";
        lastIdx = idx + 1;
    }
    formattedStr += str.substr(lastIdx, str.length - lastIdx);

    var matched = patternIdx == patternLength;
    return [matched, score, formattedStr];
}


// Strictly optional utility to help make using fts_fuzzy_match easier for large data sets
// Uses setTimeout to process matches before a maximum amount of time before sleeping
//
// To use:
//      var asyncMatcher = new fts_fuzzy_match(fuzzy_match, "fts", "ForrestTheWoods",
//                                              function(results) { console.log(results); });
//      asyncMatcher.start();
//
function fts_fuzzy_match_async(matchFn, pattern, dataSet, onComplete) {
    var ITEMS_PER_CHECK = 1000;         // performance.now can be very slow depending on platform

    var max_ms_per_frame = 1000.0/30.0; // 30FPS
    var dataIndex = 0;
    var results = [];
    var resumeTimeout = null;

    // Perform matches for at most max_ms
    function step() {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;

        var stopTime = performance.now() + max_ms_per_frame;

        for (; dataIndex < dataSet.length; ++dataIndex) {
            if ((dataIndex % ITEMS_PER_CHECK) == 0) {
                if (performance.now() > stopTime) {
                    resumeTimeout = setTimeout(step, 1);
                    return;
                }
            }

            var str = dataSet[dataIndex];
            var result = matchFn(pattern, str);

            // A little gross because fuzzy_match_simple and fuzzy_match return different things
            if (matchFn == fuzzy_match_simple && result == true)
                results.push(str);
            else if (matchFn == fuzzy_match && result[0] == true)
                results.push(result);
        }

        onComplete(results);
        return null;
    };

    // Abort current process
    this.cancel = function() {
        if (resumeTimeout !== null)
            clearTimeout(resumeTimeout);
    };

    // Must be called to start matching.
    // I tried to make asyncMatcher auto-start via "var resumeTimeout = step();"
    // However setTimout behaving in an unexpected fashion as onComplete insisted on triggering twice.
    this.start = function() {
        step();
    }

    // Process full list. Blocks script execution until complete
    this.flush = function() {
        max_ms_per_frame = Infinity;
        step();
    }
};
