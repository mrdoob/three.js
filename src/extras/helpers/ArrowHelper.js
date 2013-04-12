/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / http://github.com/zz85
 * @author bhouston / http://exocortex.com
 *
 * Creates an arrow for visualizing directions
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  hex - color in hex value
 */

THREE.ArrowHelper = function ( dir, origin, length, hex ) {

	// dir is assumed to be normalized

	THREE.Object3D.call( this );

	if ( hex === undefined ) hex = 0xffff00;
	if ( length === undefined ) length = 1;

	this.position = origin;

	this.useQuaternion = true;

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	lineGeometry.vertices.push( new THREE.Vector3( 0, 1, 0 ) );

	this.line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: hex } ) );
	this.line.matrixAutoUpdate = false;
	this.add( this.line );

	var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );
	coneGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.875, 0 ) );

	this.cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color: hex } ) );
	this.cone.matrixAutoUpdate = false;
	this.add( this.cone );

	this.setDirection( dir );
	this.setLength( length );

};

THREE.ArrowHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.ArrowHelper.prototype.setDirection = function () {

	var axis = new THREE.Vector3();
	var radians;

	return function ( dir ) {

		// dir is assumed to be normalized

		if ( dir.y > 0.999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			axis.set( dir.z, 0, - dir.x ).normalize();

			radians = Math.acos( dir.y );

			this.quaternion.setFromAxisAngle( axis, radians );

		}

	};

}();

THREE.ArrowHelper.prototype.setLength = function ( length ) {

	this.scale.set( length, length, length );

};

THREE.ArrowHelper.prototype.setColor = function ( hex ) {

	this.line.material.color.setHex( hex );
	this.cone.material.color.setHex( hex );

};
