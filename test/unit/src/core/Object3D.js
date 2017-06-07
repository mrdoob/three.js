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

QUnit.test( "add" , function( assert ) {
	assert.expect( 16 );

	var parent = new THREE.Object3D();
	var child = new THREE.Object3D();

	function parentAdd( evt ) {
		assert.success( "parent dispatches 'childAdded' event when adding a child" );
		assert.strictEqual( evt.child, child, "childAdded event passes child object" );
		assert.strictEqual( parent.children[0], child, "parent has child when 'add' event dispatched" );
		assert.strictEqual( parent, child.parent, "child has parent when 'add' event dispatched" );
	}

	function parentRemove( evt ) {
		assert.success( "parent dispatches 'childRemoved' event when removing a child" );
		assert.strictEqual( evt.child, child, "childRemoved event passes child object" );
		assert.strictEqual( parent.children.length, 0, "child removed from parent when 'remove' event dispatched" );
		assert.strictEqual( child.parent, null, "child has no parent when 'remove' event dispatched" );
	}

	function childAdd() {
		assert.success( "child dispatches 'added' event when adding to a parent object" );
		assert.strictEqual( parent.children[0], child, "parent has child when 'added' event dispatched" );
		assert.strictEqual( parent, child.parent, "child has parent when 'added' event dispatched" );
	}

	function childRemove() {
		assert.success( "child dispatches 'removed' event when removing from parent" );
		assert.strictEqual( parent.children.length, 0, "child removed from parent when 'removed' event dispatched" );
		assert.strictEqual( child.parent, null, "child has no parent when 'removed' event dispatched" );
	}

	parent.addEventListener( "childAdded", parentAdd );
	parent.addEventListener( "childRemoved", parentRemove );
	child.addEventListener( "added", childAdd );
	child.addEventListener( "removed", childRemove );

	parent.add( child );
	assert.strictEqual( parent.children[0], child, "parent has child after parent.add( child )" );
	assert.strictEqual( parent, child.parent, "child has parent after parent.add( child )" );

	parent.remove( child );

	// clean up
	parent.removeEventListener( "childAdded", parentAdd );
	parent.removeEventListener( "childRemoved", parentRemove );
	child.removeEventListener( "add", childAdd );
	child.removeEventListener( "removed", childRemove );
});
