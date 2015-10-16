/**
 * @author Max Strater, Autodesk, Inc. / http://www.autodesk.com/
 *
 * A mesh that always faces a specified point (usually a camera).
 * Optionally, the mesh can be constrained to a specified axis.
 * If so, it will face the specified point as much as possible while remaining aligned with the axis.
 * If not constrained, the axis can be used as a custom up vector for the mesh.
 * Requires a call to the update method after each change.
 * Based on http://nehe.gamedev.net/article/billboarding_how_to/18011/
 */

// expects a normalized axis
THREE.BillboardMesh = function ( geometry, material, point, axis, constrainedToAxis ) {

	THREE.Mesh.call( this, geometry, material );

	this.point = point;
	this.axis = axis || this.up;
	this.constrained = constrainedToAxis || false;

};

THREE.BillboardMesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.BillboardMesh.prototype.constructor = THREE.BillboardMesh;

THREE.BillboardMesh.prototype.update = function () {

	function rotateMesh( mesh, towardPoint, up ) {

		mesh.up = up;
		mesh.lookAt( towardPoint );

	}

	var look = new THREE.Vector3();
	var right = new THREE.Vector3();

	function rotateAxialConstrainedMesh( mesh, towardPoint, axis ) {

		var meshPosition = mesh.position.clone();
		look.subVectors( towardPoint, meshPosition );
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

	return function () {

		if ( this.constrained ) {

			rotateAxialConstrainedMesh(this, this.point, this.axis);

		} else {

			rotateMesh(this, this.point, this.axis);

		}

	}

}();
