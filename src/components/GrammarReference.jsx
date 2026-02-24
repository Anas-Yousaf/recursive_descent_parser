import './GrammarReference.css';

/**
 * GrammarReference Component
 * 
 * Displays the grammar rules used by the parser.
 * Highlights the currently active rule during step-by-step animation.
 */

const GRAMMAR_RULES = [
    { lhs: 'E', rhs: "T E'", desc: 'Expression = Term followed by Expression-prime' },
    { lhs: "E'", rhs: "+ T E' | - T E' | ε", desc: 'Addition or subtraction (or nothing)' },
    { lhs: 'T', rhs: "F T'", desc: 'Term = Factor followed by Term-prime' },
    { lhs: "T'", rhs: "* F T' | / F T' | ε", desc: 'Multiplication or division (or nothing)' },
    { lhs: 'F', rhs: '( E ) | id | number', desc: 'Factor = parenthesized expr, identifier, or number' },
];

export default function GrammarReference({ activeRule }) {
    return (
        <div className="grammar-container">
            <div className="section-header">
                <span className="section-icon">📐</span>
                <h2>Grammar Rules</h2>
            </div>
            <div className="grammar-rules">
                {GRAMMAR_RULES.map((rule, index) => {
                    const isActive = activeRule && activeRule.includes(rule.lhs);
                    return (
                        <div
                            key={index}
                            className={`grammar-rule ${isActive ? 'active' : ''}`}
                        >
                            <div className="rule-production">
                                <span className="rule-lhs">{rule.lhs}</span>
                                <span className="rule-arrow">→</span>
                                <span className="rule-rhs">{rule.rhs}</span>
                            </div>
                            <div className="rule-desc">{rule.desc}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
