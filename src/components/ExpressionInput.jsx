import './ExpressionInput.css';

/**
 * ExpressionInput Component
 * 
 * The main input area where users type arithmetic expressions.
 * Features:
 *  - Syntax-highlighted input display
 *  - Error position highlighting
 *  - Example expression buttons
 *  - Parse and Reset action buttons
 */

const EXAMPLES = [
    { label: '(3+5)*2', value: '(3+5)*2' },
    { label: 'a+b*c', value: 'a+b*c' },
    { label: '(x+y)/(a-b)', value: '(x+y)/(a-b)' },
    { label: '42', value: '42' },
    { label: '2*(3+4)-5/1', value: '2*(3+4)-5/1' },
    { label: '((a+b))', value: '((a+b))' },
];

export default function ExpressionInput({
    input,
    onInputChange,
    onParse,
    onReset,
    onAnimate,
    error,
    errorPos,
    isParsed,
    isAnimating,
    hasSteps,
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onParse();
        }
    };

    return (
        <div className="input-container">
            <div className="section-header">
                <span className="section-icon">⌨️</span>
                <h2>Enter Expression</h2>
            </div>

            <div className="input-area">
                <div className={`input-wrapper ${error ? 'has-error' : ''} ${isParsed && !error ? 'success' : ''}`}>
                    <input
                        id="expression-input"
                        type="text"
                        className="expression-input"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type an expression, e.g. (3+5)*2"
                        spellCheck={false}
                        autoComplete="off"
                    />
                    {isParsed && !error && (
                        <span className="input-check">✓</span>
                    )}
                </div>

                <div className="button-group">
                    <button
                        id="parse-button"
                        className="btn btn-primary"
                        onClick={onParse}
                        disabled={isAnimating}
                    >
                        <span className="btn-icon">▶</span>
                        Parse
                    </button>

                    {hasSteps && (
                        <button
                            id="animate-button"
                            className="btn btn-secondary"
                            onClick={onAnimate}
                            disabled={isAnimating}
                        >
                            <span className="btn-icon">🎬</span>
                            {isAnimating ? 'Animating...' : 'Animate Steps'}
                        </button>
                    )}

                    <button
                        id="reset-button"
                        className="btn btn-ghost"
                        onClick={onReset}
                    >
                        <span className="btn-icon">↺</span>
                        Reset
                    </button>
                </div>
            </div>

            {/* Example chips */}
            <div className="examples-row">
                <span className="examples-label">Try:</span>
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex.value}
                        className="example-chip"
                        onClick={() => onInputChange(ex.value)}
                    >
                        {ex.label}
                    </button>
                ))}
            </div>

            {/* Error message */}
            {error && (
                <div className="error-message" id="error-display">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
