/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AxisHelper = function ( size ) {

	THREE.Object3D.call( this );

	size = size || 1;

	var lineGeometry, line;

	// x

	lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3() );
	lineGeometry.vertices.push( new THREE.Vector3( size, 0, 0 ) );

	line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0xff0000 } ) );
	line.matrixAutoUpdate = false;
	this.add( line );

	// y

	lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3() );
	lineGeometry.vertices.push( new THREE.Vector3( 0, size, 0 ) );
	
	line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0x00ff00 } ) );
	line.matrixAutoUpdate = false;
	this.add( line );

	// z

	lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3() );
	lineGeometry.vertices.push( new THREE.Vector3( 0, 0, size ) );
	
	line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0x0000ff } ) );
	line.matrixAutoUpdate = false;
	this.add( line );

};

THREE.AxisHelper.prototype = Object.create( THREE.Object3D.prototype );
