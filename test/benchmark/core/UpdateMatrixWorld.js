(function() {

  THREE = Bench.THREE;

  var position = new THREE.Vector3(1, 1, 1);
  var scale = new THREE.Vector3(2, 1, 0.5);
  var rotation = new THREE.Quaternion();
  rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
  var createLocallyOffsetChild = function() {
    var child = new THREE.Object3D();
    child.position.copy(position);
    child.scale.copy(scale);
    child.rotation.copy(rotation);
    return child;
  };

  var generateSceneGraph = function(root, depth, breadth, initObject) {
    if (depth > 0) {
      for (var i = 0; i < breadth; i++) {
        var child = initObject();
        root.add(child);
        generateSceneGraph(child, depth - 1, breadth, initObject);
      }
    }
    return root;
  };

  var nodeCount = function(root) {
    return root.children.reduce(function(acc, x) { return acc + nodeCount(x); }, 1);
  };

  var rootA = generateSceneGraph(new THREE.Object3D(), 100, 1, createLocallyOffsetChild);
  var rootB = generateSceneGraph(new THREE.Object3D(), 3, 10, createLocallyOffsetChild);
  var rootC = generateSceneGraph(new THREE.Object3D(), 9, 3, createLocallyOffsetChild);

  var s = Bench.newSuite("Update world transforms");

  s.add('Update graph depth=100, breadth=1 (' + nodeCount(rootA) + ' nodes)', function() {
    rootA.updateMatrixWorld(true);
  });
  s.add('Update graph depth=3, breadth=10 (' + nodeCount(rootB) + ' nodes)', function() {
    rootB.updateMatrixWorld(true);
  });
  s.add('Update graph depth=9, breadth=3 (' + nodeCount(rootC) + ' nodes)', function() {
    rootC.updateMatrixWorld(true);
  });

})();
