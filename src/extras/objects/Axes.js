/**
 * @author sroucheray / http://sroucheray.org/
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Axes = function () {

	THREE.Object3D.call( this );

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vertex() );
	lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 100, 0 ) ) );

	var coneGeometry = new THREE.CylinderGeometry( 0, 5, 25, 5, 1 );

	// x

	var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0xff0000 } ) );
	line.rotation.z = - Math.PI / 2;
	this.add( line );

	var cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : 0xff0000 } ) );
	cone.position.x = 100;
	cone.rotation.z = - Math.PI / 2;
	this.add( cone );

	// y

	var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0x00ff00 } ) );
	this.add( line );

	var cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : 0x00ff00 } ) );
	cone.position.y = 100;
	this.add( cone );

	// z

	var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0x0000ff } ) );
	line.rotation.x = Math.PI / 2;
	this.add( line );

	var cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : 0x0000ff } ) );
	cone.position.z = 100;
	cone.rotation.x = Math.PI / 2;
	this.add( cone );

};

THREE.Axes.prototype = new THREE.Object3D();
THREE.Axes.prototype.constructor = THREE.Axes;
