/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
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

	THREE.Object3D.call( this );

	if ( hex === undefined ) hex = 0xffff00;
	if ( length === undefined ) length = 20;

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	lineGeometry.vertices.push( new THREE.Vector3( 0, 1, 0 ) );

	this.line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: hex } ) );
	this.add( this.line );

	var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );

	this.cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color: hex } ) );
	this.cone.position.set( 0, 1, 0 );
	this.add( this.cone );

	if ( origin instanceof THREE.Vector3 ) this.position = origin;

	this.setDirection( dir );
	this.setLength( length );

};

THREE.ArrowHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.ArrowHelper.prototype.setDirection = function ( dir ) {

	var matrix = THREE.ArrowHelper.__m0;
	var yAxis = THREE.ArrowHelper.__vYAxis;
	var yAxisNeg = THREE.ArrowHelper.__vYAxisNeg;

	var axis = dir.clone().normalize();

	if( axis.distanceTo( yAxis ) < 0.001 ) {

		matrix.identity();

	}
	else if( axis.distanceTo( yAxisNeg ) < 0.001 ) {

		matrix.makeRotationZ( Math.PI );

	}
	else {

		var perpendicularAxis = THREE.ArrowHelper.__v0.copy( yAxis ).crossSelf( axis );
		var radians = Math.acos( yAxis.dot( axis ) );
		matrix.makeRotationAxis( perpendicularAxis.normalize(), radians );

	}

	this.rotation.setEulerFromRotationMatrix( matrix, this.eulerOrder );

};

THREE.ArrowHelper.prototype.setLength = function ( length ) {

	this.scale.set( length, length, length );

};

THREE.ArrowHelper.prototype.setColor = function ( hex ) {

	this.line.material.color.setHex( hex );
	this.cone.material.color.setHex( hex );

};

THREE.ArrowHelper.__m0 = new THREE.Matrix4();
THREE.ArrowHelper.__v0 = new THREE.Vector3();
THREE.ArrowHelper.__vYAxis = new THREE.Vector3( 0, 1, 0 );
THREE.ArrowHelper.__vYAxisNeg = new THREE.Vector3( 0, -1, 0 );