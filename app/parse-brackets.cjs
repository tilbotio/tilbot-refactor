"use strict";

/*
Define an ad-hoc parser for text with nested brackets.
It does not attach any meaning to the parsed text, it just returns nested
arrays of strings. Odd elements of the arrays are strings, even elements
are nested arrays. All arrays have an odd number of elements.
There is no method to escape brackets.

Examples:
    parseBrackets("abc") -> ["abc"]
    parseBrackets("a[b]c") -> ["a", ["b"], "c"]
    parseBrackets("[abc]") -> ["", ["abc"], ""]
    parseBrackets("[[abc]]") -> ["", ["", ["abc"], ""], ""]
    parseBrackets("a[[bc]]d") -> ["a", ["", ["bc"], ""], "d"]
    parseBrackets("[a][b]") -> ["", ["a"], "", ["b"], ""]
    parseBrackets("") -> [""]
    parseBrackets("[]") -> ["", [""], ""]
    parseBrackets("[[]]") -> ["", ["", [""], ""], ""]

All of this is used for parsing block connector labels, as well as connector
output. It's a step up from the old code that tried to match bits using
regular expressions in an ad-hoc fashion (and failed to do proper nesting).

In the long term we should represent such label logic in the JSON itself,
rather than in some ad-hoc DSL. However, even if that happens we still need
this parsing for compatibility with old projects.
*/

export class TilBotParseBracketsError extends Error {
    get name() {
        return this.constructor.name;
    }
}
export class TilbotParseBracketsUnmatchedError extends TilBotParseBracketsError { }
export class TilbotParseBracketsUnmatchedOpenError extends TilBotParseBracketsError {
    message = "Unmatched open bracket";
}
export class TilbotParseBracketsUnmatchedCloseError extends TilBotParseBracketsError {
    message = "Unmatched close bracket";
}

export function parseBrackets(str) {
    let current = [];
    const stack = [];

    // Split the string into parts, alternating between text and brackets.
    // string.split() keeps the separators because we used a regex group.
    // In the resulting array, even elements are text, odd elements are
    // brackets.
    const parts = str.split(/([\[\]])/);

    for (const [index, part] of Object.entries(parts)) {
        if (index & 1) {
            if (part === '[') {
                stack.push(current);
                const parent = current;
                current = [];
                parent.push(current);
            } else if (part === ']') {
                if (!stack.length) {
                    throw new TilbotParseBracketsUnmatchedCloseError();
                }
                current = stack.pop();
            }
        } else {
            current.push(part);
        }
    }

    if (stack.length) {
        throw new TilbotParseBracketsUnmatchedOpenError();
    }

    return current;
}

export function stringifyBrackets(brackets) {
    const output = [];
    function stringify(brackets) {
        for (const [index, part] of Object.entries(brackets)) {
            if (index & 1) {
                output.push('[');
                stringify(part);
                output.push(']');
            } else if (part) {
                output.push(part);
            }
        }
    }
    stringify(brackets);
    return output.join('');
}

export function isTrimmedBracketsEqual(a, b) {
    // Compare two bracket trees.
    // Return true if they are the same, false otherwise.
    // Strings are considered equal if they are the same after applying
    // .trim() on each.

    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (i & 1) {
            // Odd index: it's a bracket tree.
            if (!isTrimmedBracketsEqual(a[i], b[i])) {
                return false;
            }
        } else {
            // Even index: it's a string.
            if (a[i].trim() !== b[i].trim()) {
                return false;
            }
        }
    }
    return true;
}
