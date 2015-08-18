/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeBufferGeometry = function ( geometry ) {

	THREE.BufferGeometry.call( this );

	var attributes = geometry.attributes;

	// link attributes

	for ( var name in attributes ) {

		this.addAttribute( name, attributes[ name ] );

	}

	this.morphAttributes = geometry.morphAttributes;

	// create wireframe indices

	var indices = [];

	var index = attributes.index;
	var position = attributes.position;

	if ( index !== undefined ) {

		var array = index.array;

		for ( var i = 0, j = 0, l = array.length; i < l; i += 3 ) {

			var a = array[ i + 0 ];
			var b = array[ i + 1 ];
			var c = array[ i + 2 ];

			// TODO: Check for duplicates

			indices.push( a, b, b, c, c, a );

		}

	} else {

		var array = position.array;

		for ( var i = 0, j = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

			var a = i + 0;
			var b = i + 1;
			var c = i + 2;

			indices.push( a, b, b, c, c, a );

		}

	}

	var TypeArray = position.array.length > 65535 ? Uint32Array : Uint16Array;

	this.addAttribute( 'index', new THREE.BufferAttribute( new TypeArray( indices ), 1 ) );

};

THREE.WireframeBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.WireframeBufferGeometry.prototype.constructor = THREE.WireframeBufferGeometry;
