import { useMemo } from 'react';
import ExpressionInput from './components/ExpressionInput';
import TokenTable from './components/TokenTable';
import StepLog from './components/StepLog';
import ParseTreeView from './components/ParseTreeView';
import GrammarReference from './components/GrammarReference';
import { useParser } from './hooks/useParser';
import './App.css';

/**
 * App — Root Component
 * 
 * Orchestrates the Recursive Descent Parser visualization tool.
 * Layout: Sidebar (Grammar + How It Works) | Main Content (Input, Tokens, Steps, Tree)
 */
export default function App() {
  const {
    input,
    setInput,
    tokens,
    parseTree,
    steps,
    error,
    errorPos,
    isParsed,
    activeStep,
    setActiveStep,
    isAnimating,
    handleParse,
    handleReset,
    animateSteps,
  } = useParser();

  // Determine active grammar rule from the current step
  const activeRule = useMemo(() => {
    if (activeStep >= 0 && activeStep < steps.length) {
      return steps[activeStep].rule;
    }
    return null;
  }, [activeStep, steps]);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-badge">
          <span className="header-badge-dot"></span>
          Compiler Construction — Educational Tool
        </div>
        <h1 className="app-title">
          Recursive Descent Parser
        </h1>
        <p className="app-subtitle">
          Interactive visualization of parsing arithmetic expressions using the
          {' '}<span className="grammar-inline">LL(1)</span>{' '}
          grammar with step-by-step derivation tracking
        </p>
      </header>

      {/* ── Main Layout ── */}
      <div className="app-container">
        <div className="main-grid">
          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <GrammarReference activeRule={activeRule} />

            {/* How It Works Card */}
            <div className="info-card">
              <div className="section-header">
                <span className="section-icon">💡</span>
                <h2>How It Works</h2>
              </div>
              <ul className="info-list">
                <li>
                  <span className="info-bullet">1.</span>
                  <span><strong>Lexical Analysis</strong> — The input string is broken into tokens (numbers, operators, parentheses, identifiers).</span>
                </li>
                <li>
                  <span className="info-bullet">2.</span>
                  <span><strong>Recursive Descent Parsing</strong> — The parser applies grammar rules top-down, starting from E, using one lookahead token.</span>
                </li>
                <li>
                  <span className="info-bullet">3.</span>
                  <span><strong>Parse Tree Construction</strong> — Each grammar derivation creates a node in the tree, forming a visual representation.</span>
                </li>
                <li>
                  <span className="info-bullet">4.</span>
                  <span><strong>Error Detection</strong> — The parser reports syntax errors with the exact position and expected token.</span>
                </li>
              </ul>
            </div>

            {/* Supported Expressions Card */}
            <div className="info-card">
              <div className="section-header">
                <span className="section-icon">✨</span>
                <h2>Supported Expressions</h2>
              </div>
              <ul className="info-list">
                <li>
                  <span className="info-bullet">•</span>
                  <span>Numbers: <code>42</code>, <code>3.14</code></span>
                </li>
                <li>
                  <span className="info-bullet">•</span>
                  <span>Identifiers: <code>x</code>, <code>foo</code>, <code>myVar</code></span>
                </li>
                <li>
                  <span className="info-bullet">•</span>
                  <span>Operators: <code>+</code> <code>-</code> <code>*</code> <code>/</code></span>
                </li>
                <li>
                  <span className="info-bullet">•</span>
                  <span>Parentheses: <code>( )</code> for grouping</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="main-content">
            {/* Input Section */}
            <ExpressionInput
              input={input}
              onInputChange={setInput}
              onParse={handleParse}
              onReset={handleReset}
              onAnimate={animateSteps}
              error={error}
              errorPos={errorPos}
              isParsed={isParsed}
              isAnimating={isAnimating}
              hasSteps={steps.length > 0}
            />

            {/* Tokens + Steps Side by Side */}
            {tokens.length > 0 && (
              <div className="results-grid">
                <TokenTable tokens={tokens} />
                <StepLog
                  steps={steps}
                  activeStep={activeStep}
                  onStepClick={setActiveStep}
                />
              </div>
            )}

            {/* Parse Tree */}
            <ParseTreeView tree={parseTree} />
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p className="footer-text">
          Recursive Descent Parser Visualization — BSCS Compiler Construction
        </p>
        <div className="footer-tech">
          <span className="tech-badge">React.js</span>
          <span className="tech-badge">Vite</span>
          <span className="tech-badge">ES6+</span>
          <span className="tech-badge">SVG</span>
        </div>
        <div className="footer-powered">
          <span className="powered-divider"></span>
          <p className="powered-text">
            Powered by{' '}
            <a
              href="https://dotandcrosstechnology.com"
              target="_blank"
              rel="noopener noreferrer"
              className="powered-link"
            >
              Dot and Cross Technology
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
