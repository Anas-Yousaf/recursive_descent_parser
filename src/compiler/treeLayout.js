/**
 * ============================================================
 * PARSE TREE LAYOUT ENGINE
 * ============================================================
 * 
 * Computes x,y coordinates for each node in the parse tree
 * so it can be rendered as a clean, non-overlapping SVG tree.
 * 
 * Uses a simplified Reingold–Tilford algorithm approach:
 *   1. Post-order traversal to assign initial x positions
 *   2. Centering parent nodes above their children
 *   3. Computing final positions with proper spacing
 * ============================================================
 */

const NODE_WIDTH = 60;
const NODE_HEIGHT = 50;
const LEVEL_HEIGHT = 80;
const MIN_SIBLING_SEP = 20;

/**
 * Computes layout positions for all nodes in the tree.
 * 
 * @param {Object} root - The root node of the parse tree
 * @returns {{ nodes: Array, edges: Array, width: number, height: number }}
 *   nodes: Array of { id, label, x, y, depth }
 *   edges: Array of { from: {x,y}, to: {x,y}, fromId, toId }
 *   width:  Total width of the tree layout
 *   height: Total height of the tree layout
 */
export function computeTreeLayout(root) {
    if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

    // Step 1: Assign depth and count leaves
    assignDepth(root, 0);

    // Step 2: Assign x positions using post-order traversal
    let nextX = 0;
    assignX(root);

    function assignX(node) {
        if (!node.children || node.children.length === 0) {
            // Leaf node
            node._x = nextX;
            nextX += NODE_WIDTH + MIN_SIBLING_SEP;
            return;
        }

        // Process children first
        for (const child of node.children) {
            assignX(child);
        }

        // Center parent above children
        const firstChild = node.children[0];
        const lastChild = node.children[node.children.length - 1];
        node._x = (firstChild._x + lastChild._x) / 2;
    }

    // Step 3: Collect nodes and edges
    const nodes = [];
    const edges = [];
    let maxX = 0;
    let maxDepth = 0;

    function collect(node) {
        const x = node._x + NODE_WIDTH / 2;
        const y = node._depth * LEVEL_HEIGHT + NODE_HEIGHT / 2 + 20;

        nodes.push({
            id: node.id,
            label: node.label,
            x,
            y,
            depth: node._depth,
            isLeaf: !node.children || node.children.length === 0,
            isEpsilon: node.label === 'ε',
            isOperator: ['+', '-', '*', '/', '(', ')'].includes(node.label),
            isNonTerminal: ["E", "E'", "T", "T'", "F"].includes(node.label),
        });

        if (x > maxX) maxX = x;
        if (node._depth > maxDepth) maxDepth = node._depth;

        if (node.children) {
            for (const child of node.children) {
                const childX = child._x + NODE_WIDTH / 2;
                const childY = child._depth * LEVEL_HEIGHT + NODE_HEIGHT / 2 + 20;

                edges.push({
                    fromId: node.id,
                    toId: child.id,
                    from: { x, y: y + 18 },
                    to: { x: childX, y: childY - 18 },
                });

                collect(child);
            }
        }
    }

    collect(root);

    return {
        nodes,
        edges,
        width: maxX + NODE_WIDTH + 40,
        height: (maxDepth + 1) * LEVEL_HEIGHT + 60,
    };
}

/**
 * Recursively assigns depth values to tree nodes.
 */
function assignDepth(node, d) {
    node._depth = d;
    if (node.children) {
        for (const child of node.children) {
            assignDepth(child, d + 1);
        }
    }
}
