/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * This is a class to check whether objects are in a selection area in 3D space
 */

function SelectionBox ( camera, scene, deep ) {
	
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
    
	var boxSelectionFrustum = this.createFrustum( this.startPoint, this.endPoint );
	this.searchChildInFrustum( boxSelectionFrustum, this.scene );
    
	return this.collection;
	
}

SelectionBox.prototype.createFrustum = function ( startPoint, endPoint ) {
	
	startPoint = startPoint || this.startPoint;
	endPoint = endPoint || this.endPoint

	this.camera.updateProjectionMatrix();
	this.camera.updateMatrixWorld();
	this.camera.updateMatrix();

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

	var planeTop = new THREE.Plane();
	planeTop.setFromCoplanarPoints( vecNear, vecTopLeft, vecTopRight );
	var planeRight = new THREE.Plane();
	planeRight.setFromCoplanarPoints( vecNear, vecTopRight, vecDownRight );
	var planeDown = new THREE.Plane();
	planeDown.setFromCoplanarPoints( vecDownRight, vecDownLeft, vecNear );
	var planeLeft = new THREE.Plane();
	planeLeft.setFromCoplanarPoints( vecDownLeft, vecTopLeft, vecNear );
	var planeFront = new THREE.Plane();
	planeFront.setFromCoplanarPoints( vecTopRight, vecDownRight, vecDownLeft );
	var planeBack = new THREE.Plane();
	planeBack.setFromCoplanarPoints( vectemp3, vectemp2, vectemp1 );
	planeBack.normal = planeBack.normal.multiplyScalar( -1 );

	return new THREE.Frustum( planeTop, planeRight, planeDown, planeLeft, planeFront, planeBack );

}

SelectionBox.prototype.searchChildInFrustum = function ( frustum, object ) {

	if ( object instanceof THREE.Mesh ) {

		if ( object.material !== undefined ) {

			object.geometry.computeBoundingSphere();
			var center = object.geometry.boundingSphere.center.clone().applyMatrix4( object.matrixWorld );

			if ( frustum.containsPoint( center ) ) {

				this.collection.push( object );

			}

		}

	}

	if ( object.children.length > 0 ) {

		for ( var x = 0; x < object.children.length; x++ ) {

			this.searchChildInFrustum( frustum, object.children[x] );

		}

	}
    
}