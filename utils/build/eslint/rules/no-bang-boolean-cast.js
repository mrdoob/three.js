/**
 * @fileoverview Rule to flag unnecessary double negation in Boolean contexts
 * @author Brandon Mills
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    "use strict";

    function report(node, statement) {
        context.report(node, "!variable not allowed in " + statement + ". Use variable !== null, undefined, false, 0 etc...");
    }

    return {
        "UnaryExpression": function (node) {
            var ancestors = context.getAncestors(),
                parent = ancestors.pop();

            // Exit early if it's guaranteed not to match
            if (node.operator !== "!") {
                return;
            }

            // if (<bool>) ...
            if (parent.type === "IfStatement") {
                report(node, "if statement condition");

            // do ... while (<bool>)
            } else if (parent.type === "DoWhileStatement") {
                report(node, "do while loop condition");

            // while (<bool>) ...
            } else if (parent.type === "WhileStatement") {
                report(node, "while loop condition");

            // <bool> ? ... : ...
            } else if (parent.type === "ConditionalExpression") {
                report(node, "ternary condition");

            // for (...; <bool>; ...) ...
            } else if (parent.type === "ForStatement") {
                report(node, "for loop condition");

            }
        }
    };

};
