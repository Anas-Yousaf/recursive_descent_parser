/**
 * ============================================================
 * TOKENIZER (LEXICAL ANALYZER)
 * ============================================================
 * 
 * This module performs lexical analysis on arithmetic expressions.
 * It breaks the input string into a stream of tokens that the
 * parser can consume.
 * 
 * Token Types:
 *   NUMBER  - Integer or decimal numbers (e.g., 42, 3.14)
 *   ID      - Identifiers/variables (e.g., x, foo, bar)
 *   PLUS    - Addition operator (+)
 *   MINUS   - Subtraction operator (-)
 *   STAR    - Multiplication operator (*)
 *   SLASH   - Division operator (/)
 *   LPAREN  - Left parenthesis (()
 *   RPAREN  - Right parenthesis ())
 *   EOF     - End of input
 * 
 * Each token includes:
 *   - type:  The token type
 *   - value: The string value of the token
 *   - pos:   The starting position in the input string
 *   - end:   The ending position in the input string
 * ============================================================
 */

// Token type constants
export const TokenType = {
  NUMBER:  'NUMBER',
  ID:      'ID',
  PLUS:    'PLUS',
  MINUS:   'MINUS',
  STAR:    'STAR',
  SLASH:   'SLASH',
  LPAREN:  'LPAREN',
  RPAREN:  'RPAREN',
  EOF:     'EOF',
};

// Map single characters to their token types
const SINGLE_CHAR_TOKENS = {
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.STAR,
  '/': TokenType.SLASH,
  '(': TokenType.LPAREN,
  ')': TokenType.RPAREN,
};

/**
 * Creates a token object.
 * @param {string} type  - One of the TokenType values
 * @param {string} value - The raw string value
 * @param {number} pos   - Start position in the input
 * @param {number} end   - End position in the input
 * @returns {{ type: string, value: string, pos: number, end: number }}
 */
function createToken(type, value, pos, end) {
  return { type, value, pos, end };
}

/**
 * Tokenizes an arithmetic expression string.
 * 
 * @param {string} input - The expression to tokenize
 * @returns {{ tokens: Array, error: string|null }}
 *          tokens: Array of token objects
 *          error:  Error message if tokenization fails, null otherwise
 */
export function tokenize(input) {
  const tokens = [];
  let pos = 0;

  while (pos < input.length) {
    const char = input[pos];

    // ── Skip whitespace ──
    if (/\s/.test(char)) {
      pos++;
      continue;
    }

    // ── Single-character operators and parentheses ──
    if (SINGLE_CHAR_TOKENS[char]) {
      tokens.push(createToken(SINGLE_CHAR_TOKENS[char], char, pos, pos + 1));
      pos++;
      continue;
    }

    // ── Numbers (integers and decimals) ──
    if (/[0-9]/.test(char)) {
      const start = pos;
      let hasDecimal = false;

      while (pos < input.length && (/[0-9]/.test(input[pos]) || input[pos] === '.')) {
        if (input[pos] === '.') {
          if (hasDecimal) break; // Second decimal point — stop
          hasDecimal = true;
        }
        pos++;
      }

      const value = input.slice(start, pos);
      tokens.push(createToken(TokenType.NUMBER, value, start, pos));
      continue;
    }

    // ── Identifiers (variables) ──
    if (/[a-zA-Z_]/.test(char)) {
      const start = pos;

      while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos])) {
        pos++;
      }

      const value = input.slice(start, pos);
      tokens.push(createToken(TokenType.ID, value, start, pos));
      continue;
    }

    // ── Unexpected character ──
    return {
      tokens: [],
      error: `Unexpected character '${char}' at position ${pos}`,
      errorPos: pos,
    };
  }

  // Append the EOF token
  tokens.push(createToken(TokenType.EOF, 'EOF', pos, pos));

  return { tokens, error: null, errorPos: null };
}

/**
 * Returns a human-readable label for a token type.
 * Used in the UI to display token information.
 */
export function tokenTypeLabel(type) {
  const labels = {
    [TokenType.NUMBER]: 'Number',
    [TokenType.ID]:     'Identifier',
    [TokenType.PLUS]:   'Plus (+)',
    [TokenType.MINUS]:  'Minus (−)',
    [TokenType.STAR]:   'Multiply (×)',
    [TokenType.SLASH]:  'Divide (÷)',
    [TokenType.LPAREN]: 'Left Paren',
    [TokenType.RPAREN]: 'Right Paren',
    [TokenType.EOF]:    'End of Input',
  };
  return labels[type] || type;
}
