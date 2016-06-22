/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "Object3D" );

var RadToDeg = 180 / Math.PI;

test( "rotateX", function() {
	var obj = new THREE.Object3D();

	var angleInRad = 1.562;
	obj.rotateX(angleInRad);

	// should calculate the correct rotation on x
	checkIfFloatsAreEqual(obj.rotation.x, angleInRad);
});

test( "rotateY", function() {
	var obj = new THREE.Object3D();

	var angleInRad = -0.346;
	obj.rotateY(angleInRad);

	// should calculate the correct rotation on y
	checkIfFloatsAreEqual(obj.rotation.y, angleInRad);
});

test( "rotateZ", function() {
	var obj = new THREE.Object3D();

	var angleInRad = 1;
	obj.rotateZ(angleInRad);

	// should calculate the correct rotation on y
	checkIfFloatsAreEqual(obj.rotation.z, angleInRad);
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

	ok( obj.rotation.x * RadToDeg === 45 , "x is equal" );
});

test( "getWorldRotation", function() {
	var obj = new THREE.Object3D();

	obj.lookAt(new THREE.Vector3(0, -1, 1));
	ok( obj.getWorldRotation().x * RadToDeg === 45 , "x is equal" );

	obj.lookAt(new THREE.Vector3(1, 0, 0));
	ok( obj.getWorldRotation().y * RadToDeg === 90 , "y is equal" );
});

function checkIfPropsAreEqual(reference, obj) {
	ok( obj.x === reference.x , "x is equal" );
	ok( obj.y === reference.y , "y is equal!" );
	ok( obj.z === reference.z , "z is equal!" );
}

// since float equal checking is a mess in js, one solution is to cut off
// decimal places
function checkIfFloatsAreEqual(f1, f2) {
	var f1Rounded = ((f1 * 1000) | 0) / 1000;
	var f2Rounded = ((f2 * 1000) | 0) / 1000;

	ok( f1Rounded === f2Rounded, "passed" );
}
