"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TypedArrayUtils = void 0;
var TypedArrayUtils = {};
THREE.TypedArrayUtils = TypedArrayUtils;

TypedArrayUtils.quicksortIP = function (arr, eleSize, orderElement) {
  var stack = [];
  var sp = -1;
  var left = 0;
  var right = arr.length / eleSize - 1;
  var tmp = 0.0,
      x = 0,
      y = 0;

  var swapF = function swapF(a, b) {
    a *= eleSize;
    b *= eleSize;

    for (y = 0; y < eleSize; y++) {
      tmp = arr[a + y];
      arr[a + y] = arr[b + y];
      arr[b + y] = tmp;
    }
  };

  var i,
      j,
      swap = new Float32Array(eleSize),
      temp = new Float32Array(eleSize);

  while (true) {
    if (right - left <= 25) {
      for (j = left + 1; j <= right; j++) {
        for (x = 0; x < eleSize; x++) {
          swap[x] = arr[j * eleSize + x];
        }

        i = j - 1;

        while (i >= left && arr[i * eleSize + orderElement] > swap[orderElement]) {
          for (x = 0; x < eleSize; x++) {
            arr[(i + 1) * eleSize + x] = arr[i * eleSize + x];
          }

          i--;
        }

        for (x = 0; x < eleSize; x++) {
          arr[(i + 1) * eleSize + x] = swap[x];
        }
      }

      if (sp == -1) break;
      right = stack[sp--];
      left = stack[sp--];
    } else {
      var median = left + right >> 1;
      i = left + 1;
      j = right;
      swapF(median, i);

      if (arr[left * eleSize + orderElement] > arr[right * eleSize + orderElement]) {
        swapF(left, right);
      }

      if (arr[i * eleSize + orderElement] > arr[right * eleSize + orderElement]) {
        swapF(i, right);
      }

      if (arr[left * eleSize + orderElement] > arr[i * eleSize + orderElement]) {
        swapF(left, i);
      }

      for (x = 0; x < eleSize; x++) {
        temp[x] = arr[i * eleSize + x];
      }

      while (true) {
        do {
          i++;
        } while (arr[i * eleSize + orderElement] < temp[orderElement]);

        do {
          j--;
        } while (arr[j * eleSize + orderElement] > temp[orderElement]);

        if (j < i) break;
        swapF(i, j);
      }

      for (x = 0; x < eleSize; x++) {
        arr[(left + 1) * eleSize + x] = arr[j * eleSize + x];
        arr[j * eleSize + x] = temp[x];
      }

      if (right - i + 1 >= j - left) {
        stack[++sp] = i;
        stack[++sp] = right;
        right = j - 1;
      } else {
        stack[++sp] = left;
        stack[++sp] = j - 1;
        left = i;
      }
    }
  }

  return arr;
};

TypedArrayUtils.Kdtree = function (points, metric, eleSize) {
  var scope = this;
  var maxDepth = 0;

  var getPointSet = function getPointSet(points, pos) {
    return points.subarray(pos * eleSize, pos * eleSize + eleSize);
  };

  function buildTree(points, depth, parent, pos) {
    var dim = depth % eleSize,
        median,
        node,
        plength = points.length / eleSize;
    if (depth > maxDepth) maxDepth = depth;
    if (plength === 0) return null;

    if (plength === 1) {
      return new scope.Node(getPointSet(points, 0), depth, parent, pos);
    }

    TypedArrayUtils.quicksortIP(points, eleSize, dim);
    median = Math.floor(plength / 2);
    node = new scope.Node(getPointSet(points, median), depth, parent, median + pos);
    node.left = buildTree(points.subarray(0, median * eleSize), depth + 1, node, pos);
    node.right = buildTree(points.subarray((median + 1) * eleSize, points.length), depth + 1, node, pos + median + 1);
    return node;
  }

  this.root = buildTree(points, 0, null, 0);

  this.getMaxDepth = function () {
    return maxDepth;
  };

  this.nearest = function (point, maxNodes, maxDistance) {
    var i, result, bestNodes;
    bestNodes = new TypedArrayUtils.Kdtree.BinaryHeap(function (e) {
      return -e[1];
    });

    function nearestSearch(node) {
      var bestChild,
          dimension = node.depth % eleSize,
          ownDistance = metric(point, node.obj),
          linearDistance = 0,
          otherChild,
          i,
          linearPoint = [];

      function saveNode(node, distance) {
        bestNodes.push([node, distance]);

        if (bestNodes.size() > maxNodes) {
          bestNodes.pop();
        }
      }

      for (i = 0; i < eleSize; i += 1) {
        if (i === node.depth % eleSize) {
          linearPoint[i] = point[i];
        } else {
          linearPoint[i] = node.obj[i];
        }
      }

      linearDistance = metric(linearPoint, node.obj);

      if (node.right === null && node.left === null) {
        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }

        return;
      }

      if (node.right === null) {
        bestChild = node.left;
      } else if (node.left === null) {
        bestChild = node.right;
      } else {
        if (point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
        } else {
          bestChild = node.right;
        }
      }

      nearestSearch(bestChild);

      if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        saveNode(node, ownDistance);
      }

      if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
        if (bestChild === node.left) {
          otherChild = node.right;
        } else {
          otherChild = node.left;
        }

        if (otherChild !== null) {
          nearestSearch(otherChild);
        }
      }
    }

    if (maxDistance) {
      for (i = 0; i < maxNodes; i += 1) {
        bestNodes.push([null, maxDistance]);
      }
    }

    nearestSearch(scope.root);
    result = [];

    for (i = 0; i < maxNodes; i += 1) {
      if (bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0], bestNodes.content[i][1]]);
      }
    }

    return result;
  };
};

TypedArrayUtils.Kdtree.prototype.Node = function (obj, depth, parent, pos) {
  this.obj = obj;
  this.left = null;
  this.right = null;
  this.parent = parent;
  this.depth = depth;
  this.pos = pos;
};

TypedArrayUtils.Kdtree.BinaryHeap = function (scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
};

TypedArrayUtils.Kdtree.BinaryHeap.prototype = {
  push: function push(element) {
    this.content.push(element);
    this.bubbleUp(this.content.length - 1);
  },
  pop: function pop() {
    var result = this.content[0];
    var end = this.content.pop();

    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }

    return result;
  },
  peek: function peek() {
    return this.content[0];
  },
  remove: function remove(node) {
    var len = this.content.length;

    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        var end = this.content.pop();

        if (i != len - 1) {
          this.content[i] = end;

          if (this.scoreFunction(end) < this.scoreFunction(node)) {
            this.bubbleUp(i);
          } else {
            this.sinkDown(i);
          }
        }

        return;
      }
    }

    throw new Error("Node not found.");
  },
  size: function size() {
    return this.content.length;
  },
  bubbleUp: function bubbleUp(n) {
    var element = this.content[n];

    while (n > 0) {
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN];

      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        n = parentN;
      } else {
        break;
      }
    }
  },
  sinkDown: function sinkDown(n) {
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while (true) {
      var child2N = (n + 1) * 2,
          child1N = child2N - 1;
      var swap = null;

      if (child1N < length) {
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        if (child1Score < elemScore) swap = child1N;
      }

      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) swap = child2N;
      }

      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      } else {
        break;
      }
    }
  }
};