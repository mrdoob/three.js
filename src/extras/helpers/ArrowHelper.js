/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author bhouston / https://exocortex.com
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

	if ( length === undefined ) length = 20;
	if ( hex === undefined ) hex = 0xffff00;

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

THREE.extend( THREE.ArrowHelper.prototype, {

	setDirection: function() {

		var v1 = new THREE.Vector3(),
			v2 = new THREE.Vector3(),
			q1 = new THREE.Quaternion();

		return function ( dir ) {

		    var d = v1.copy( dir ).normalize();

		    if ( d.y > 0.999 ) {

		        this.rotation.set( 0, 0, 0 );
		 
		    } else if ( d.y < - 0.999 ) {

		        this.rotation.set( Math.PI, 0, 0 );

		    } else {

			    var axis = v2.set( d.z, 0, - d.x ).normalize();
			    var radians = Math.acos( d.y );
			    var quaternion = q1.setFromAxisAngle( axis, radians );

			    this.rotation.setEulerFromQuaternion( quaternion, this.eulerOrder );

			}
		};

	}(),

	setLength: function ( length ) {

		this.scale.set( length, length, length );

	},

	setColor: function ( hex ) {

		this.line.material.color.setHex( hex );
		this.cone.material.color.setHex( hex );

	}

} );
