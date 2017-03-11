/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "Object3D" );

var RadToDeg = 180 / Math.PI;

QUnit.test( "rotateX" , function( assert ) {
	var obj = new THREE.Object3D();

	var angleInRad = 1.562;
	obj.rotateX(angleInRad);

	assert.numEqual( obj.rotation.x, angleInRad, "x is equal" );
});

QUnit.test( "rotateY" , function( assert ) {
	var obj = new THREE.Object3D();

	var angleInRad = -0.346;
	obj.rotateY(angleInRad);

	assert.numEqual( obj.rotation.y, angleInRad, "y is equal" );
});

QUnit.test( "rotateZ" , function( assert ) {
	var obj = new THREE.Object3D();

	var angleInRad = 1;
	obj.rotateZ(angleInRad);

	assert.numEqual( obj.rotation.z, angleInRad, "z is equal" );
});

QUnit.test( "translateOnAxis" , function( assert ) {
	var obj = new THREE.Object3D();

	obj.translateOnAxis(new THREE.Vector3(1, 0, 0), 1);
	obj.translateOnAxis(new THREE.Vector3(0, 1, 0), 1.23);
	obj.translateOnAxis(new THREE.Vector3(0, 0, 1), -4.56);

	assert.propEqual( obj.position, { x: 1, y: 1.23, z: -4.56 } );
});

QUnit.test( "translateX" , function( assert ) {
	var obj = new THREE.Object3D();
	obj.translateX(1.234);

	assert.numEqual( obj.position.x, 1.234, "x is equal" );
});

QUnit.test( "translateY" , function( assert ) {
	var obj = new THREE.Object3D();
	obj.translateY(1.234);

	assert.numEqual( obj.position.y, 1.234, "y is equal" );
});

QUnit.test( "translateZ" , function( assert ) {
	var obj = new THREE.Object3D();
	obj.translateZ(1.234);

	assert.numEqual( obj.position.z, 1.234, "z is equal" );
});

QUnit.test( "lookAt" , function( assert ) {
	var obj = new THREE.Object3D();
	obj.lookAt(new THREE.Vector3(0, -1, 1));

	assert.numEqual( obj.rotation.x * RadToDeg, 45, "x is equal" );
});

QUnit.test( "getWorldRotation" , function( assert ) {
	var obj = new THREE.Object3D();

	obj.lookAt(new THREE.Vector3(0, -1, 1));
	assert.numEqual( obj.getWorldRotation().x * RadToDeg, 45, "x is equal" );

	obj.lookAt(new THREE.Vector3(1, 0, 0));
	assert.numEqual( obj.getWorldRotation().y * RadToDeg, 90, "y is equal" );
});
