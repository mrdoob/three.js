/**
 * @author mrdoob / http://mrdoob.com/
 * @author yomboprime / https://github.com/yomboprime/
 *
 *
 */

THREE.LDrawLoader = ( function () {

	function LineParser( line, lineNumber ) {

		this.line = line;
		this.lineLength = line.length;
		this.currentCharIndex = 0;
		this.currentChar = ' ';
		this.lineNumber = lineNumber;

	}

	LineParser.prototype = {

		constructor: LineParser,

		seekNonSpace: function () {

			while ( this.currentCharIndex < this.lineLength ) {

				this.currentChar = this.line.charAt( this.currentCharIndex );

				if ( this.currentChar !== ' ' && this.currentChar !== '\t' ) {

					return;

				}

				this.currentCharIndex ++;

			}

		},

		getToken: function () {

			var pos0 = this.currentCharIndex ++;

			// Seek space
			while ( this.currentCharIndex < this.lineLength ) {

				this.currentChar = this.line.charAt( this.currentCharIndex );

				if ( this.currentChar === ' ' || this.currentChar === '\t' ) {

					break;

				}

				this.currentCharIndex ++;

			}

			var pos1 = this.currentCharIndex;

			this.seekNonSpace();

			return this.line.substring( pos0, pos1 );

		},

		getRemainingString: function() {

			return this.line.substring( this.currentCharIndex, this.lineLength );

		},

		isAtTheEnd: function() {

			return this.currentCharIndex >= this.lineLength;

		},

		setToEnd: function () {

			this.currentCharIndex = this.lineLength;

		},

		getLineNumberString: function () {

			return this.lineNumber >= 0? " at line " + this.lineNumber: "";

		}


	};

	function sortByMaterial ( a, b ) {

		if ( a.colourCode === b.colourCode ) {
			return 0;
		}
		if ( a.colourCode < b.colourCode ) {
			return -1;
		}
		return 1;

	}

	function createObject( elements, elementSize ) {

		// Creates a THREE.LineSegments (elementSize = 2) or a THREE.Mesh (elementSize = 3 )
		// With per face / segment material, implemented with mesh groups and materials array

		// Sort the triangles or line segments by colour code to make later the mesh groups
		elements.sort( sortByMaterial );

		var vertices = [];
		var materials = [];

		var bufferGeometry = new THREE.BufferGeometry();
		bufferGeometry.clearGroups();
		var prevMaterial = null;
		var index0 = 0;
		var numGroupVerts = 0;

		for ( var iElem = 0, nElem = elements.length; iElem < nElem; iElem ++ ) {

			var elem = elements[ iElem ];
			var v0 = elem.v0;
			var v1 = elem.v1;
			// Note that LDraw coordinate system is rotated 180 deg. in the X axis w.r.t. Three.js's one
			vertices.push( v0.x, v0.y, v0.z, v1.x, v1.y, v1.z );
			if ( elementSize === 3 ) {

				vertices.push( elem.v2.x, elem.v2.y, elem.v2.z );

			}

			if ( prevMaterial !== elem.material ) {

				if ( prevMaterial !== null ) {

					bufferGeometry.addGroup( index0, numGroupVerts, materials.length - 1 );

				}

				materials.push( elem.material );

				prevMaterial = elem.material;
				index0 = iElem * elementSize;
				numGroupVerts = 0;

			}
			else {

				numGroupVerts += elementSize;

			}

		}
		if ( numGroupVerts > 0 ) {

			bufferGeometry.addGroup( index0, Infinity, materials.length - 1 );

		}

		bufferGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

		var object3d = null;
		if ( elementSize === 2 ) {

			object3d = new THREE.LineSegments( bufferGeometry, materials );

		}
		else if ( elementSize === 3 ) {

			bufferGeometry.computeVertexNormals();

			object3d = new THREE.Mesh( bufferGeometry, materials );

		}

		return object3d;

	}

	//

	function LDrawLoader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		// This is a stack of 'parse scopes' with one level per subobject loaded file.
		// Each level contains a material lib and also other runtime variables passed between parent and child subobjects
		// When searching for a material code, the stack is read from top of the stack to bottom
		// Each material library is an object map keyed by colour codes.
		this.parseScopesStack = null;

		this.path = '';

		// Array of THREE.Material
		this.materials = [];

		// Not using THREE.Cache here because it returns the previous HTML error response instead of calling onError()
		// This also allows to handle the embedded text files ("0 FILE" lines)
		this.subobjectCache = {};

		// This object is a map from file names to paths. It agilizes the paths search. If it is not set then files will be searched by trial and error.
		this.fileMap = null;

		// Add default main triangle and line edge materials (used in piecess that can be coloured with a main color)
		this.setMaterials( [
			this.parseColourMetaDirective( new LineParser( "Main_Colour CODE 16 VALUE #FF8080 EDGE #333333" ) ),
			this.parseColourMetaDirective( new LineParser( "Edge_Colour CODE 24 VALUE #A0A0A0 EDGE #333333" ) )
		] );

		// Temporary matrices
		this.tempMatrix180 = new THREE.Matrix4().makeRotationX( Math.PI );
		this.tempMatrix = new THREE.Matrix4();


	}

	// Special surface finish tag types.
	// Note: "MATERIAL" tag (e.g. GLITTER, SPECKLE) is not implemented
	LDrawLoader.FINISH_TYPE_DEFAULT = 0;
	LDrawLoader.FINISH_TYPE_CHROME = 1;
	LDrawLoader.FINISH_TYPE_PEARLESCENT = 2;
	LDrawLoader.FINISH_TYPE_RUBBER = 3;
	LDrawLoader.FINISH_TYPE_MATTE_METALLIC = 4;
	LDrawLoader.FINISH_TYPE_METAL = 5;

	// State machine to search a subobject path.
	// The LDraw standard establishes these various possible subfolders.
	LDrawLoader.FILE_LOCATION_AS_IS = 0;
	LDrawLoader.FILE_LOCATION_TRY_PARTS = 1;
	LDrawLoader.FILE_LOCATION_TRY_P = 2;
	LDrawLoader.FILE_LOCATION_TRY_MODELS = 3;
	LDrawLoader.FILE_LOCATION_TRY_RELATIVE = 4;
	LDrawLoader.FILE_LOCATION_TRY_ABSOLUTE = 5;
	LDrawLoader.FILE_LOCATION_NOT_FOUND = 6;

	LDrawLoader.prototype = {

		constructor: LDrawLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			if ( ! this.fileMap ) {
				this.fileMap = {};
			}

			var scope = this;

			var fileLoader = new THREE.FileLoader( this.manager );
			fileLoader.setPath( this.path );
			fileLoader.load( url, function( text ) {

				processObject( text, onLoad );

			}, onProgress, onError );

			function processObject( text, onProcessed ) {

				var parseScope = scope.newParseScopeLevel();
				parseScope.url = url;

				// Add to cache
				var currentFileName = scope.getParentParseScope().currentFileName;
				if ( scope.subobjectCache[ currentFileName ] === undefined ) {
					scope.subobjectCache[ currentFileName ] = text;

				}

				// Parse the object (returns a THREE.Group)
				var objGroup = scope.parse( text );

				// Load subobjects
				parseScope.subobjects = objGroup.userData.subobjects;
				parseScope.numSubobjects = parseScope.subobjects.length;
				parseScope.subobjectIndex = 0;

				if ( parseScope.numSubobjects > 0 ) {

					// Load the first subobject
					var subobjectGroup = loadSubobject( parseScope.subobjects[ 0 ], true );

					// Optimization for loading pack: If subobjects are obtained from cache, keep loading them iteratively rather than recursively
					if ( subobjectGroup ) {

						while ( subobjectGroup && parseScope.subobjectIndex < parseScope.numSubobjects - 1 ) {

							subobjectGroup = loadSubobject( parseScope.subobjects[ ++ parseScope.subobjectIndex ], true );

						}

						if ( subobjectGroup ) {

							scope.removeScopeLevel();
							if ( onProcessed ) {

								onProcessed( objGroup );

							}

						}
					}

				}
				else {

					// No subobjects, finish object
					scope.removeScopeLevel();
					if ( onProcessed ) {

						onProcessed( objGroup );

					}

				}

				return objGroup;

				function loadSubobject ( subobject, sync ) {

					parseScope.mainColourCode = subobject.material.userData.code;
					parseScope.mainEdgeColourCode = subobject.material.userData.edgeMaterial.userData.code;
					parseScope.currentFileName = subobject.originalFileName;

					// If subobject was cached previously, use the cached one
					var cached = scope.subobjectCache[ subobject.originalFileName ];
					if ( cached ) {
						var subobjectGroup = processObject( cached, sync ? undefined : onSubobjectLoaded );
						if ( sync ) {
							addSubobject( subobject, subobjectGroup );
							return subobjectGroup;
						}
						return;
					}

					// Adjust file name to locate the subobject file path in standard locations (always under directory scope.path)
					// Update also subobject.locationState for the next try if this load fails.
					var subobjectURL = subobject.fileName;
					var newLocationState = LDrawLoader.FILE_LOCATION_NOT_FOUND;

					switch ( subobject.locationState ) {

						case LDrawLoader.FILE_LOCATION_AS_IS:
							newLocationState = subobject.locationState + 1;
							break;

						case LDrawLoader.FILE_LOCATION_TRY_PARTS:
							subobjectURL = 'parts/' + subobjectURL;
							newLocationState = subobject.locationState + 1;
							break;

						case LDrawLoader.FILE_LOCATION_TRY_P:
							subobjectURL = 'p/' + subobjectURL;
							newLocationState = subobject.locationState + 1;
							break;

						case LDrawLoader.FILE_LOCATION_TRY_MODELS:
							subobjectURL = 'models/' + subobjectURL;
							newLocationState = subobject.locationState + 1;
							break;

						case LDrawLoader.FILE_LOCATION_TRY_RELATIVE:
							subobjectURL = url.substring( 0, url.lastIndexOf( "/" ) + 1 ) + subobjectURL;
							newLocationState = subobject.locationState + 1;
							break;

						case LDrawLoader.FILE_LOCATION_TRY_ABSOLUTE:

							if ( subobject.triedLowerCase ) {

								// Try absolute path
								newLocationState = LDrawLoader.FILE_LOCATION_NOT_FOUND;

							}
							else {

								// Next attempt is lower case
								subobject.fileName = subobject.fileName.toLowerCase();
								subobjectURL = subobject.fileName;
								subobject.triedLowerCase = true;
								newLocationState = LDrawLoader.FILE_LOCATION_AS_IS;

							}
							break;

						case LDrawLoader.FILE_LOCATION_NOT_FOUND:

							// All location possibilities have been tried, give up loading this object
							console.warn( 'LDrawLoader: Subobject "' + subobject.originalFileName + '" could not be found.' );

							// Try to read the next subobject
							parseScope.subobjectIndex ++;

							if ( parseScope.subobjectIndex >= parseScope.numSubobjects ) {

								// All subojects have been loaded. Finish parent object
								scope.removeScopeLevel();
								onProcessed( objGroup );

							}
							else {

								// Load next subobject
								loadSubobject( parseScope.subobjects[ parseScope.subobjectIndex ] );

							}

							return;

					}

					subobject.locationState = newLocationState;
					subobject.url = subobjectURL;

					// Load the subobject
					scope.load( subobjectURL, onSubobjectLoaded, undefined, onSubobjectError );

				}

				function onSubobjectLoaded( subobjectGroup ) {

					var subobject = parseScope.subobjects[ parseScope.subobjectIndex ];

					if ( subobjectGroup === null ) {

						// Try to reload
						loadSubobject( subobject );
						return;

					}

					// Add the subobject just loaded
					addSubobject( subobject, subobjectGroup );

					// Proceed to load the next subobject, or finish the parent object

					parseScope.subobjectIndex ++;

					if ( parseScope.subobjectIndex < parseScope.numSubobjects ) {

						loadSubobject( parseScope.subobjects[ parseScope.subobjectIndex ] );

					}
					else {

						scope.removeScopeLevel();
						onProcessed( objGroup );

					}

				}

				function addSubobject ( subobject, subobjectGroup ) {

					subobjectGroup.name = subobject.fileName;
					objGroup.add( subobjectGroup );
					subobjectGroup.matrix.copy( subobject.matrix );
					subobjectGroup.matrixAutoUpdate = false;

					scope.fileMap[ subobject.originalFileName ] = subobject.url;

				}

				function onSubobjectError( err ) {

					// Retry download from a different default possible location
					loadSubobject( parseScope.subobjects[ parseScope.subobjectIndex ] );

				}

			}

		},

		setPath: function ( value ) {

			this.path = value;

			return this;

		},

		setMaterials: function ( materials ) {

			// Clears parse scopes stack, adds new scope with material library

			this.parseScopesStack = [];

			this.newParseScopeLevel( materials );

			this.materials = materials;

			return this;

		},

		setFileMap: function( fileMap ) {

			this.fileMap = fileMap;

			return this;

		},

		newParseScopeLevel: function ( materials ) {

			// Adds a new scope level, assign materials to it and returns it

			var matLib = {};

			if ( materials ) {

				for ( var i = 0, n = materials.length; i < n; i ++ ) {

					var material = materials[ i ];
					matLib[ material.userData.code ] = material;

				}

			}

			var topParseScope = this.getCurrentParseScope();

			var newParseScope = {

				lib: matLib,
				url: null,

				// Subobjects
				subobjects: null,
				numSubobjects: 0,
				subobjectIndex: 0,

				// Current subobject
				currentFileName: null,
				mainColourCode: topParseScope ? topParseScope.mainColourCode : '16',
				mainEdgeColourCode: topParseScope ? topParseScope.mainEdgeColourCode : '24',

			};

			this.parseScopesStack.push( newParseScope );

			return newParseScope;

		},

		removeScopeLevel: function() {

			this.parseScopesStack.pop();

			return this;

		},

		addMaterial: function ( material ) {

			// Adds a material to the material library which is on top of the parse scopes stack. And also to the materials array

			var matLib = this.getCurrentParseScope().lib;

			if ( ! matLib[ material.userData.code ] ) {

				this.materials.push( material );

			}

			matLib[ material.userData.code ] = material;

			return this;

		},

		getMaterial: function ( colourCode ) {

			// Given a colour code search its material in the parse scopes stack

			if ( colourCode.startsWith( "0x2" ) ) {

				// Special 'direct' material value (RGB colour)

				var colour = colourCode.substring( 3 );

				return this.parseColourMetaDirective( new LineParser( "Direct_Color_" + colour + " CODE -1 VALUE #" + colour + " EDGE #" + colour + "" ) );

			}

			for ( var i = this.parseScopesStack.length - 1; i >= 0; i-- ) {

				var material = this.parseScopesStack[ i ].lib[ colourCode ];

				if ( material ) {

					return material;

				}

			}

			// Material was not found
			return null;

		},

		getParentParseScope: function () {

			if ( this.parseScopesStack.length > 1 ) {

				return this.parseScopesStack[ this.parseScopesStack.length - 2 ];

			}

			return null;

		},

		getCurrentParseScope: function () {

			if ( this.parseScopesStack.length > 0 ) {

				return this.parseScopesStack[ this.parseScopesStack.length - 1 ];

			}

			return null;

		},

		parseColourMetaDirective: function ( lineParser ) {

			// Parses a colour definition and returns a THREE.Material or null if error

			var code = null;

			// Triangle and line colours
			var colour = 0xFF00FF;
			var edgeColour = 0xFF00FF;

			// Transparency
			var alpha = 1;
			var isTransparent = false;
			// Self-illumination:
			var luminance = 0;

			var finishType = LDrawLoader.FINISH_TYPE_DEFAULT;
			var canHaveEnvMap = true;

			var edgeMaterial = null;

			var name = lineParser.getToken();
			if ( ! name ) {

				throw 'LDrawLoader: Material name was expected after "!COLOUR tag' + lineParser.getLineNumberString() + ".";

			}

			// Parse tag tokens and their parameters
			var token = null;
			while ( true ) {

				token = lineParser.getToken();

				if ( ! token ) {

					break;

				}

				switch ( token.toUpperCase() ) {

					case "CODE":

						code = lineParser.getToken();
						break;

					case "VALUE":

						colour = lineParser.getToken();
						if ( colour.startsWith( '0x' ) ) {

							colour = '#' + colour.substring( 2 );

						}
						else if ( ! colour.startsWith( '#' ) ) {
							throw 'LDrawLoader: Invalid colour while parsing material' + lineParser.getLineNumberString() + ".";
						}
						break;

					case "EDGE":

						edgeColour = lineParser.getToken();
						if ( edgeColour.startsWith( '0x' ) ) {

							edgeColour = '#' + edgeColour.substring( 2 );

						}
						else if ( ! edgeColour.startsWith( '#' ) ) {

							// Try to see if edge colour is a colour code
							edgeMaterial = this.getMaterial( edgeColour );
							if ( ! edgeMaterial ) {

								throw 'LDrawLoader: Invalid edge colour while parsing material' + lineParser.getLineNumberString() + ".";

							}

							// Get the edge material for this triangle material
							edgeMaterial = edgeMaterial.userData.edgeMaterial;

						}
						break;

					case 'ALPHA':

						alpha = parseInt( lineParser.getToken() );

						if ( isNaN( alpha ) ) {

							throw 'LDrawLoader: Invalid alpha value in material definition' + lineParser.getLineNumberString() + ".";

						}

						alpha = Math.max( 0, Math.min( 1, alpha / 255 ) );

						if ( alpha < 1 ) {

							isTransparent = true;

						}

						break;

					case 'LUMINANCE':

						luminance = parseInt( lineParser.getToken() );

						if ( isNaN( luminance ) ) {

							throw 'LDrawLoader: Invalid luminance value in material definition' + LineParser.getLineNumberString() + ".";

						}

						luminance = Math.max( 0, Math.min( 1, luminance / 255 ) );

						break;

					case 'CHROME':
						finishType = LDrawLoader.FINISH_TYPE_CHROME;
						break;

					case 'PEARLESCENT':
						finishType = LDrawLoader.FINISH_TYPE_PEARLESCENT;
						break;

					case 'RUBBER':
						finishType = LDrawLoader.FINISH_TYPE_RUBBER;
						break;

					case 'MATTE_METALLIC':
						finishType = LDrawLoader.FINISH_TYPE_MATTE_METALLIC;
						break;

					case 'METAL':
						finishType = LDrawLoader.FINISH_TYPE_METAL;
						break;

					case 'MATERIAL':
						// Not implemented
						lineParser.setToEnd();
						break;

					default:
						throw 'LDrawLoader: Unknown token "' + token + '" while parsing material' + lineParser.getLineNumberString() + ".";
						break;

				}

			}

			var material = null;

			switch ( finishType ) {

				case LDrawLoader.FINISH_TYPE_DEFAULT:
				case LDrawLoader.FINISH_TYPE_PEARLESCENT:

					var specular = new THREE.Color( colour );
					var shininess = 35;
					var hsl = specular.getHSL( { h: 0, s: 0, l: 0 } );

					if ( finishType === LDrawLoader.FINISH_TYPE_DEFAULT ) {

						// Default plastic material with shiny specular
						hsl.l = Math.min( 1, hsl.l + ( 1 - hsl.l ) * 0.12 );

					}
					else {

						// Try to imitate pearlescency by setting the specular to the complementary of the color, and low shininess
						hsl.h = ( hsl.h + 0.5 ) % 1;
						hsl.l = Math.min( 1, hsl.l + ( 1 - hsl.l ) * 0.7 );
						shininess = 10;
					}

					specular.setHSL( hsl.h, hsl.s, hsl.l );

					material = new THREE.MeshPhongMaterial( { color: colour, specular: specular, shininess: shininess, reflectivity: 0.3 } );
					break;

				case LDrawLoader.FINISH_TYPE_CHROME:

					// Mirror finish surface
					material = new THREE.MeshStandardMaterial( { color: colour, roughness: 0, metalness: 1 } );
					break;

				case LDrawLoader.FINISH_TYPE_RUBBER:

					// Rubber is best simulated with Lambert
					material = new THREE.MeshLambertMaterial( { color: colour } );
					canHaveEnvMap = false;
					break;

				case LDrawLoader.FINISH_TYPE_MATTE_METALLIC:

					// Brushed metal finish
					material = new THREE.MeshStandardMaterial( { color: colour, roughness: 0.8, metalness: 0.4 } );
					break;

				case LDrawLoader.FINISH_TYPE_METAL:

					// Average metal finish
					material = new THREE.MeshStandardMaterial( { color: colour, roughness: 0.2, metalness: 0.85 } );
					break;

				default:
					// Should not happen
					break;
			}

			// BFC (Back Face Culling) LDraw language meta extension is not implemented, so set all materials double-sided:
			material.side = THREE.DoubleSide;

			material.transparent = isTransparent;
			material.opacity = alpha;

			material.userData.canHaveEnvMap = canHaveEnvMap;

			if ( luminance !== 0 ) {
				material.emissive.set( material.color ).multiplyScalar( luminance );
			}

			if ( ! edgeMaterial ) {
				// This is the material used for edges
				edgeMaterial = new THREE.LineBasicMaterial( { color: edgeColour } );
				edgeMaterial.userData.code = code;
				edgeMaterial.name = name + " - Edge";
				edgeMaterial.userData.canHaveEnvMap = false;
			}

			material.userData.code = code;
			material.name = name;

			material.userData.edgeMaterial = edgeMaterial;

			return material;

		},

		//

		parse: function ( text ) {

			//console.time( 'LDrawLoader' );

			// Retrieve data from the parent parse scope
			var parentParseScope = this.getParentParseScope();

			// Main colour codes passed to this subobject (or default codes 16 and 24 if it is the root object)
			var mainColourCode = parentParseScope.mainColourCode;
			var mainEdgeColourCode = parentParseScope.mainEdgeColourCode;

			var url = parentParseScope.url;

			// Parse result variables
			var triangles = [];
			var lineSegments = [];
			var subobjects = [];

			var category = null;
			var keywords = null;

			if ( text.indexOf( '\r\n' ) !== - 1 ) {

				// This is faster than String.split with regex that splits on both
				text = text.replace( /\r\n/g, '\n' );

			}

			var lines = text.split( '\n' );
			var numLines = lines.length;
			var lineIndex = 0;

			var parsingEmbeddedFiles = false;
			var currentEmbeddedFileName = null;
			var currentEmbeddedText = null;

			var scope = this;
			function parseColourCode( lineParser, forEdge ) {

				// Parses next colour code and returns a THREE.Material

				var colourCode = lineParser.getToken();

				if ( ! forEdge && colourCode === '16' ) {

					colourCode = mainColourCode;

				}
				if ( forEdge && colourCode === '24' ) {

					colourCode = mainEdgeColourCode;

				}

				var material = scope.getMaterial( colourCode );

				if ( ! material ) {

					throw 'LDrawLoader: Unknown colour code "' + colourCode + '" is used' + lineParser.getLineNumberString() + ' but it was not defined previously.';

				}

				return material;

			}

			function findSubobject( fileName ) {

				for ( var i = 0, n = subobjects.length; i < n; i ++ ) {

					if ( subobjects[ i ].fileName === fileName ) {
						return subobjects[ i ];
					}

					return null;

				}

			}

			// Parse all line commands
			for ( lineIndex = 0; lineIndex < numLines; lineIndex ++ ) {

				line = lines[ lineIndex ];

				if ( line.length === 0 ) continue;

				if ( parsingEmbeddedFiles ) {

					if ( line.startsWith( '0 FILE ' ) ) {

						// Save previous embedded file in the cache
						this.subobjectCache[ currentEmbeddedFileName ] = currentEmbeddedText;

						// New embedded text file
						currentEmbeddedFileName = line.substring( 7 );
						currentEmbeddedText = '';

					}
					else {

						currentEmbeddedText += line + '\n';

					}

					continue;

				}

				var lp = new LineParser( line, lineIndex + 1 );

				lp.seekNonSpace();

				if ( lp.isAtTheEnd() ) {
					// Empty line
					continue;
				}

				// Parse the line type
				var lineType = lp.getToken();

				switch ( lineType ) {

					// Line type 0: Comment or META
					case '0':

						// Parse meta directive
						var meta = lp.getToken();

						if ( meta ) {

							switch ( meta ) {

								case '!COLOUR':

									var material = this.parseColourMetaDirective( lp );
									if ( material ) {

										this.addMaterial( material );

									}
									else {

										console.warn( 'LDrawLoader: Error parsing material' + lineParser.getLineNumberString() );

									}
									break;

								case '!CATEGORY':

									category = lp.getToken();
									break;

								case '!KEYWORDS':

										var newKeywords = lp.getRemainingString().split( ',' );
										if ( newKeywords.length > 0 ) {

											if ( ! keywords ) {

												keywords = [];

											}

											newKeywords.forEach( function( keyword ) {

												keywords.push( keyword.trim() );

											} );

										}
									break;

								case 'FILE':

									if ( lineIndex > 0 ) {

										// Start embedded text files parsing
										parsingEmbeddedFiles = true;
										currentEmbeddedFileName = lp.getRemainingString();
										currentEmbeddedText = '';

									}

									break;

								default:
									// Other meta directives are not implemented
									break;

							}

						}

						break;

					// Line type 1: Sub-object file
					case '1':

						var material = parseColourCode( lp );

						var posX = parseFloat( lp.getToken() );
						var posY = parseFloat( lp.getToken() );
						var posZ = parseFloat( lp.getToken() );
						var m0 = parseFloat( lp.getToken() );
						var m1 = parseFloat( lp.getToken() );
						var m2 = parseFloat( lp.getToken() );
						var m3 = parseFloat( lp.getToken() );
						var m4 = parseFloat( lp.getToken() );
						var m5 = parseFloat( lp.getToken() );
						var m6 = parseFloat( lp.getToken() );
						var m7 = parseFloat( lp.getToken() );
						var m8 = parseFloat( lp.getToken() );

						var matrix = new THREE.Matrix4();
						matrix.set(
							m0, m1, m2, posX,
							m3, m4, m5, posY,
							m6, m7, m8, posZ,
							0, 0, 0, 1
						);

						var fileName = lp.getRemainingString().trim().replace( "\\", "/" );

						if ( scope.fileMap[ fileName ] ) {

							// Found the subobject path in the preloaded file path map
							fileName = scope.fileMap[ fileName ];

						}
						else {

							// Standardized subfolders
							if ( fileName.startsWith( 's/' ) ) {

								fileName = 'parts/' + fileName;

							}
							else if ( fileName.startsWith( '48/' ) ) {

								fileName = 'p/' + fileName;

							}

						}

						subobjects.push( {
							material: material,
							matrix: matrix,
							fileName: fileName,
							originalFileName: fileName,
							locationState: LDrawLoader.FILE_LOCATION_AS_IS,
							url: null,
							triedLowerCase: false
						} );

						break;

					// Line type 2: Line segment
					case '2':

						var material = parseColourCode( lp, true );

						lineSegments.push( {
							material: material.userData.edgeMaterial,
							colourCode: material.userData.code,
							v0: new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) ),
							v1: new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) )
						} );

						break;

					// Line type 3: Triangle
					case '3':

						var material = parseColourCode( lp );

						triangles.push( {
							material: material,
							colourCode: material.userData.code,
							v0: new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) ),
							v1: new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) ),
							v2: new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) )
						} );

						break;

					// Line type 4: Quadrilateral
					case '4':

						var material = parseColourCode( lp );

						var v0 = new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) );
						var v1 = new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) );
						var v2 = new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) );
						var v3 = new THREE.Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) );

						triangles.push( {
							material: material,
							colourCode: material.userData.code,
							v0: v0,
							v1: v1,
							v2: v2
						} );

						triangles.push( {
							material: material,
							colourCode: material.userData.code,
							v0: v0,
							v1: v2,
							v2: v3
						} );

						break;

					// Line type 5: Optional line
					case '5':
						// Line type 5 is not implemented
						break;

					default:
						throw 'LDrawLoader: Unknown line type "' + lineType + '"' + lp.getLineNumberString() + '.';
						break;

				}

			}

			if ( parsingEmbeddedFiles ) {

				this.subobjectCache[ currentEmbeddedFileName ] = currentEmbeddedText;

			}

			//

			var groupObject = new THREE.Group();
			groupObject.userData.category = category;
			groupObject.userData.keywords = keywords;
			groupObject.userData.subobjects = subobjects;

			if ( lineSegments.length > 0 ) {

				groupObject.add( createObject( lineSegments, 2 ) );


			}

			if ( triangles.length > 0 ) {

				groupObject.add( createObject( triangles, 3 ) );

			}

			//console.timeEnd( 'LDrawLoader' );

			return groupObject;

		}

	};

	return LDrawLoader;

} )();
