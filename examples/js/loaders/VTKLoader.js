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

	parse: function ( data ) {

		var indices = [];
		var positions = [];
		var pointData = [];
		var cellData = [];

		var result;

		// float float float

		var pat3Floats = /([\-]?[\d]+[\.]?[\d|\-|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|e]*)/g;
		var patTriangle = /^3[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		var patQuad = /^4[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		var patFloat = /([\-]?[\d]+[\.]?[\d|\-|e]*)/;
		var patPOINTS = /^POINTS /;
		var patPOLYGONS = /^POLYGONS /;
		var patPOINT_DATA = /^POINT_DATA[ ]+([\d]+)/;
		var patCELL_DATA = /^CELL_DATA[ ]+([\d]+)/;
		var patSCALARS = /^SCALARS[ ]+([\w]+)[ ]+([\w]+)[ ]+([\d]+)/;
		var inPointsSection = false;
		var inPolygonsSection = false;
		var inPointDataSection = false;
		var inCellDataSection = false;
		var numPointDataComps = 1;
		var numCellDataComps = 1;

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
			else if ( inPointDataSection ) {
			
				result = patFloat.exec(line);
				
				if ( result !== null ) {
				
					pointData.push( parseFloat( result[ 1 ] ) );
					
				}
			}
			else if ( inCellDataSection ) {
			
				result = patFloat.exec(line);
				
				if ( result !== null ) {
				
					cellData.push( parseFloat( result[ 1 ] ) );
					
				}
			}

			if ( patPOLYGONS.exec( line ) !== null ) {
				inPolygonsSection = true;
				inPointsSection = false;
				inPointDataSection = false;
				inCellDataSection = false;
			}
			else if ( patPOINTS.exec( line ) !== null ) {
				inPolygonsSection = false;
				inPointsSection = true;
				inPointDataSection = false;
				inCellDataSection = false;
			}
			else if ( ( result = patPOINT_DATA.exec( line ) ) !== null ) {
				inPolygonsSection = false;
				inPointsSection = false;
				inPointDataSection = true;
				inCellDataSection = false;
			}
			else if ( ( result = patCELL_DATA.exec( line ) ) !== null ) {
				inPolygonsSection = false;
				inPointsSection = false;
				inPointDataSection = false;
				inCellDataSection = true;
			}
		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'index', new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.addAttribute( 'point_data', new THREE.BufferAttribute( new Float32Array( pointData ), 1 ) );
		geometry.addAttribute( 'cell_data', new THREE.BufferAttribute( new Float32Array( cellData ), 1 ) );

		return geometry;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );
