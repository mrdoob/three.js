/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * This is a class to check whether objects are in a selection area in 3D space
 */

THREE.SelectionBox = ( function () {

	var frustum = new THREE.Frustum();
	var center = new THREE.Vector3();

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

		if ( this.updateFrustum( this.startPoint, this.endPoint ) ) {

			this.searchChildInFrustum( frustum, this.scene );

		}

		return this.collection;

	};

	SelectionBox.prototype.updateFrustum = function ( startPoint, endPoint ) {

		startPoint = startPoint || this.startPoint;
		endPoint = endPoint || this.endPoint;

		this.camera.updateProjectionMatrix();
		this.camera.updateMatrixWorld();

		if (this.camera.isPerspectiveCamera) {

			var tmpPoint = startPoint.clone();
			tmpPoint.x = Math.min( startPoint.x, endPoint.x );
			tmpPoint.y = Math.max( startPoint.y, endPoint.y );
			endPoint.x = Math.max( startPoint.x, endPoint.x );
			endPoint.y = Math.min( startPoint.y, endPoint.y );
	
			var vecNear = this.camera.position.clone();
			var vecTopLeft = tmpPoint.clone();
			var vecTopRight = new THREE.Vector3( endPoint.x, tmpPoint.y, 0 );
			var vecDownRight = endPoint.clone();
			var vecDownLeft = new THREE.Vector3( tmpPoint.x, endPoint.y, 0 );
			vecTopLeft.unproject( this.camera );
			vecTopRight.unproject( this.camera );
			vecDownRight.unproject( this.camera );
			vecDownLeft.unproject( this.camera );
	
			var vectemp1 = vecTopLeft.clone().sub( vecNear );
			var vectemp2 = vecTopRight.clone().sub( vecNear );
			var vectemp3 = vecDownRight.clone().sub( vecNear );
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

		} else if ( this.camera.isOrthographicCamera ) {

			var left = Math.min( startPoint.x, endPoint.x );
			var top = Math.max( startPoint.y, endPoint.y );
			var right = Math.max( startPoint.x, endPoint.x );
			var down = Math.min( startPoint.y, endPoint.y );

			if (left === right || top === down) {

				return false;

			}

			var vecTopLeft = new THREE.Vector3( left, top, -1 );
			var vecTopRight = new THREE.Vector3( right, top, -1 );
			var vecDownRight = new THREE.Vector3( right, down, -1 );
			var vecDownLeft = new THREE.Vector3( left, down, -1 );

			var vecFarTopLeft = new THREE.Vector3( left, top, 1 );
			var vecFarTopRight = new THREE.Vector3( right, top, 1 );
			var vecFarDownRight = new THREE.Vector3( right, down, 1 );
			var vecFarDownLeft = new THREE.Vector3( left, down, 1 );

			vecTopLeft.unproject( this.camera );
			vecTopRight.unproject( this.camera );
			vecDownRight.unproject( this.camera );
			vecDownLeft.unproject( this.camera );

			vecFarTopLeft.unproject( this.camera );
			vecFarTopRight.unproject( this.camera );
			vecFarDownRight.unproject( this.camera );
			vecFarDownLeft.unproject( this.camera );

			var planes = frustum.planes;

			planes[ 0 ].setFromCoplanarPoints( vecTopLeft, vecFarTopLeft, vecFarTopRight );
			planes[ 1 ].setFromCoplanarPoints( vecTopRight, vecFarTopRight, vecFarDownRight );
			planes[ 2 ].setFromCoplanarPoints( vecFarDownRight, vecFarDownLeft, vecDownLeft );
			planes[ 3 ].setFromCoplanarPoints( vecFarDownLeft, vecFarTopLeft, vecTopLeft );
			planes[ 4 ].setFromCoplanarPoints( vecTopRight, vecDownRight, vecDownLeft );
			planes[ 5 ].setFromCoplanarPoints( vecFarDownRight, vecFarTopRight, vecFarTopLeft );
			planes[ 5 ].normal.multiplyScalar( - 1 );

		} else {

			// camera neither orthographic nor perspective
			console.warn( 'WARNING: SelectionBox.js encountered an unknown camera type.' );

			return false;
		}

		return true;
	};

	SelectionBox.prototype.searchChildInFrustum = function ( frustum, object ) {

		if ( object.isMesh || object.isLine || object.isPoints ) {

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
