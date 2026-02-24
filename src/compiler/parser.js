/**
 * ============================================================
 * RECURSIVE DESCENT PARSER
 * ============================================================
 * 
 * Implements a top-down recursive descent parser for arithmetic
 * expressions using the following LL(1) grammar:
 * 
 *   E  → T E'
 *   E' → + T E' | - T E' | ε
 *   T  → F T'
 *   T' → * F T' | / F T' | ε
 *   F  → ( E ) | id | number
 * 
 * The parser produces:
 *   1. A parse tree (nested object structure)
 *   2. A log of parsing steps for educational visualization
 *   3. Error information with position for invalid input
 * 
 * Each parse tree node has the shape:
 *   { label: string, children: Array, id: number }
 * 
 * Each step log entry has the shape:
 *   { rule: string, action: string, token: string, depth: number }
 * ============================================================
 */

import { TokenType } from './tokenizer';

let tokens = [];       // Token stream from lexer
let currentIndex = 0;  // Current position in token stream
let steps = [];        // Parsing step log
let nodeId = 0;        // Unique ID counter for tree nodes
let depth = 0;         // Current recursion depth

/**
 * Returns the current token without consuming it.
 */
function peek() {
    return tokens[currentIndex] || { type: TokenType.EOF, value: 'EOF', pos: -1 };
}

/**
 * Consumes the current token and advances to the next.
 * Logs the "match" action.
 * @returns {Object} The consumed token
 */
function consume() {
    const token = tokens[currentIndex];
    currentIndex++;
    return token;
}

/**
 * Creates a parse tree node.
 * @param {string} label - The grammar symbol or token value
 * @param {Array}  children - Child nodes
 * @returns {{ label: string, children: Array, id: number }}
 */
function createNode(label, children = []) {
    return { label, children, id: nodeId++ };
}

/**
 * Logs a parsing step for the step-by-step visualization.
 */
function logStep(rule, action, tokenInfo = null) {
    const token = tokenInfo || peek();
    steps.push({
        rule,
        action,
        token: token ? `${token.value}` : '',
        tokenType: token ? token.type : '',
        depth,
        timestamp: steps.length,
    });
}

/**
 * Throws a descriptive parse error.
 */
function parseError(expected) {
    const token = peek();
    const posInfo = token.pos >= 0 ? ` at position ${token.pos}` : '';
    const got = token.type === TokenType.EOF ? 'end of input' : `'${token.value}'`;
    throw new ParseError(
        `Syntax Error${posInfo}: Expected ${expected}, but found ${got}`,
        token.pos,
        token
    );
}

/**
 * Custom error class for parse errors, includes position info.
 */
class ParseError extends Error {
    constructor(message, pos, token) {
        super(message);
        this.name = 'ParseError';
        this.pos = pos;
        this.token = token;
    }
}

// ─────────────────────────────────────────────────────
//  Grammar Rule Implementations
// ─────────────────────────────────────────────────────

/**
 * E → T E'
 * 
 * The start symbol. Parses an expression consisting of
 * a term followed by an expression-prime (handles + and -).
 */
function parseE() {
    depth++;
    logStep("E → T E'", 'Enter E');

    const tNode = parseT();
    const ePrimeNode = parseEPrime();

    const node = createNode('E', [tNode, ePrimeNode]);
    logStep("E → T E'", 'Exit E');
    depth--;
    return node;
}

/**
 * E' → + T E' | - T E' | ε
 * 
 * Handles addition and subtraction with left-to-right
 * associativity via right-recursive grammar transformation.
 */
function parseEPrime() {
    depth++;
    const token = peek();

    if (token.type === TokenType.PLUS) {
        logStep("E' → + T E'", `Match '+'`);
        const plusToken = consume();
        const plusNode = createNode('+');
        const tNode = parseT();
        const ePrimeNode = parseEPrime();
        const node = createNode("E'", [plusNode, tNode, ePrimeNode]);
        depth--;
        return node;
    }

    if (token.type === TokenType.MINUS) {
        logStep("E' → - T E'", `Match '-'`);
        const minusToken = consume();
        const minusNode = createNode('-');
        const tNode = parseT();
        const ePrimeNode = parseEPrime();
        const node = createNode("E'", [minusNode, tNode, ePrimeNode]);
        depth--;
        return node;
    }

    // ε (epsilon) production — no token consumed
    logStep("E' → ε", 'Epsilon (no match needed)');
    const node = createNode("E'", [createNode('ε')]);
    depth--;
    return node;
}

/**
 * T → F T'
 * 
 * Parses a term: a factor followed by a term-prime
 * (handles * and /).
 */
function parseT() {
    depth++;
    logStep("T → F T'", 'Enter T');

    const fNode = parseF();
    const tPrimeNode = parseTPrime();

    const node = createNode('T', [fNode, tPrimeNode]);
    logStep("T → F T'", 'Exit T');
    depth--;
    return node;
}

/**
 * T' → * F T' | / F T' | ε
 * 
 * Handles multiplication and division.
 */
function parseTPrime() {
    depth++;
    const token = peek();

    if (token.type === TokenType.STAR) {
        logStep("T' → * F T'", `Match '*'`);
        const starToken = consume();
        const starNode = createNode('*');
        const fNode = parseF();
        const tPrimeNode = parseTPrime();
        const node = createNode("T'", [starNode, fNode, tPrimeNode]);
        depth--;
        return node;
    }

    if (token.type === TokenType.SLASH) {
        logStep("T' → / F T'", `Match '/'`);
        const slashToken = consume();
        const slashNode = createNode('/');
        const fNode = parseF();
        const tPrimeNode = parseTPrime();
        const node = createNode("T'", [slashNode, fNode, tPrimeNode]);
        depth--;
        return node;
    }

    // ε (epsilon) production
    logStep("T' → ε", 'Epsilon (no match needed)');
    const node = createNode("T'", [createNode('ε')]);
    depth--;
    return node;
}

/**
 * F → ( E ) | id | number
 * 
 * Parses a factor: a parenthesized expression,
 * an identifier, or a number literal.
 */
function parseF() {
    depth++;
    const token = peek();

    // F → ( E )
    if (token.type === TokenType.LPAREN) {
        logStep('F → ( E )', `Match '('`);
        consume(); // consume '('
        const lparenNode = createNode('(');

        const eNode = parseE();

        const closeParen = peek();
        if (closeParen.type !== TokenType.RPAREN) {
            parseError("')'");
        }
        logStep('F → ( E )', `Match ')'`);
        consume(); // consume ')'
        const rparenNode = createNode(')');

        const node = createNode('F', [lparenNode, eNode, rparenNode]);
        depth--;
        return node;
    }

    // F → number
    if (token.type === TokenType.NUMBER) {
        logStep(`F → number`, `Match number '${token.value}'`);
        consume();
        const node = createNode('F', [createNode(token.value)]);
        depth--;
        return node;
    }

    // F → id
    if (token.type === TokenType.ID) {
        logStep(`F → id`, `Match identifier '${token.value}'`);
        consume();
        const node = createNode('F', [createNode(token.value)]);
        depth--;
        return node;
    }

    // Error — unexpected token
    parseError('number, identifier, or "("');
}

// ─────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────

/**
 * Parses a token array and returns the parse tree + step log.
 * 
 * @param {Array} tokenArray - Tokens from the tokenizer
 * @returns {{ tree: Object|null, steps: Array, error: string|null, errorPos: number|null }}
 */
export function parse(tokenArray) {
    // Reset parser state
    tokens = tokenArray;
    currentIndex = 0;
    steps = [];
    nodeId = 0;
    depth = 0;

    try {
        const tree = parseE();

        // After parsing E, we should be at EOF
        const remaining = peek();
        if (remaining.type !== TokenType.EOF) {
            parseError('end of expression');
        }

        logStep('✓ Parse Complete', 'Expression parsed successfully!');

        return {
            tree,
            steps: [...steps],
            error: null,
            errorPos: null,
        };
    } catch (err) {
        if (err instanceof ParseError) {
            logStep('✗ Parse Error', err.message);
            return {
                tree: null,
                steps: [...steps],
                error: err.message,
                errorPos: err.pos,
            };
        }
        throw err; // Re-throw unexpected errors
    }
}
