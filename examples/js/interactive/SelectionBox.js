/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * This is a class to check whether objects are in a selection area in 3D space
 */

THREE.SelectionBox = ( function () {

	var frustum = new THREE.Frustum();
	var center = new THREE.Vector3();

	var tmpPoint = new THREE.Vector3();

	var vecNear = new THREE.Vector3();
	var vecTopLeft = new THREE.Vector3();
	var vecTopRight = new THREE.Vector3();
	var vecDownRight = new THREE.Vector3();
	var vecDownLeft = new THREE.Vector3();

	var vectemp1 = new THREE.Vector3();
	var vectemp2 = new THREE.Vector3();
	var vectemp3 = new THREE.Vector3();

	function SelectionBox( camera, scene, deep ) {

		this.camera = camera;
		this.scene = scene;
		this.startPoint = new THREE.Vector3();
		this.endPoint = new THREE.Vector3();
		this.collection = [];
		this.deep = deep || Number.MAX_VALUE;

	}

	SelectionBox.prototype.select = function ( startPoint, endPoint ) {

		this.startPoint = startPoint || this.startPoint;
		this.endPoint = endPoint || this.endPoint;
		this.collection = [];

		this.updateFrustum( this.startPoint, this.endPoint );
		this.searchChildInFrustum( frustum, this.scene );

		return this.collection;

	};

	SelectionBox.prototype.updateFrustum = function ( startPoint, endPoint ) {

		startPoint = startPoint || this.startPoint;
		endPoint = endPoint || this.endPoint;

		this.camera.updateProjectionMatrix();
		this.camera.updateMatrixWorld();

		tmpPoint.copy( startPoint );
		tmpPoint.x = Math.min( startPoint.x, endPoint.x );
		tmpPoint.y = Math.max( startPoint.y, endPoint.y );
		endPoint.x = Math.max( startPoint.x, endPoint.x );
		endPoint.y = Math.min( startPoint.y, endPoint.y );

		vecNear.copy( this.camera.position );
		vecTopLeft.copy( tmpPoint );
		vecTopRight.set( endPoint.x, tmpPoint.y, 0 );
		vecDownRight.copy( endPoint );
		vecDownLeft.set( tmpPoint.x, endPoint.y, 0 );

		vecTopLeft.unproject( this.camera );
		vecTopRight.unproject( this.camera );
		vecDownRight.unproject( this.camera );
		vecDownLeft.unproject( this.camera );

		vectemp1.copy( vecTopLeft ).sub( vecNear );
		vectemp2.copy( vecTopRight ).sub( vecNear );
		vectemp3.copy( vecDownRight ).sub( vecNear );
		vectemp1.normalize();
		vectemp2.normalize();
		vectemp3.normalize();

		vectemp1.multiplyScalar( this.deep );
		vectemp2.multiplyScalar( this.deep );
		vectemp3.multiplyScalar( this.deep );
		vectemp1.add( vecNear );
		vectemp2.add( vecNear );
		vectemp3.add( vecNear );

		var planes = frustum.planes;

		planes[ 0 ].setFromCoplanarPoints( vecNear, vecTopLeft, vecTopRight );
		planes[ 1 ].setFromCoplanarPoints( vecNear, vecTopRight, vecDownRight );
		planes[ 2 ].setFromCoplanarPoints( vecDownRight, vecDownLeft, vecNear );
		planes[ 3 ].setFromCoplanarPoints( vecDownLeft, vecTopLeft, vecNear );
		planes[ 4 ].setFromCoplanarPoints( vecTopRight, vecDownRight, vecDownLeft );
		planes[ 5 ].setFromCoplanarPoints( vectemp3, vectemp2, vectemp1 );
		planes[ 5 ].normal.multiplyScalar( - 1 );

	};

	SelectionBox.prototype.searchChildInFrustum = function ( frustum, object ) {

		if ( object.isMesh ) {

			if ( object.material !== undefined ) {

				object.geometry.computeBoundingSphere();

				center.copy( object.geometry.boundingSphere.center );

				center.applyMatrix4( object.matrixWorld );

				if ( frustum.containsPoint( center ) ) {

					this.collection.push( object );

				}

			}

		}

		if ( object.children.length > 0 ) {

			for ( var x = 0; x < object.children.length; x ++ ) {

				this.searchChildInFrustum( frustum, object.children[ x ] );

			}

		}

	};

	return SelectionBox;

} )();
