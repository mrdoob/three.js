/**
 * @author mrdoob / http://mrdoob.com/ and Alex Pletzer
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

		// connectivity of the triangles
		var indices = [];
		
		// triangles vertices
		var positions = [];
		
		// scalar field container
		var scalars = {};
		
		var dataArray = [];
		var scalarName = "";
		var stagger = "";
		var result;
		
		// pattern for reading vertices
		var pat3Floats = /([\-]?[\d]+[\.]?[\d|\-|\+|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|\+|e]*)[ ]+([\-]?[\d]+[\.]?[\d|\-|\+|e]*)/g;
		
		// pattern for reading triangle connectivity
		var patTriangle = /^3[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		
		// pattern for reading quads
		var patQuad = /^4[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/;
		
		// pattern for reading scalar field values
		var patFloat = /([\-]?[\d]+[\.]?[\d|\-|\+|e]*)/g;
		
		// indicates start of vertex data section
		var patPOINTS = /^POINTS /;
		
		// indicates start of polygon connectivity section 
		var patPOLYGONS = /^POLYGONS /;
		
		// POINT_DATA number_of_values 
		var patPOINT_DATA = /^POINT_DATA[ ]+([\d]+)/;
		
		// CELL_DATA number_of_polys
		var patCELL_DATA = /^CELL_DATA[ ]+([\d]+)/;
		
		// SCALARS name type number_of_components
		var patSCALARS = /^SCALARS[ ]+([\w]+)[ ]+([\w]+)[ ]+([\d]+)/;
		
		var inPointsSection = false;
		var inPolygonsSection = false;
		var inPointDataSection = false;
		var inCellDataSection = false;
		var pastScalarsDecl = false;

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

				if ( ( result = patTriangle.exec( line ) ) !== null ) {

					// 3 int int int
					// triangle

					indices.push( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ) );
				}
				else {

					if ( ( result = patQuad.exec( line ) ) !== null ) {

						// 4 int int int int
						// break quad into two triangles

						indices.push( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 4 ] ) );
						indices.push( parseInt( result[ 2 ] ), parseInt( result[ 3 ] ), parseInt( result[ 4 ] ) );
					}

				}

			}
			else if (  pastScalarsDecl && ( inPointDataSection || inCellDataSection )  ) {
			
				// read scalar field values
			
				while ( ( result = patFloat.exec( line ) ) !== null ) {
				
					dataArray.push( parseFloat( result[ 1 ] ) );
					
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
			
			    // new data section 
			    
			    if ( scalarName != "" && dataArray.length > 0) {
			    
			        // save the scalars read so far. Assume float32 type for simplicity
			        
			        scalars[stagger][scalarName] = new THREE.BufferAttribute( new Float32Array( dataArray ), 1 );
			        
			        // start with an empty container 
			        
			        dataArray = [];
			    }
				inPolygonsSection = false;
				inPointsSection = false;
				inPointDataSection = true;
				inCellDataSection = false;
				stagger = "point";
				scalars[ stagger ] = {};
				pastScalarsDecl = false;
			}
			else if ( ( result = patCELL_DATA.exec( line ) ) !== null ) {
			
				// new data section 
				
			    if ( scalarName != "" && dataArray.length > 0) {
			    
			      	// save the scalars read so far
			      	
			        scalars[stagger][scalarName] = new THREE.BufferAttribute( new Float32Array( dataArray ), 1 );
			        dataArray = [];
			    }
				inPolygonsSection = false;
				inPointsSection = false;
				inPointDataSection = false;
				inCellDataSection = true;
				stagger = "cell";
				scalars[ stagger ] = {};
				pastScalarsDecl = false;
			}
			else if ( stagger != "" && ( result = patSCALARS.exec( line ) ) !== null ) {
			
			  	// get the scalar field name 
			  	
			    scalarName = result[ 1 ];
			    scalars[stagger][scalarName] = dataArray;
			    pastScalarsDecl = true;
			}
		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'index', new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
		
		// add field data 
		
		geometry.addAttribute( 'scalars', scalars );
		
		return geometry;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );
