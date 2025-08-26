// AVL Tree implementation with visualization

class Node {
  constructor(value, x = 0, y = 0) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = x;
    this.y = y;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  // Helper functions
  height(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  getBalance(node) {
    return node ? this.height(node.left) - this.height(node.right) : 0;
  }

  rotateRight(y) {
    let x = y.left;
    let T2 = x.right;
    x.right = y;
    y.left = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateLeft(x) {
    let y = x.right;
    let T2 = y.left;
    y.left = x;
    x.right = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  insert(node, value, path = []) {
    if (!node) return new Node(value);

    // Add current node to traversal path
    if (path) path.push(node.value);

    // For the specific scenario where we're inserting 34 with 45 and 100 present,
    // we need to ensure proper traversal visualization
    if (value < node.value) {
      // We go left
      node.left = this.insert(node.left, value, path);
    } else if (value > node.value) {
      // We go right
      node.right = this.insert(node.right, value, path);
    } else return node; // No duplicates
    this.updateHeight(node);
    let balance = this.getBalance(node);
    // Left Left
    if (balance > 1 && value < node.left.value) return this.rotateRight(node);
    // Right Right
    if (balance < -1 && value > node.right.value) return this.rotateLeft(node);
    // Left Right
    if (balance > 1 && value > node.left.value) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    // Right Left
    if (balance < -1 && value < node.right.value) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }

  minValueNode(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  delete(node, value, path = []) {
    if (!node) return node;

    // Add current node to traversal path
    if (path) path.push(node.value);

    if (value < node.value) node.left = this.delete(node.left, value, path);
    else if (value > node.value)
      node.right = this.delete(node.right, value, path);
    else {
      if (!node.left || !node.right) {
        node = node.left ? node.left : node.right;
      } else {
        let temp = this.minValueNode(node.right);
        // Mark this special case in traversal
        if (path) path.push(-temp.value); // Use negative to mark replacement
        node.value = temp.value;
        node.right = this.delete(node.right, temp.value, path);
      }
    }
    if (!node) return node;
    this.updateHeight(node);
    let balance = this.getBalance(node);
    // Left Left
    if (balance > 1 && this.getBalance(node.left) >= 0)
      return this.rotateRight(node);
    // Left Right
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    // Right Right
    if (balance < -1 && this.getBalance(node.right) <= 0)
      return this.rotateLeft(node);
    // Right Left
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }

  insertValue(value) {
    const path = [];
    this.root = this.insert(this.root, value, path);
    animateTraversal(path, value, "insert");
  }

  deleteValue(value) {
    const path = [];
    this.root = this.delete(this.root, value, path);
    animateTraversal(path, value, "delete");
  }
}

// Visualization
const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");
const tree = new AVLTree();

function insertValue() {
  const input = document.getElementById("valueInput");
  const value = parseInt(input.value);
  if (!isNaN(value)) tree.insertValue(value);
  input.value = "";
  input.focus();
}

function deleteValue() {
  const input = document.getElementById("valueInput");
  const value = parseInt(input.value);
  if (!isNaN(value)) tree.deleteValue(value);
  input.value = "";
  input.focus();
}

function drawTree(highlightedNodes = [], targetValue = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!tree.root) return;
  const levelGap = 70;
  const nodeGap = 40;
  let maxLevel = 0;
  function setPositions(node, depth, x) {
    if (!node) return x;
    x = setPositions(node.left, depth + 1, x);
    node.x = x;
    node.y = depth * levelGap + 50;
    maxLevel = Math.max(maxLevel, depth);
    x += nodeGap;
    x = setPositions(node.right, depth + 1, x);
    return x;
  }
  setPositions(tree.root, 0, 60);

  // Draw connections first (so they're behind nodes)
  function drawConnections(node) {
    if (!node) return;
    if (node.left) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.left.x, node.left.y);
      ctx.strokeStyle = "#90caf9";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (node.right) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.right.x, node.right.y);
      ctx.strokeStyle = "#90caf9";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    drawConnections(node.left);
    drawConnections(node.right);
  }

  // Draw nodes on top
  function drawNode(node) {
    if (!node) return;

    // Check if this node is highlighted in the traversal path
    const isHighlighted = highlightedNodes.includes(node.value);
    // Check if this node is the target (where insertion/deletion happens)
    const isTarget = targetValue !== null && node.value === targetValue;
    // Check if this node is a replacement in delete operation
    const isReplacement = highlightedNodes.includes(-node.value);

    // Add an explanation tooltip near the node if it's highlighted
    if (isHighlighted || isTarget || isReplacement) {
      let label = "";
      if (isTarget) label = "Target";
      else if (isReplacement) label = "Replacement";
      else if (isHighlighted) label = "Visited";

      ctx.font = "12px Arial";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.fillText(label, node.x, node.y - 25);
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);

    // Style based on node state
    if (isTarget) {
      // Target node - green highlight
      ctx.fillStyle = "#4caf50";
      ctx.shadowColor = "#2e7d32";
      ctx.shadowBlur = 15;
    } else if (isReplacement) {
      // Replacement node - purple highlight
      ctx.fillStyle = "#9c27b0";
      ctx.shadowColor = "#6a1b9a";
      ctx.shadowBlur = 15;
    } else if (isHighlighted) {
      // Traversal path - yellow highlight
      ctx.fillStyle = "#ffd54f";
      ctx.shadowColor = "#ffa000";
      ctx.shadowBlur = 10;
    } else {
      // Normal node
      ctx.fillStyle = "#90caf9";
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#1976d2";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.value, node.x, node.y);

    drawNode(node.left);
    drawNode(node.right);
  }

  drawConnections(tree.root);
  drawNode(tree.root);
}

// Animation controls
let animationSpeed = 400; // ms between animation steps

function animateTraversal(path, targetValue, operation) {
  // Remove any negative values (from deletion replacement) for highlighting
  const displayPath = path.map((v) => Math.abs(v));
  let i = 0;

  // Create display to show step-by-step traversal order
  const traversalOrderDiv =
    document.getElementById("traversalOrder") || createTraversalDisplay();

  // Show traversal step by step
  function step() {
    if (i > path.length) {
      // Animation complete, draw the final tree
      setTimeout(() => {
        drawTree();
        traversalOrderDiv.innerHTML = `<strong>Traversal Complete:</strong> ${path
          .map((v) => Math.abs(v))
          .join(" → ")}`;
      }, animationSpeed);
      return;
    }

    const currentPath = displayPath.slice(0, i);
    drawTree(currentPath, targetValue);

    // Update traversal order display
    if (i > 0) {
      traversalOrderDiv.innerHTML = `<strong>Traversal Step ${i}:</strong> ${currentPath.join(
        " → "
      )}`;
    } else {
      traversalOrderDiv.innerHTML = `<strong>Starting Traversal...</strong>`;
    }

    i++;
    setTimeout(step, animationSpeed);
  }

  // Start animation
  step();
}

// Helper function to create the traversal order display
function createTraversalDisplay() {
  const div = document.createElement("div");
  div.id = "traversalOrder";
  div.className = "traversal-order";

  // Insert it after the controls div
  const controls = document.querySelector(".controls");
  controls.parentNode.insertBefore(div, controls.nextSibling);

  return div;
}

// Initial draw
// Initialize animation speed control
document.getElementById("speedSlider").addEventListener("input", function () {
  animationSpeed = parseInt(this.value);
  document.getElementById("speedValue").textContent = animationSpeed + "ms";
});

drawTree();
