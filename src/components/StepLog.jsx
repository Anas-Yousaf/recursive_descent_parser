import './StepLog.css';

/**
 * StepLog Component
 * 
 * Displays the step-by-step parsing actions as an animated log.
 * Each step shows:
 *  - The grammar rule being applied
 *  - The action taken (enter, exit, match, epsilon)
 *  - The current lookahead token
 *  - The recursion depth (visualized as indentation)
 */
export default function StepLog({ steps, activeStep, onStepClick }) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="step-log-container">
            <div className="section-header">
                <span className="section-icon">📋</span>
                <h2>Parsing Steps</h2>
                <span className="step-counter">{steps.length} steps</span>
            </div>
            <div className="step-log-scroll">
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isPast = index < activeStep;
                    const isError = step.action.includes('Error');
                    const isSuccess = step.action.includes('successfully');
                    const isEpsilon = step.action.includes('Epsilon');
                    const isMatch = step.action.includes('Match');
                    const isEnter = step.action.includes('Enter');
                    const isExit = step.action.includes('Exit');

                    let stepClass = 'step-item';
                    if (isActive) stepClass += ' active';
                    if (isPast) stepClass += ' past';
                    if (isError) stepClass += ' error';
                    if (isSuccess) stepClass += ' success';

                    let actionIcon = '▶';
                    if (isMatch) actionIcon = '✅';
                    if (isEpsilon) actionIcon = '⚡';
                    if (isEnter) actionIcon = '📥';
                    if (isExit) actionIcon = '📤';
                    if (isError) actionIcon = '❌';
                    if (isSuccess) actionIcon = '🎉';

                    return (
                        <div
                            key={index}
                            className={stepClass}
                            onClick={() => onStepClick && onStepClick(index)}
                            style={{
                                paddingLeft: `${step.depth * 16 + 16}px`,
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            <div className="step-depth-indicator">
                                {Array.from({ length: step.depth }, (_, i) => (
                                    <span key={i} className="depth-line" />
                                ))}
                            </div>
                            <span className="step-icon">{actionIcon}</span>
                            <div className="step-content">
                                <span className="step-rule">{step.rule}</span>
                                <span className="step-action">{step.action}</span>
                            </div>
                            {step.token && step.token !== 'EOF' && (
                                <span className="step-token">
                                    <span className="token-label">lookahead:</span> {step.token}
                                </span>
                            )}
                            <span className="step-number">#{index + 1}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
