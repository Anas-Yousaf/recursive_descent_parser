import { useMemo, useRef, useEffect, useState } from 'react';
import { computeTreeLayout } from '../compiler/treeLayout';
import './ParseTreeView.css';

/**
 * ParseTreeView Component
 * 
 * Renders the parse tree as an interactive SVG visualization.
 * Features:
 *  - Animated node appearance
 *  - Color-coded nodes (non-terminals, terminals, operators, epsilon)
 *  - Curved edge connections
 *  - Pan and zoom support
 *  - Responsive sizing
 */
export default function ParseTreeView({ tree }) {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const [animationPhase, setAnimationPhase] = useState(0);

    // Compute the tree layout
    const layout = useMemo(() => {
        if (!tree) return null;
        return computeTreeLayout(tree);
    }, [tree]);

    // Trigger staggered animation
    useEffect(() => {
        if (!layout) return;
        setAnimationPhase(0);
        const timer = setTimeout(() => setAnimationPhase(1), 100);
        return () => clearTimeout(timer);
    }, [layout]);

    // Responsive container sizing
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!tree || !layout) {
        return (
            <div className="parse-tree-empty">
                <div className="empty-tree-icon">🌳</div>
                <p>Parse tree will appear here</p>
            </div>
        );
    }

    // Calculate viewBox to fit the tree
    const padding = 40;
    const viewBoxWidth = Math.max(layout.width + padding * 2, dimensions.width);
    const viewBoxHeight = Math.max(layout.height + padding * 2, 400);

    // Offset to center the tree
    const offsetX = Math.max((viewBoxWidth - layout.width) / 2, padding);
    const offsetY = padding;

    return (
        <div className="parse-tree-container" ref={containerRef}>
            <div className="section-header">
                <span className="section-icon">🌲</span>
                <h2>Parse Tree</h2>
            </div>

            <div className="tree-legend">
                <span className="legend-item">
                    <span className="legend-dot non-terminal"></span> Non-Terminal
                </span>
                <span className="legend-item">
                    <span className="legend-dot terminal"></span> Terminal
                </span>
                <span className="legend-item">
                    <span className="legend-dot operator"></span> Operator
                </span>
                <span className="legend-item">
                    <span className="legend-dot epsilon"></span> Epsilon (ε)
                </span>
            </div>

            <div className="tree-svg-wrapper">
                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className="tree-svg"
                    preserveAspectRatio="xMidYMin meet"
                >
                    <defs>
                        {/* Gradient for non-terminal nodes */}
                        <linearGradient id="ntGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        {/* Gradient for terminal nodes */}
                        <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        {/* Gradient for operator nodes */}
                        <linearGradient id="opGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        {/* Gradient for epsilon nodes */}
                        <linearGradient id="epsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6b7280" />
                            <stop offset="100%" stopColor="#4b5563" />
                        </linearGradient>
                        {/* Drop shadow filter */}
                        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
                        </filter>
                        {/* Glow filter for active nodes */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Render edges */}
                    <g className="tree-edges">
                        {layout.edges.map((edge, index) => {
                            const x1 = edge.from.x + offsetX;
                            const y1 = edge.from.y + offsetY;
                            const x2 = edge.to.x + offsetX;
                            const y2 = edge.to.y + offsetY;
                            const midY = (y1 + y2) / 2;

                            return (
                                <path
                                    key={`edge-${index}`}
                                    d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                                    className={`tree-edge ${animationPhase > 0 ? 'visible' : ''}`}
                                    style={{ animationDelay: `${index * 50 + 200}ms` }}
                                />
                            );
                        })}
                    </g>

                    {/* Render nodes */}
                    <g className="tree-nodes">
                        {layout.nodes.map((node, index) => {
                            const cx = node.x + offsetX;
                            const cy = node.y + offsetY;

                            let fillGradient = 'url(#ntGrad)';
                            let nodeClass = 'non-terminal';
                            let radius = 22;

                            if (node.isEpsilon) {
                                fillGradient = 'url(#epsGrad)';
                                nodeClass = 'epsilon';
                                radius = 16;
                            } else if (node.isOperator) {
                                fillGradient = 'url(#opGrad)';
                                nodeClass = 'operator';
                                radius = 18;
                            } else if (node.isLeaf && !node.isNonTerminal) {
                                fillGradient = 'url(#tGrad)';
                                nodeClass = 'terminal';
                                radius = 20;
                            }

                            return (
                                <g
                                    key={`node-${node.id}`}
                                    className={`tree-node ${nodeClass} ${animationPhase > 0 ? 'visible' : ''}`}
                                    style={{ animationDelay: `${index * 60 + 100}ms` }}
                                >
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={radius}
                                        fill={fillGradient}
                                        filter="url(#dropShadow)"
                                        className="node-circle"
                                    />
                                    <text
                                        x={cx}
                                        y={cy}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="node-label"
                                        fontSize={node.label.length > 2 ? '10' : '13'}
                                    >
                                        {node.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
}
