/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "Object3D" );

test( "rotateX", function() {
  var obj = new THREE.Object3D();

  // get a reference object for comparing
	var reference = obj.rotateOnAxis(new THREE.Vector3(1, 0, 0), 45).rotation;
  obj.rotateX(45);

	checkIfPropsAreEqual(reference, obj.rotation);
});

test( "rotateY", function() {
  var obj = new THREE.Object3D();

  // get a reference object for comparing
	var reference = obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), -25).rotation;
  obj.rotateY(45);

  checkIfPropsAreEqual(reference, obj.rotation);
});

test( "rotateZ", function() {
  var obj = new THREE.Object3D();

  // get a reference object for comparing
	var reference = obj.rotateOnAxis(new THREE.Vector3(0, 0, 1), 41.5324).rotation;
  obj.rotateZ(45);

	checkIfPropsAreEqual(reference, obj.rotation);
});

test( "rotateX -> y -> z -> x", function() {
  var obj = new THREE.Object3D();

  // get a reference object for comparing
	var reference = obj.rotateOnAxis(new THREE.Vector3(1, 0, 0), 10).rotation;
  obj.rotateX(10);

	checkIfPropsAreEqual(reference, obj.rotation);

  var reference = obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), -32.324).rotation;
  obj.rotateY(-32.324);

  checkIfPropsAreEqual(reference, obj.rotation);

  var reference = obj.rotateOnAxis(new THREE.Vector3(0, 0, 1), 12.4).rotation;
  obj.rotateZ(12.4);

  checkIfPropsAreEqual(reference, obj.rotation);

  var reference = obj.rotateOnAxis(new THREE.Vector3(1, 0, 0), 23).rotation;
  obj.rotateX(23);

  checkIfPropsAreEqual(reference, obj.rotation);
});

test( "translateOnAxis", function() {
  var obj = new THREE.Object3D();

  // get a reference object for comparing
	var reference = {x: 1, y: 1.23, z: -4.56};
  obj.translateOnAxis(new THREE.Vector3(1, 0, 0), 1);
  obj.translateOnAxis(new THREE.Vector3(0, 1, 0), 1.23);
  obj.translateOnAxis(new THREE.Vector3(0, 0, 1), -4.56);

  checkIfPropsAreEqual(reference, obj.position);
});

test( "translateX", function() {
  var obj = new THREE.Object3D();
  obj.translateX(1.234);

  ok( obj.position.x === 1.234 , "x is equal" );
});

test( "translateY", function() {
  var obj = new THREE.Object3D();
  obj.translateY(1.234);

  ok( obj.position.y === 1.234 , "y is equal" );
});

test( "translateZ", function() {
  var obj = new THREE.Object3D();
  obj.translateZ(1.234);

  ok( obj.position.z === 1.234 , "z is equal" );
});

test( "lookAt", function() {
  var obj = new THREE.Object3D();
  obj.lookAt(new THREE.Vector3(0, -1, 1));

  ok( obj.rotation.x * (180 / Math.PI) === 45 , "x is equal" );
});

test( "getWorldQuaternion", function() {
  var obj = new THREE.Object3D();

  obj.lookAt(new THREE.Vector3(0, -1, 1));
  ok( obj.getWorldRotation().x * (180 / Math.PI) === 45 , "x is equal" );

  obj.lookAt(new THREE.Vector3(1, 0, 0));
  ok( obj.getWorldRotation().y * (180 / Math.PI) === 90 , "y is equal" );
});

function checkIfPropsAreEqual(reference, obj) {
  ok( obj.x === reference.x , "x is equal" );
  ok( obj.y === reference.y , "y is equal!" );
  ok( obj.z === reference.z , "z is equal!" );
}
