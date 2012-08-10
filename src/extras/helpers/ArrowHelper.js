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

	var axis = new THREE.Vector3( 0, 1, 0 ).crossSelf( dir );

	var radians = Math.acos( new THREE.Vector3( 0, 1, 0 ).dot( dir.clone().normalize() ) );

	this.matrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );

	this.rotation.setEulerFromRotationMatrix( this.matrix, this.eulerOrder );

};

THREE.ArrowHelper.prototype.setLength = function ( length ) {

	this.scale.set( length, length, length );

};

THREE.ArrowHelper.prototype.setColor = function ( hex ) {

	this.line.material.color.setHex( hex );
	this.cone.material.color.setHex( hex );

};
