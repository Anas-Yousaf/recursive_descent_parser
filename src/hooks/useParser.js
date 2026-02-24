import { useState, useCallback } from 'react';
import { tokenize } from '../compiler/tokenizer';
import { parse } from '../compiler/parser';

/**
 * Custom hook that encapsulates all parsing logic.
 * Manages the state for input, tokens, parse tree, steps, and errors.
 */
export function useParser() {
    const [input, setInput] = useState('');
    const [tokens, setTokens] = useState([]);
    const [parseTree, setParseTree] = useState(null);
    const [steps, setSteps] = useState([]);
    const [error, setError] = useState(null);
    const [errorPos, setErrorPos] = useState(null);
    const [isParsed, setIsParsed] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleParse = useCallback(() => {
        // Clear previous results
        setError(null);
        setErrorPos(null);
        setParseTree(null);
        setSteps([]);
        setTokens([]);
        setActiveStep(-1);
        setIsAnimating(false);

        if (!input.trim()) {
            setError('Please enter an expression to parse.');
            return;
        }

        // Step 1: Tokenize
        const { tokens: tokenResult, error: tokenError, errorPos: tokenErrorPos } = tokenize(input);

        if (tokenError) {
            setError(tokenError);
            setErrorPos(tokenErrorPos);
            setIsParsed(false);
            return;
        }

        setTokens(tokenResult);

        // Step 2: Parse
        const { tree, steps: parseSteps, error: parseError, errorPos: parseErrorPos } = parse(tokenResult);

        setSteps(parseSteps);

        if (parseError) {
            setError(parseError);
            setErrorPos(parseErrorPos);
            setIsParsed(true);
            return;
        }

        setParseTree(tree);
        setIsParsed(true);
    }, [input]);

    const handleReset = useCallback(() => {
        setInput('');
        setTokens([]);
        setParseTree(null);
        setSteps([]);
        setError(null);
        setErrorPos(null);
        setIsParsed(false);
        setActiveStep(-1);
        setIsAnimating(false);
    }, []);

    const animateSteps = useCallback(() => {
        if (steps.length === 0) return;

        setIsAnimating(true);
        setActiveStep(0);

        let stepIndex = 0;
        const interval = setInterval(() => {
            stepIndex++;
            if (stepIndex >= steps.length) {
                clearInterval(interval);
                setIsAnimating(false);
                setActiveStep(steps.length - 1);
                return;
            }
            setActiveStep(stepIndex);
        }, 600);

        return () => clearInterval(interval);
    }, [steps]);

    return {
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
    };
}
