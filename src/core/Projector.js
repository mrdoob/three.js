/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Projector = function () {

	this.projectVector = function ( vector, camera ) {

		var viewProjectionMatrix = new THREE.Matrix4();

		return function ( vector, camera ) {

			camera.matrixWorldInverse.getInverse( camera.matrixWorld );

			viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

			return vector.applyProjection( viewProjectionMatrix );

		};

	}();

	this.unprojectVector = function () {

		var projectionMatrixInverse = new THREE.Matrix4();
		var viewProjectionMatrix = new THREE.Matrix4();

		return function ( vector, camera ) {

			projectionMatrixInverse.getInverse( camera.projectionMatrix );
			viewProjectionMatrix.multiplyMatrices( camera.matrixWorld, projectionMatrixInverse );

			return vector.applyProjection( viewProjectionMatrix );

		};

	}();

	this.pickingRay = function ( vector, camera ) {

		// set two vectors with opposing z values
		vector.z = - 1.0;
		var end = new THREE.Vector3( vector.x, vector.y, 1.0 );

		this.unprojectVector( vector, camera );
		this.unprojectVector( end, camera );

		// find direction from vector to end
		end.sub( vector ).normalize();

		return new THREE.Raycaster( vector, end );

	};

};
