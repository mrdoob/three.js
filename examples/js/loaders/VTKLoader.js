/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VTKLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VTKLoader.prototype = {

	constructor: THREE.VTKLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {

		var indices = [];
		var positions = [];

		var result;

		// float float float

		var pat3Floats = /([\-]?[\d]+[\.]?[\d|\-|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|e]*)/g;
		var patTriangle = /^3[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		var patQuad = /^4[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		var patPOINTS = /^POINTS /;
		var patPOLYGONS = /^POLYGONS /;
		var inPointsSection = false;
		var inPolygonsSection = false;

		var lines = data.split('\n');
		for ( var i = 0; i < lines.length; ++i ) {

			line = lines[i];

			if ( inPointsSection ) {

				// get the vertices

				while ( ( result = pat3Floats.exec( line ) ) !== null ) {
					positions.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );
				}
			}
			else if ( inPolygonsSection ) {

				result = patTriangle.exec(line);

				if ( result !== null ) {

					// 3 int int int
					// triangle

					indices.push( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ) );
				}
				else {

					result = patQuad.exec(line);

					if ( result !== null ) {

						// 4 int int int int
						// break quad into two triangles

						indices.push( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 4 ] ) );
						indices.push( parseInt( result[ 2 ] ), parseInt( result[ 3 ] ), parseInt( result[ 4 ] ) );
					}

				}

			}

			if ( patPOLYGONS.exec(line) !== null ) {
				inPointsSection = false;
				inPolygonsSection = true;
			}
			if ( patPOINTS.exec(line) !== null ) {
				inPolygonsSection = false;
				inPointsSection = true;
			}
		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'index', new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

		return geometry;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );
