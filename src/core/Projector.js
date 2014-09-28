/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Projector = function () {

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.projectCamera().' );

		vector.projectCamera( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unprojectCamera().' );

		vector.unprojectCamera( camera );

	};

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
