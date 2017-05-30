
THREE.QuadTree = function (options) {

    this.name = options.name;
    this.position = options.corner;
    this.widthDir = options.widthDir;
    this.heightDir = options.heightDir;
    this.planet = options.planet;

    this.rootNode = new THREE.TreeNode({ parent: undefined, level: 0, tree: this, position: this.position });
};

THREE.QuadTree.prototype.update = function () {
    this.rootNode.update();
};

THREE.QuadTree.prototype.AssignNeighbors = function (left, top, right, bottom) {
    this.rootNode.leftNeighbor = left;
    this.rootNode.topNeighbor = top;
    this.rootNode.rightNeighbor = right;
    this.rootNode.bottomNeighbor = bottom;
};

