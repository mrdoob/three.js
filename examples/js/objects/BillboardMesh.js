/**
 * @author Max Strater, Autodesk, Inc. / http://www.autodesk.com/
 *
 * A billboard mesh that faces a specified point, optionally constrained to an axis
 * Based on http://nehe.gamedev.net/article/billboarding_how_to/18011/
 */

// expects a normalized axis
THREE.BillboardMesh = function ( geometry, material, point, normalizedAxis, constrainedToAxis ) {

	THREE.Mesh.call( this, geometry, material );

	this.point = point;
	this.axis = normalizedAxis || this.up;
	this.constrained = constrainedToAxis || false;

};

THREE.BillboardMesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.BillboardMesh.prototype.constructor = THREE.BillboardMesh;

function rotateMesh( mesh, towardPoint, up ) {

	mesh.up.copy( up );
	mesh.lookAt( towardPoint );

}

function rotateAxialConstrainedMesh( mesh, towardPoint, axis ) {

	var meshPosition = mesh.position.clone();
	var look = new THREE.Vector3();
	look.subVectors( towardPoint, meshPosition );
	var right = new THREE.Vector3();
	right.crossVectors( axis, look ).normalize();
	look.crossVectors( right, axis ).normalize();
	mesh.matrix.set(
		right.x, axis.x, look.x, meshPosition.x,
		right.y, axis.y, look.y, meshPosition.y,
		right.z, axis.z, look.z, meshPosition.z,
		0,       0,      0,      1
	);
	mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

}

THREE.BillboardMesh.prototype.update = function () {

	if ( this.constrained ) {

		rotateAxialConstrainedMesh( this, this.point, this.axis );

	} else {

		rotateMesh( this, this.point, this.axis );

	}

};
