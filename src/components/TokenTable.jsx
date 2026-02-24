import { tokenTypeLabel } from '../compiler/tokenizer';
import './TokenTable.css';

/**
 * TokenTable Component
 * 
 * Displays the result of lexical analysis in a beautiful table.
 * Each token shows its type, value, and position in the input string.
 */
export default function TokenTable({ tokens }) {
    if (!tokens || tokens.length === 0) return null;

    // Filter out EOF for display
    const displayTokens = tokens.filter(t => t.type !== 'EOF');

    return (
        <div className="token-table-container">
            <div className="section-header">
                <span className="section-icon">🔤</span>
                <h2>Lexical Analysis (Tokens)</h2>
            </div>
            <div className="token-table-wrapper">
                <table className="token-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Token Type</th>
                            <th>Value</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayTokens.map((token, index) => (
                            <tr
                                key={index}
                                className={`token-row token-type-${token.type.toLowerCase()}`}
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                <td className="token-index">{index + 1}</td>
                                <td>
                                    <span className={`token-badge badge-${token.type.toLowerCase()}`}>
                                        {tokenTypeLabel(token.type)}
                                    </span>
                                </td>
                                <td className="token-value">{token.value}</td>
                                <td className="token-pos">{token.pos}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="token-summary">
                <span className="summary-badge">{displayTokens.length} tokens generated</span>
            </div>
        </div>
    );
}
