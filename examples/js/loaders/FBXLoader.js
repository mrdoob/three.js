/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or to be any version in Binary format.
 *
 * Supports:
 * 	Mesh Generation (Positional Data)
 * 	Normal Data (Per Vertex Drawing Instance)
 *	UV Data (Per Vertex Drawing Instance)
 *	Skinning
 *	Animation
 * 	- Separated Animations based on stacks.
 * 	- Skeletal & Non-Skeletal Animations
 *	NURBS (Open, Closed and Periodic forms)
 *
 * Needs Support:
 * 	Indexed Buffers
 * 	PreRotation support.
 *	Euler rotation order
 *
 * FBX format references:
 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 *
 * 	Binary format specification:
 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 *		https://wiki.rogiken.org/specifications/file-format/fbx/ (more detail but Japanese)
 */

( function () {

	THREE.FBXLoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	};

	Object.assign( THREE.FBXLoader.prototype, {

		load: function ( url, onLoad, onProgress, onError ) {

			var self = this;

			var resourceDirectory = THREE.Loader.prototype.extractUrlBase( url );

			var loader = new THREE.FileLoader( this.manager );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( buffer ) {

				try {

					var scene = self.parse( buffer, resourceDirectory );
					onLoad( scene );

				} catch ( error ) {

					window.setTimeout( function () {

						if ( onError ) onError( error );

						self.manager.itemError( url );

					}, 0 );

				}

			}, onProgress, onError );

		},

		parse: function ( FBXBuffer, resourceDirectory ) {

			var FBXTree;

			if ( isFbxFormatBinary( FBXBuffer ) ) {

				FBXTree = new BinaryParser().parse( FBXBuffer );

			} else {

				var FBXText = convertArrayBufferToString( FBXBuffer );

				if ( ! isFbxFormatASCII( FBXText ) ) {

					throw new Error( 'THREE.FBXLoader: Unknown format.' );

				}

				if ( getFbxVersion( FBXText ) < 7000 ) {

					throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

				}

				FBXTree = new TextParser().parse( FBXText );

			}

			// console.log( FBXTree );

			var connections = parseConnections( FBXTree );
			var images = parseImages( FBXTree );
			var textures = parseTextures( FBXTree, new THREE.TextureLoader( this.manager ).setPath( resourceDirectory ), images, connections );
			var materials = parseMaterials( FBXTree, textures, connections );
			var deformers = parseDeformers( FBXTree, connections );
			var geometryMap = parseGeometries( FBXTree, connections, deformers );
			var sceneGraph = parseScene( FBXTree, connections, deformers, geometryMap, materials );

			return sceneGraph;

		}

	} );

	// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
	// and details the connection type
	function parseConnections( FBXTree ) {

		var connectionMap = new Map();

		if ( 'Connections' in FBXTree ) {

			var connectionArray = FBXTree.Connections.properties.connections;
			for ( var connectionArrayIndex = 0, connectionArrayLength = connectionArray.length; connectionArrayIndex < connectionArrayLength; ++ connectionArrayIndex ) {

				var connection = connectionArray[ connectionArrayIndex ];

				if ( ! connectionMap.has( connection[ 0 ] ) ) {

					connectionMap.set( connection[ 0 ], {
						parents: [],
						children: []
					} );

				}

				var parentRelationship = { ID: connection[ 1 ], relationship: connection[ 2 ] };
				connectionMap.get( connection[ 0 ] ).parents.push( parentRelationship );

				if ( ! connectionMap.has( connection[ 1 ] ) ) {

					connectionMap.set( connection[ 1 ], {
						parents: [],
						children: []
					} );

				}

				var childRelationship = { ID: connection[ 0 ], relationship: connection[ 2 ] };
				connectionMap.get( connection[ 1 ] ).children.push( childRelationship );

			}

		}

		return connectionMap;

	}


	// Parses map of images referenced in FBXTree.Objects.subNodes.Video
	// Images can either be referenced externally or embedded in the file
	// These images are connected to textures in FBXTree.Objects.subNodes.Textures
	// via FBXTree.Connections. Note that images can be duplicated here, in which case only one
	// will will have a .Content field
	function parseImages( FBXTree ) {

		var imageMap = new Map();

		if ( 'Video' in FBXTree.Objects.subNodes ) {

			var videoNodes = FBXTree.Objects.subNodes.Video;

			for ( var nodeID in videoNodes ) {

				var videoNode = videoNodes[ nodeID ];

				// raw image data is in videoNode.properties.Content
				if ( 'Content' in videoNode.properties ) {

					var image = parseImage( videoNodes[ nodeID ] );
					imageMap.set( parseInt( nodeID ), image );

				}

			}

		}

		return imageMap;

	}

	// Parse embedded image data in FBXTree.Video.properties.Content
	function parseImage( videoNode ) {

		var content = videoNode.properties.Content;
		var fileName = videoNode.properties.RelativeFilename || videoNode.properties.Filename;
		var extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

		var type;

		switch ( extension ) {

			case 'bmp':

				type = 'image/bmp';
				break;

			case 'jpg':
			case 'jpeg':

				type = 'image/jpeg';
				break;

			case 'png':

				type = 'image/png';
				break;

			case 'tif':

				type = 'image/tiff';
				break;

			default:

				console.warn( 'FBXLoader: Image type "' + extension + '" is not supported.' );
				return;

		}

		if ( typeof content === 'string' ) {

			return 'data:' + type + ';base64,' + content;

		} else {

			var array = new Uint8Array( content );
			return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

		}

	}

	// Parse nodes in FBXTree.Objects.subNodes.Texture
	// These contain details such as UV scaling, cropping, rotation etc and are connected
	// to images in FBXTree.Objects.subNodes.Video
	function parseTextures( FBXTree, loader, imageMap, connections ) {

		var textureMap = new Map();

		if ( 'Texture' in FBXTree.Objects.subNodes ) {

			var textureNodes = FBXTree.Objects.subNodes.Texture;
			for ( var nodeID in textureNodes ) {

				var texture = parseTexture( textureNodes[ nodeID ], loader, imageMap, connections );
				textureMap.set( parseInt( nodeID ), texture );

			}

		}

		return textureMap;

	}

	// Parse individual node in FBXTree.Objects.subNodes.Texture
	function parseTexture( textureNode, loader, imageMap, connections ) {

		var FBX_ID = textureNode.id;

		var name = textureNode.attrName;

		var fileName;

		var filePath = textureNode.properties.FileName;
		var relativeFilePath = textureNode.properties.RelativeFilename;

		var children = connections.get( FBX_ID ).children;

		if ( children !== undefined && children.length > 0 && imageMap.has( children[ 0 ].ID ) ) {

			fileName = imageMap.get( children[ 0 ].ID );

		} else if ( relativeFilePath !== undefined && relativeFilePath[ 0 ] !== '/' && relativeFilePath.match( /^[a-zA-Z]:/ ) === null ) {

			// use textureNode.properties.RelativeFilename
			// if it exists and it doesn't seem an absolute path

			fileName = relativeFilePath;

		} else {

			var split = filePath.split( /[\\\/]/ );

			if ( split.length > 0 ) {

				fileName = split[ split.length - 1 ];

			} else {

				fileName = filePath;

			}

		}

		var currentPath = loader.path;

		if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

			loader.setPath( undefined );

		}

		var texture = loader.load( fileName );
		texture.name = name;
		texture.FBX_ID = FBX_ID;

		var wrapModeU = textureNode.properties.WrapModeU;
		var wrapModeV = textureNode.properties.WrapModeV;

		var valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
		var valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

		// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
		// 0: repeat(default), 1: clamp

		texture.wrapS = valueU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		texture.wrapT = valueV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

		if ( 'Scaling' in textureNode.properties ) {

			var values = textureNode.properties.Scaling.value;

			texture.repeat.x = values[ 0 ];
			texture.repeat.y = values[ 1 ];

		}

		loader.setPath( currentPath );

		return texture;

	}


	// Parse nodes in FBXTree.Objects.subNodes.Material
	function parseMaterials( FBXTree, textureMap, connections ) {

		var materialMap = new Map();

		if ( 'Material' in FBXTree.Objects.subNodes ) {

			var materialNodes = FBXTree.Objects.subNodes.Material;
			for ( var nodeID in materialNodes ) {

				var material = parseMaterial( materialNodes[ nodeID ], textureMap, connections );
				if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

			}

		}

		return materialMap;

	}

	// Parse single node in FBXTree.Objects.subNodes.Material
	// Materials are connected to texture maps in FBXTree.Objects.subNodes.Textures
	// FBX format currently only supports Lambert and Phong shading models
	function parseMaterial( materialNode, textureMap, connections ) {

		var FBX_ID = materialNode.id;
		var name = materialNode.attrName;
		var type = materialNode.properties.ShadingModel;

		//Case where FBX wraps shading model in property object.
		if ( typeof type === 'object' ) {

			type = type.value;

		}

		// Ignore unused materials which don't have any connections.
		if ( ! connections.has( FBX_ID ) ) return null;

		var children = connections.get( FBX_ID ).children;

		var parameters = parseParameters( materialNode.properties, textureMap, children );

		var material;

		switch ( type.toLowerCase() ) {

			case 'phong':
				material = new THREE.MeshPhongMaterial();
				break;
			case 'lambert':
				material = new THREE.MeshLambertMaterial();
				break;
			default:
				console.warn( 'THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type );
				material = new THREE.MeshPhongMaterial( { color: 0x3300ff } );
				break;

		}

		material.setValues( parameters );
		material.name = name;

		return material;

	}

	// Parse FBX material and return parameters suitable for a three.js material
	// Also parse the texture map and return any textures associated with the material
	function parseParameters( properties, textureMap, childrenRelationships ) {

		var parameters = {};

		if ( properties.BumpFactor ) {

			parameters.bumpScale = properties.BumpFactor.value;

		}
		if ( properties.Diffuse ) {

			parameters.color = parseColor( properties.Diffuse );

		}
		if ( properties.DisplacementFactor ) {

			parameters.displacementScale = properties.DisplacementFactor.value;

		}
		if ( properties.ReflectionFactor ) {

			parameters.reflectivity = properties.ReflectionFactor.value;

		}
		if ( properties.Specular ) {

			parameters.specular = parseColor( properties.Specular );

		}
		if ( properties.Shininess ) {

			parameters.shininess = properties.Shininess.value;

		}
		if ( properties.Emissive ) {

			parameters.emissive = parseColor( properties.Emissive );

		}
		if ( properties.EmissiveFactor ) {

			parameters.emissiveIntensity = parseFloat( properties.EmissiveFactor.value );

		}
		if ( properties.Opacity ) {

			parameters.opacity = parseFloat( properties.Opacity.value );

		}
		if ( parameters.opacity < 1.0 ) {

			parameters.transparent = true;

		}

		for ( var childrenRelationshipsIndex = 0, childrenRelationshipsLength = childrenRelationships.length; childrenRelationshipsIndex < childrenRelationshipsLength; ++ childrenRelationshipsIndex ) {

			var relationship = childrenRelationships[ childrenRelationshipsIndex ];

			var type = relationship.relationship;

			switch ( type ) {

				case 'Bump':
					parameters.bumpMap = textureMap.get( relationship.ID );
					break;

				case 'DiffuseColor':
					parameters.map = textureMap.get( relationship.ID );
					break;

				case 'DisplacementColor':
					parameters.displacementMap = textureMap.get( relationship.ID );
					break;


				case 'EmissiveColor':
					parameters.emissiveMap = textureMap.get( relationship.ID );
					break;

				case 'NormalMap':
					parameters.normalMap = textureMap.get( relationship.ID );
					break;

				case 'ReflectionColor':
					parameters.envMap = textureMap.get( relationship.ID );
					parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
					break;

				case 'SpecularColor':
					parameters.specularMap = textureMap.get( relationship.ID );
					break;

				case 'TransparentColor':
					parameters.alphaMap = textureMap.get( relationship.ID );
					parameters.transparent = true;
					break;

				case 'AmbientColor':
				case 'ShininessExponent': // AKA glossiness map
				case 'SpecularFactor': // AKA specularLevel
				case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
				default:
					console.warn( 'THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type );
					break;

			}

		}

		return parameters;

	}

	// Parse nodes in FBXTree.Objects.subNodes.Deformer
	// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
	// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
	function parseDeformers( FBXTree, connections ) {

		var deformers = {};

		if ( 'Deformer' in FBXTree.Objects.subNodes ) {

			var DeformerNodes = FBXTree.Objects.subNodes.Deformer;

			for ( var nodeID in DeformerNodes ) {

				var deformerNode = DeformerNodes[ nodeID ];

				if ( deformerNode.attrType === 'Skin' ) {

					var conns = connections.get( parseInt( nodeID ) );
					var skeleton = parseSkeleton( conns, DeformerNodes );
					skeleton.FBX_ID = parseInt( nodeID );

					deformers[ nodeID ] = skeleton;

				}

			}

		}

		return deformers;

	}

	// Parse single nodes in FBXTree.Objects.subNodes.Deformer
	// Generates a "Skeleton Representation" of FBX nodes based on an FBX Skin Deformer's connections
	// and an object containing SubDeformer nodes.
	function parseSkeleton( connections, DeformerNodes ) {

		var subDeformers = {};
		var children = connections.children;

		for ( var i = 0, l = children.length; i < l; ++ i ) {

			var child = children[ i ];

			var subDeformerNode = DeformerNodes[ child.ID ];

			var subDeformer = {
				FBX_ID: child.ID,
				index: i,
				indices: [],
				weights: [],
				transform: new THREE.Matrix4().fromArray( subDeformerNode.subNodes.Transform.properties.a ),
				transformLink: new THREE.Matrix4().fromArray( subDeformerNode.subNodes.TransformLink.properties.a ),
				linkMode: subDeformerNode.properties.Mode
			};

			if ( 'Indexes' in subDeformerNode.subNodes ) {

				subDeformer.indices = subDeformerNode.subNodes.Indexes.properties.a;
				subDeformer.weights = subDeformerNode.subNodes.Weights.properties.a;

			}

			subDeformers[ child.ID ] = subDeformer;

		}

		return {
			map: subDeformers,
			bones: []
		};

	}

	// Parse nodes in FBXTree.Objects.subNodes.Geometry
	function parseGeometries( FBXTree, connections, deformers ) {

		var geometryMap = new Map();

		if ( 'Geometry' in FBXTree.Objects.subNodes ) {

			var geometryNodes = FBXTree.Objects.subNodes.Geometry;

			for ( var nodeID in geometryNodes ) {

				var relationships = connections.get( parseInt( nodeID ) );
				var geo = parseGeometry( geometryNodes[ nodeID ], relationships, deformers );
				geometryMap.set( parseInt( nodeID ), geo );

			}

		}

		return geometryMap;

	}

	// Parse single node in FBXTree.Objects.subNodes.Geometry
	function parseGeometry( geometryNode, relationships, deformers ) {

		switch ( geometryNode.attrType ) {

			case 'Mesh':
				return parseMeshGeometry( geometryNode, relationships, deformers );
				break;

			case 'NurbsCurve':
				return parseNurbsGeometry( geometryNode );
				break;

		}

	}

	// Parse single node mesh geometry in FBXTree.Objects.subNodes.Geometry
	function parseMeshGeometry( geometryNode, relationships, deformers ) {

		for ( var i = 0; i < relationships.children.length; ++ i ) {

			var deformer = deformers[ relationships.children[ i ].ID ];
			if ( deformer !== undefined ) break;

		}

		return genGeometry( geometryNode, deformer );

	}

	// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.subNodes.Geometry
	function genGeometry( geometryNode, deformer ) {

		var subNodes = geometryNode.subNodes;

		var vertexPositions = subNodes.Vertices.properties.a;
		var vertexIndices = subNodes.PolygonVertexIndex.properties.a;

		// create arrays to hold the final data used to build the buffergeometry
		var vertexBuffer = [];
		var normalBuffer = [];
		var colorsBuffer = [];
		var uvsBuffer = [];
		var materialIndexBuffer = [];
		var vertexWeightsBuffer = [];
		var weightsIndicesBuffer = [];

		if ( subNodes.LayerElementColor ) {

			var colorInfo = getColors( subNodes.LayerElementColor[ 0 ] );

		}

		if ( subNodes.LayerElementMaterial ) {

			var materialInfo = getMaterials( subNodes.LayerElementMaterial[ 0 ] );

		}

		if ( subNodes.LayerElementNormal ) {

			var normalInfo = getNormals( subNodes.LayerElementNormal[ 0 ] );

		}

		if ( subNodes.LayerElementUV ) {

			var uvInfo = [];
			var i = 0;
			while ( subNodes.LayerElementUV[ i ] ) {

				uvInfo.push( getUVs( subNodes.LayerElementUV[ i ] ) );
				i ++;

			}

		}


		var weightTable = {};

		if ( deformer ) {

			var subDeformers = deformer.map;

			for ( var key in subDeformers ) {

				var subDeformer = subDeformers[ key ];
				var indices = subDeformer.indices;

				for ( var j = 0; j < indices.length; j ++ ) {

					var index = indices[ j ];
					var weight = subDeformer.weights[ j ];

					if ( weightTable[ index ] === undefined ) weightTable[ index ] = [];

					weightTable[ index ].push( {
						id: subDeformer.index,
						weight: weight
					} );

				}

			}

		}

		var polygonIndex = 0;
		var faceLength = 0;
		var displayedWeightsWarning = false;

		// these will hold data for a single face
		var vertexPositionIndexes = [];
		var faceNormals = [];
		var faceColors = [];
		var faceUVs = [];
		var faceWeights = [];
		var faceWeightIndices = [];

		for ( var polygonVertexIndex = 0; polygonVertexIndex < vertexIndices.length; polygonVertexIndex ++ ) {

			var vertexIndex = vertexIndices[ polygonVertexIndex ];

			var endOfFace = false;

			// Face index and vertex index arrays are combined in a single array
			// A cube with quad faces looks like this:
			// PolygonVertexIndex: *24 {
			//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
			//  }
			// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
			// to find index of last vertex multiply by -1 and subtract 1: -3 * - 1 - 1 = 2
			if ( vertexIndex < 0 ) {

				vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
				vertexIndices[ polygonVertexIndex ] = vertexIndex;
				endOfFace = true;

			}

			var weightIndices = [];
			var weights = [];

			vertexPositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

			if ( colorInfo ) {

				var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, colorInfo );

				faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

			}

			if ( deformer ) {

				if ( weightTable[ vertexIndex ] !== undefined ) {

					var array = weightTable[ vertexIndex ];

					for ( var j = 0, jl = array.length; j < jl; j ++ ) {

						weights.push( array[ j ].weight );
						weightIndices.push( array[ j ].id );

					}

				}

				if ( weights.length > 4 ) {

					if ( ! displayedWeightsWarning ) {

						console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
						displayedWeightsWarning = true;

					}

					var WIndex = [ 0, 0, 0, 0 ];
					var Weight = [ 0, 0, 0, 0 ];

					weights.forEach( function ( weight, weightIndex ) {

						var currentWeight = weight;
						var currentIndex = weightIndices[ weightIndex ];

						Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

							if ( currentWeight > comparedWeight ) {

								comparedWeightArray[ comparedWeightIndex ] = currentWeight;
								currentWeight = comparedWeight;

								var tmp = WIndex[ comparedWeightIndex ];
								WIndex[ comparedWeightIndex ] = currentIndex;
								currentIndex = tmp;

							}

						} );

					} );

					weightIndices = WIndex;
					weights = Weight;

				}

				// if the weight array is shorter than 4 pad with 0s
				for ( var i = weights.length; i < 4; ++ i ) {

					weights[ i ] = 0;
					weightIndices[ i ] = 0;

				}

				for ( var i = 0; i < 4; ++ i ) {

					faceWeights.push( weights[ i ] );
					faceWeightIndices.push( weightIndices[ i ] );

				}

			}

			if ( normalInfo ) {

				var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, normalInfo );

				faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

			}

			if ( uvInfo ) {

				for ( var i = 0; i < uvInfo.length; i ++ ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uvInfo[ i ] );

					if ( faceUVs[ i ] === undefined ) {

						faceUVs[ i ] = [];

					}

					faceUVs[ i ].push(
						data[ 0 ],
						data[ 1 ]
					);

				}

			}

			faceLength ++;

			// we have reached the end of a face - it may have 4 sides though
			// in which case the data is split into to represent 3 sides faces
			if ( endOfFace ) {

				for ( var i = 2; i < faceLength; i ++ ) {

					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 0 ] ] );
					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 1 ] ] );
					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 2 ] ] );

					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 ] ] );
					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 ] ] );
					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 + 1 ] ] );
					vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 + 2 ] ] );

				}

				if ( deformer ) {

					for ( var i = 2; i < faceLength; i ++ ) {

						vertexWeightsBuffer.push( faceWeights[ 0 ] );
						vertexWeightsBuffer.push( faceWeights[ 1 ] );
						vertexWeightsBuffer.push( faceWeights[ 2 ] );
						vertexWeightsBuffer.push( faceWeights[ 3 ] );

						vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 ] );
						vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 + 1 ] );
						vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 + 2 ] );
						vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 + 3 ] );

						vertexWeightsBuffer.push( faceWeights[ i * 4 ] );
						vertexWeightsBuffer.push( faceWeights[ i * 4 + 1 ] );
						vertexWeightsBuffer.push( faceWeights[ i * 4 + 2 ] );
						vertexWeightsBuffer.push( faceWeights[ i * 4 + 3 ] );

						weightsIndicesBuffer.push( faceWeightIndices[ 0 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ 1 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ 2 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ 3 ] );

						weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 + 1 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 + 2 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 + 3 ] );

						weightsIndicesBuffer.push( faceWeightIndices[ i * 4 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ i * 4 + 1 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ i * 4 + 2 ] );
						weightsIndicesBuffer.push( faceWeightIndices[ i * 4 + 3 ] );

					}

				}

				if ( normalInfo ) {

					for ( var i = 2; i < faceLength; i ++ ) {

						normalBuffer.push( faceNormals[ 0 ] );
						normalBuffer.push( faceNormals[ 1 ] );
						normalBuffer.push( faceNormals[ 2 ] );

						normalBuffer.push( faceNormals[ ( i - 1 ) * 3 ] );
						normalBuffer.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
						normalBuffer.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

						normalBuffer.push( faceNormals[ i * 3 ] );
						normalBuffer.push( faceNormals[ i * 3 + 1 ] );
						normalBuffer.push( faceNormals[ i * 3 + 2 ] );

					}

				}

				if ( uvInfo ) {

					for ( var j = 0; j < uvInfo.length; j ++ ) {

						if ( uvsBuffer[ j ] === undefined ) uvsBuffer[ j ] = [];

						for ( var i = 2; i < faceLength; i ++ ) {

							uvsBuffer[ j ].push( faceUVs[ j ][ 0 ] );
							uvsBuffer[ j ].push( faceUVs[ j ][ 1 ] );

							uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
							uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

							uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 ] );
							uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

						}

					}

				}

				if ( colorInfo ) {

					for ( var i = 2; i < faceLength; i ++ ) {


						colorsBuffer.push( faceColors[ 0 ] );
						colorsBuffer.push( faceColors[ 1 ] );
						colorsBuffer.push( faceColors[ 2 ] );

						colorsBuffer.push( faceColors[ ( i - 1 ) * 3 ] );
						colorsBuffer.push( faceColors[ ( i - 1 ) * 3 + 1 ] );
						colorsBuffer.push( faceColors[ ( i - 1 ) * 3 + 2 ] );

						colorsBuffer.push( faceColors[ i * 3 ] );
						colorsBuffer.push( faceColors[ i * 3 + 1 ] );
						colorsBuffer.push( faceColors[ i * 3 + 2 ] );

					}

				}

				if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

					var materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, materialInfo )[ 0 ];

					for ( var i = 2; i < faceLength; i ++ ) {

						materialIndexBuffer.push( materialIndex );
						materialIndexBuffer.push( materialIndex );
						materialIndexBuffer.push( materialIndex );

					}

				}

				polygonIndex ++;

				endOfFace = false;
				faceLength = 0;

				// reset arrays for the next face
				vertexPositionIndexes = [];
				faceNormals = [];
				faceColors = [];
				faceUVs = [];
				faceWeights = [];
				faceWeightIndices = [];

			}

		}

		var geo = new THREE.BufferGeometry();
		geo.name = geometryNode.name;

		geo.addAttribute( 'position', new THREE.Float32BufferAttribute( vertexBuffer, 3 ) );

		if ( colorsBuffer.length > 0 ) {

			geo.addAttribute( 'color', new THREE.Float32BufferAttribute( colorsBuffer, 3 ) );

		}

		if ( deformer ) {

			geo.addAttribute( 'skinIndex', new THREE.Float32BufferAttribute( weightsIndicesBuffer, 4 ) );

			geo.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( vertexWeightsBuffer, 4 ) );

			// used later to bind the skeleton to the model
			geo.FBX_Deformer = deformer;

		}

		if ( normalBuffer.length > 0 ) {

			geo.addAttribute( 'normal', new THREE.Float32BufferAttribute( normalBuffer, 3 ) );

		}
		if ( uvsBuffer.length > 0 ) {

			for ( var i = 0; i < uvsBuffer.length; i ++ ) {

				var name = 'uv' + ( i + 1 ).toString();
				if ( i == 0 ) {

					name = 'uv';

				}

				geo.addAttribute( name, new THREE.Float32BufferAttribute( uvsBuffer[ i ], 2 ) );

			}

		}

		if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

			// Convert the material indices of each vertex into rendering groups on the geometry.
			var prevMaterialIndex = materialIndexBuffer[ 0 ];
			var startIndex = 0;

			for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {

				if ( materialIndexBuffer[ i ] !== prevMaterialIndex ) {

					geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

					prevMaterialIndex = materialIndexBuffer[ i ];
					startIndex = i;

				}

			}

			// the loop above doesn't add the last group, do that here.
			if ( geo.groups.length > 0 ) {

				var lastGroup = geo.groups[ geo.groups.length - 1 ];
				var lastIndex = lastGroup.start + lastGroup.count;

				if ( lastIndex !== materialIndexBuffer.length ) {

					geo.addGroup( lastIndex, materialIndexBuffer.length - lastIndex, prevMaterialIndex );

				}

			}

			// case where there are multiple materials but the whole geometry is only
			// using one of them
			if ( geo.groups.length === 0 ) {

				geo.addGroup( 0, materialIndexBuffer.length, materialIndexBuffer[ 0 ] );

			}

		}

		return geo;

	}

	// Parse normal from FBXTree.Objects.subNodes.Geometry.subNodes.LayerElementNormal if it exists
	function getNormals( NormalNode ) {

		var mappingType = NormalNode.properties.MappingInformationType;
		var referenceType = NormalNode.properties.ReferenceInformationType;
		var buffer = NormalNode.subNodes.Normals.properties.a;
		var indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			if ( 'NormalIndex' in NormalNode.subNodes ) {

				indexBuffer = NormalNode.subNodes.NormalIndex.properties.a;

			} else if ( 'NormalsIndex' in NormalNode.subNodes ) {

				indexBuffer = NormalNode.subNodes.NormalsIndex.properties.a;

			}

		}

		return {
			dataSize: 3,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse UVs from FBXTree.Objects.subNodes.Geometry.subNodes.LayerElementUV if it exists
	function getUVs( UVNode ) {

		var mappingType = UVNode.properties.MappingInformationType;
		var referenceType = UVNode.properties.ReferenceInformationType;
		var buffer = UVNode.subNodes.UV.properties.a;
		var indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			indexBuffer = UVNode.subNodes.UVIndex.properties.a;

		}

		return {
			dataSize: 2,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse Vertex Colors from FBXTree.Objects.subNodes.Geometry.subNodes.LayerElementColor if it exists
	function getColors( ColorNode ) {

		var mappingType = ColorNode.properties.MappingInformationType;
		var referenceType = ColorNode.properties.ReferenceInformationType;
		var buffer = ColorNode.subNodes.Colors.properties.a;
		var indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			indexBuffer = ColorNode.subNodes.ColorIndex.properties.a;

		}

		return {
			dataSize: 4,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse mapping and material data in FBXTree.Objects.subNodes.Geometry.subNodes.LayerElementMaterial if it exists
	function getMaterials( MaterialNode ) {

		var mappingType = MaterialNode.properties.MappingInformationType;
		var referenceType = MaterialNode.properties.ReferenceInformationType;

		if ( mappingType === 'NoMappingInformation' ) {

			return {
				dataSize: 1,
				buffer: [ 0 ],
				indices: [ 0 ],
				mappingType: 'AllSame',
				referenceType: referenceType
			};

		}

		var materialIndexBuffer = MaterialNode.subNodes.Materials.properties.a;

		// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
		// we expect.So we create an intermediate buffer that points to the index in the buffer,
		// for conforming with the other functions we've written for other data.
		var materialIndices = [];

		for ( var materialIndexBufferIndex = 0, materialIndexBufferLength = materialIndexBuffer.length; materialIndexBufferIndex < materialIndexBufferLength; ++ materialIndexBufferIndex ) {

			materialIndices.push( materialIndexBufferIndex );

		}

		return {
			dataSize: 1,
			buffer: materialIndexBuffer,
			indices: materialIndices,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Functions use the infoObject and given indices to return value array of geometry.
	// infoObject can be materialInfo, normalInfo, UVInfo or colorInfo
	// polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
	// polygonIndex - Index of polygon in geometry.
	// vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
	var dataArray = [];

	var GetData = {

		ByPolygonVertex: {

			Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = ( polygonVertexIndex * infoObject.dataSize );
				var to = ( polygonVertexIndex * infoObject.dataSize ) + infoObject.dataSize;

				// return infoObject.buffer.slice( from, to );
				return slice( dataArray, infoObject.buffer, from, to );

			},

			IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var index = infoObject.indices[ polygonVertexIndex ];
				var from = ( index * infoObject.dataSize );
				var to = ( index * infoObject.dataSize ) + infoObject.dataSize;

				// return infoObject.buffer.slice( from, to );
				return slice( dataArray, infoObject.buffer, from, to );

			}

		},

		ByPolygon: {

			Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = polygonIndex * infoObject.dataSize;
				var to = polygonIndex * infoObject.dataSize + infoObject.dataSize;

				// return infoObject.buffer.slice( from, to );
				return slice( dataArray, infoObject.buffer, from, to );

			},

			IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var index = infoObject.indices[ polygonIndex ];
				var from = index * infoObject.dataSize;
				var to = index * infoObject.dataSize + infoObject.dataSize;

				// return infoObject.buffer.slice( from, to );
				return slice( dataArray, infoObject.buffer, from, to );

			}

		},

		ByVertice: {

			Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = ( vertexIndex * infoObject.dataSize );
				var to = ( vertexIndex * infoObject.dataSize ) + infoObject.dataSize;

				// return infoObject.buffer.slice( from, to );
				return slice( dataArray, infoObject.buffer, from, to );

			}

		},

		AllSame: {

			IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = infoObject.indices[ 0 ] * infoObject.dataSize;
				var to = infoObject.indices[ 0 ] * infoObject.dataSize + infoObject.dataSize;

				// return infoObject.buffer.slice( from, to );
				return slice( dataArray, infoObject.buffer, from, to );

			}

		}

	};

	function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

		return GetData[ infoObject.mappingType ][ infoObject.referenceType ]( polygonVertexIndex, polygonIndex, vertexIndex, infoObject );

	}

	// Generate a NurbGeometry from a node in FBXTree.Objects.subNodes.Geometry
	function parseNurbsGeometry( geometryNode ) {

		if ( THREE.NURBSCurve === undefined ) {

			console.error( 'THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
			return new THREE.BufferGeometry();

		}

		var order = parseInt( geometryNode.properties.Order );

		if ( isNaN( order ) ) {

			console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geometryNode.properties.Order, geometryNode.id );
			return new THREE.BufferGeometry();

		}

		var degree = order - 1;

		var knots = geometryNode.subNodes.KnotVector.properties.a;
		var controlPoints = [];
		var pointsValues = geometryNode.subNodes.Points.properties.a;

		for ( var i = 0, l = pointsValues.length; i < l; i += 4 ) {

			controlPoints.push( new THREE.Vector4().fromArray( pointsValues, i ) );

		}

		var startKnot, endKnot;

		if ( geometryNode.properties.Form === 'Closed' ) {

			controlPoints.push( controlPoints[ 0 ] );

		} else if ( geometryNode.properties.Form === 'Periodic' ) {

			startKnot = degree;
			endKnot = knots.length - 1 - startKnot;

			for ( var i = 0; i < degree; ++ i ) {

				controlPoints.push( controlPoints[ i ] );

			}

		}

		var curve = new THREE.NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
		var vertices = curve.getPoints( controlPoints.length * 7 );

		var positions = new Float32Array( vertices.length * 3 );

		for ( var i = 0, l = vertices.length; i < l; ++ i ) {

			vertices[ i ].toArray( positions, i * 3 );

		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		return geometry;

	}


	// parse nodes in FBXTree.Objects.subNodes.Model and generate a THREE.Group
	function parseScene( FBXTree, connections, deformers, geometryMap, materialMap ) {

		var sceneGraph = new THREE.Group();

		var ModelNode = FBXTree.Objects.subNodes.Model;

		var modelArray = [];

		var modelMap = new Map();

		for ( var nodeID in ModelNode ) {

			var id = parseInt( nodeID );
			var node = ModelNode[ nodeID ];
			var conns = connections.get( id );
			var model = null;

			for ( var i = 0; i < conns.parents.length; ++ i ) {

				for ( var FBX_ID in deformers ) {

					var deformer = deformers[ FBX_ID ];
					var subDeformers = deformer.map;
					var subDeformer = subDeformers[ conns.parents[ i ].ID ];

					if ( subDeformer ) {

						var model2 = model;
						model = new THREE.Bone();
						deformer.bones[ subDeformer.index ] = model;

						// seems like we need this not to make non-connected bone, maybe?
						// TODO: confirm
						if ( model2 !== null ) model.add( model2 );

					}

				}

			}

			if ( ! model ) {

				switch ( node.attrType ) {

					// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
					case 'Camera':

						var cameraAttribute;

						for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

							var childID = conns.children[ childrenIndex ].ID;

							var attr = FBXTree.Objects.subNodes.NodeAttribute[ childID ];

							if ( attr !== undefined && attr.properties !== undefined ) {

								cameraAttribute = attr.properties;

							}

						}

						if ( cameraAttribute === undefined ) {

							model = new THREE.Object3D();

						} else {

							var type = 0;
							if ( cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1 ) {

								type = 1;

							}

							var nearClippingPlane = 1;
							if ( cameraAttribute.NearPlane !== undefined ) {

								nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

							}

							var farClippingPlane = 1000;
							if ( cameraAttribute.FarPlane !== undefined ) {

								farClippingPlane = cameraAttribute.FarPlane.value / 1000;

							}


							var width = window.innerWidth;
							var height = window.innerHeight;

							if ( cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined ) {

								width = cameraAttribute.AspectWidth.value;
								height = cameraAttribute.AspectHeight.value;

							}

							var aspect = width / height;

							var fov = 45;
							if ( cameraAttribute.FieldOfView !== undefined ) {

								fov = cameraAttribute.FieldOfView.value;

							}

							switch ( type ) {

								case 0: // Perspective
									model = new THREE.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
									break;

								case 1: // Orthographic
									model = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane );
									break;

								default:
									console.warn( 'THREE.FBXLoader: Unknown camera type ' + type + '.' );
									model = new THREE.Object3D();
									break;

							}

						}

						break;


					// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
					case 'Light':

						var lightAttribute;

						for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

							var childID = conns.children[ childrenIndex ].ID;

							var attr = FBXTree.Objects.subNodes.NodeAttribute[ childID ];

							if ( attr !== undefined && attr.properties !== undefined ) {

								lightAttribute = attr.properties;

							}

						}

						if ( lightAttribute === undefined ) {

							model = new THREE.Object3D();

						} else {

							var type;

							// LightType can be undefined for Point lights
							if ( lightAttribute.LightType === undefined ) {

								type = 0;

							} else {

								type = lightAttribute.LightType.value;

							}

							var color = 0xffffff;

							if ( lightAttribute.Color !== undefined ) {

								color = parseColor( lightAttribute.Color.value );

							}

							var intensity = ( lightAttribute.Intensity === undefined ) ? 1 : lightAttribute.Intensity.value / 100;

							// light disabled
							if ( lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0 ) {

								intensity = 0;

							}

							var distance = 0;
							if ( lightAttribute.FarAttenuationEnd !== undefined ) {

								if ( lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0 ) {

									distance = 0;

								} else {

									distance = lightAttribute.FarAttenuationEnd.value / 1000;

								}

							}

							// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
							var decay = 1;

							switch ( type ) {

								case 0: // Point
									model = new THREE.PointLight( color, intensity, distance, decay );
									break;

								case 1: // Directional
									model = new THREE.DirectionalLight( color, intensity );
									break;

								case 2: // Spot
									var angle = Math.PI / 3;

									if ( lightAttribute.InnerAngle !== undefined ) {

										angle = THREE.Math.degToRad( lightAttribute.InnerAngle.value );

									}

									var penumbra = 0;
									if ( lightAttribute.OuterAngle !== undefined ) {

										// TODO: this is not correct - FBX calculates outer and inner angle in degrees
										// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
										// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
										penumbra = THREE.Math.degToRad( lightAttribute.OuterAngle.value );
										penumbra = Math.max( penumbra, 1 );

									}

									model = new THREE.SpotLight( color, intensity, distance, angle, penumbra, decay );
									break;

								default:
									console.warn( 'THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a THREE.PointLight.' );
									model = new THREE.PointLight( color, intensity );
									break;

							}

							if ( lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1 ) {

								model.castShadow = true;

							}

						}

						break;

					case 'Mesh':

						var geometry = null;
						var material = null;
						var materials = [];

						for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

							var child = conns.children[ childrenIndex ];

							if ( geometryMap.has( child.ID ) ) {

								geometry = geometryMap.get( child.ID );

							}

							if ( materialMap.has( child.ID ) ) {

								materials.push( materialMap.get( child.ID ) );

							}

						}
						if ( materials.length > 1 ) {

							material = materials;

						} else if ( materials.length > 0 ) {

							material = materials[ 0 ];

						} else {

							material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
							materials.push( material );

						}
						if ( 'color' in geometry.attributes ) {

							for ( var materialIndex = 0, numMaterials = materials.length; materialIndex < numMaterials; ++ materialIndex ) {

								materials[ materialIndex ].vertexColors = THREE.VertexColors;

							}

						}
						if ( geometry.FBX_Deformer ) {

							for ( var materialsIndex = 0, materialsLength = materials.length; materialsIndex < materialsLength; ++ materialsIndex ) {

								materials[ materialsIndex ].skinning = true;

							}
							model = new THREE.SkinnedMesh( geometry, material );

						} else {

							model = new THREE.Mesh( geometry, material );

						}
						break;

					case 'NurbsCurve':
						var geometry = null;

						for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

							var child = conns.children[ childrenIndex ];

							if ( geometryMap.has( child.ID ) ) {

								geometry = geometryMap.get( child.ID );

							}

						}

						// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
						material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 5 } );
						model = new THREE.Line( geometry, material );
						break;

					default:
						model = new THREE.Group();
						break;

				}

			}

			model.name = THREE.PropertyBinding.sanitizeNodeName( node.attrName );
			model.FBX_ID = id;

			modelArray.push( model );
			modelMap.set( id, model );

		}

		for ( var modelArrayIndex = 0, modelArrayLength = modelArray.length; modelArrayIndex < modelArrayLength; ++ modelArrayIndex ) {

			var model = modelArray[ modelArrayIndex ];

			var node = ModelNode[ model.FBX_ID ];

			if ( 'Lcl_Translation' in node.properties ) {

				model.position.fromArray( node.properties.Lcl_Translation.value );

			}

			if ( 'Lcl_Rotation' in node.properties ) {

				var rotation = node.properties.Lcl_Rotation.value.map( THREE.Math.degToRad );
				rotation.push( 'ZYX' );
				model.rotation.fromArray( rotation );

			}

			if ( 'Lcl_Scaling' in node.properties ) {

				model.scale.fromArray( node.properties.Lcl_Scaling.value );

			}

			if ( 'PreRotation' in node.properties ) {

				var array = node.properties.PreRotation.value.map( THREE.Math.degToRad );
				array[ 3 ] = 'ZYX';

				var preRotations = new THREE.Euler().fromArray( array );

				preRotations = new THREE.Quaternion().setFromEuler( preRotations );
				var currentRotation = new THREE.Quaternion().setFromEuler( model.rotation );
				preRotations.multiply( currentRotation );
				model.rotation.setFromQuaternion( preRotations, 'ZYX' );

			}

			// allow transformed pivots - see https://github.com/mrdoob/three.js/issues/11895
			if ( 'GeometricTranslation' in node.properties ) {

				var array = node.properties.GeometricTranslation.value;

				model.traverse( function ( child ) {

					if ( child.geometry ) {

						child.geometry.translate( array[ 0 ], array[ 1 ], array[ 2 ] );

					}

				} );

			}

			if ( 'LookAtProperty' in node.properties ) {

				var conns = connections.get( model.FBX_ID );

				for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

					var child = conns.children[ childrenIndex ];

					if ( child.relationship === 'LookAtProperty' ) {

						var lookAtTarget = FBXTree.Objects.subNodes.Model[ child.ID ];

						if ( 'Lcl_Translation' in lookAtTarget.properties ) {

							var pos = lookAtTarget.properties.Lcl_Translation.value;

							// DirectionalLight, SpotLight
							if ( model.target !== undefined ) {

								model.target.position.set( pos[ 0 ], pos[ 1 ], pos[ 2 ] );
								sceneGraph.add( model.target );


							} else { // Cameras and other Object3Ds

								model.lookAt( new THREE.Vector3( pos[ 0 ], pos[ 1 ], pos[ 2 ] ) );

							}

						}

					}

				}

			}

			var conns = connections.get( model.FBX_ID );
			for ( var parentIndex = 0; parentIndex < conns.parents.length; parentIndex ++ ) {

				var pIndex = findIndex( modelArray, function ( mod ) {

					return mod.FBX_ID === conns.parents[ parentIndex ].ID;

				} );
				if ( pIndex > - 1 ) {

					modelArray[ pIndex ].add( model );
					break;

				}

			}
			if ( model.parent === null ) {

				sceneGraph.add( model );

			}

		}


		// Now with the bones created, we can update the skeletons and bind them to the skinned meshes.
		sceneGraph.updateMatrixWorld( true );

		var worldMatrices = new Map();

		// Put skeleton into bind pose.
		if ( 'Pose' in FBXTree.Objects.subNodes ) {

			var BindPoseNode = FBXTree.Objects.subNodes.Pose;
			for ( var nodeID in BindPoseNode ) {

				if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

					BindPoseNode = BindPoseNode[ nodeID ];
					break;

				}

			}

			var PoseNode = BindPoseNode.subNodes.PoseNode;

			for ( var PoseNodeIndex = 0, PoseNodeLength = PoseNode.length; PoseNodeIndex < PoseNodeLength; ++ PoseNodeIndex ) {

				var node = PoseNode[ PoseNodeIndex ];

				var rawMatWrd = new THREE.Matrix4().fromArray( node.subNodes.Matrix.properties.a );

				worldMatrices.set( parseInt( node.properties.Node ), rawMatWrd );

			}

		}

		for ( var FBX_ID in deformers ) {

			var deformer = deformers[ FBX_ID ];
			var subDeformers = deformer.map;

			for ( var key in subDeformers ) {

				var subDeformer = subDeformers[ key ];
				var subDeformerIndex = subDeformer.index;

				var bone = deformer.bones[ subDeformerIndex ];
				if ( ! worldMatrices.has( bone.FBX_ID ) ) {

					break;

				}
				var mat = worldMatrices.get( bone.FBX_ID );
				bone.matrixWorld.copy( mat );

			}

			// Now that skeleton is in bind pose, bind to model.
			deformer.skeleton = new THREE.Skeleton( deformer.bones );

			var conns = connections.get( deformer.FBX_ID );
			var parents = conns.parents;

			for ( var parentsIndex = 0, parentsLength = parents.length; parentsIndex < parentsLength; ++ parentsIndex ) {

				var parent = parents[ parentsIndex ];

				if ( geometryMap.has( parent.ID ) ) {

					var geoID = parent.ID;
					var geoConns = connections.get( geoID );

					for ( var i = 0; i < geoConns.parents.length; ++ i ) {

						if ( modelMap.has( geoConns.parents[ i ].ID ) ) {

							var model = modelMap.get( geoConns.parents[ i ].ID );

							model.bind( deformer.skeleton, model.matrixWorld );
							break;

						}

					}

				}

			}

		}

		//Skeleton is now bound, return objects to starting world positions.
		sceneGraph.updateMatrixWorld( true );

		// Silly hack with the animation parsing. We're gonna pretend the scene graph has a skeleton
		// to attach animations to, since FBX treats animations as animations for the entire scene,
		// not just for individual objects.
		sceneGraph.skeleton = {
			bones: modelArray
		};

		var animations = parseAnimations( FBXTree, connections, sceneGraph );

		addAnimations( sceneGraph, animations );


		// Parse ambient color - if it's not set to black (default), create an ambient light
		if ( 'GlobalSettings' in FBXTree && 'AmbientColor' in FBXTree.GlobalSettings.properties ) {

			var ambientColor = FBXTree.GlobalSettings.properties.AmbientColor.value;
			var r = ambientColor[ 0 ];
			var g = ambientColor[ 1 ];
			var b = ambientColor[ 2 ];

			if ( r !== 0 || g !== 0 || b !== 0 ) {

				var color = new THREE.Color( r, g, b );
				sceneGraph.add( new THREE.AmbientLight( color, 1 ) );

			}

		}

		return sceneGraph;

	}

	// Parses animation information from nodes in
	// FBXTree.Objects.subNodes.AnimationCurve ( connected to AnimationCurveNode )
	// FBXTree.Objects.subNodes.AnimationCurveNode ( connected to AnimationLayer and an animated property in some other node )
	// FBXTree.Objects.subNodes.AnimationLayer ( connected to AnimationStack )
	// FBXTree.Objects.subNodes.AnimationStack
	function parseAnimations( FBXTree, connections, sceneGraph ) {

		var rawNodes = FBXTree.Objects.subNodes.AnimationCurveNode;
		var rawCurves = FBXTree.Objects.subNodes.AnimationCurve;
		var rawLayers = FBXTree.Objects.subNodes.AnimationLayer;
		var rawStacks = FBXTree.Objects.subNodes.AnimationStack;

		var fps = 30; // default framerate

		if ( 'GlobalSettings' in FBXTree && 'TimeMode' in FBXTree.GlobalSettings.properties ) {

			/* Autodesk time mode documentation can be found here:
			*	http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/class_fbx_time.html,topicNumber=cpp_ref_class_fbx_time_html
			*/
			var timeModeEnum = [
				30, // 0: eDefaultMode
				120, // 1: eFrames120
				100, // 2: eFrames100
				60, // 3: eFrames60
				50, // 4: eFrames50
				48, // 5: eFrames48
				30, // 6: eFrames30 (black and white NTSC )
				30, // 7: eFrames30Drop
				29.97, // 8: eNTSCDropFrame
				29.97, // 90: eNTSCFullFrame
				25, // 10: ePal ( PAL/SECAM )
				24, // 11: eFrames24 (Film/Cinema)
				1, // 12: eFrames1000 (use for date time))
				23.976, // 13: eFilmFullFrame
				30, // 14: eCustom: use GlobalSettings.properties.CustomFrameRate.value
				96, // 15: eFrames96
				72, // 16: eFrames72
				59.94, // 17: eFrames59dot94
			];

			var eMode = FBXTree.GlobalSettings.properties.TimeMode.value;

			if ( eMode === 14 ) {

				if ( 'CustomFrameRate' in FBXTree.GlobalSettings.properties ) {

					fps = FBXTree.GlobalSettings.properties.CustomFrameRate.value;

					fps = ( fps === - 1 ) ? 30 : fps;

				}

			} else if ( eMode <= 17 ) { // for future proofing - if more eModes get added, they will default to 30fps

				fps = timeModeEnum[ eMode ];

			}

		}

		var returnObject = {
			curves: new Map(),
			layers: {},
			stacks: {},
			length: 0,
			fps: fps,
			frames: 0
		};

		var animationCurveNodes = [];
		for ( var nodeID in rawNodes ) {

			if ( nodeID.match( /\d+/ ) ) {

				var animationNode = parseAnimationNode( FBXTree, rawNodes[ nodeID ], connections, sceneGraph );
				animationCurveNodes.push( animationNode );

			}

		}

		var tmpMap = new Map();
		for ( var animationCurveNodeIndex = 0; animationCurveNodeIndex < animationCurveNodes.length; ++ animationCurveNodeIndex ) {

			if ( animationCurveNodes[ animationCurveNodeIndex ] === null ) {

				continue;

			}
			tmpMap.set( animationCurveNodes[ animationCurveNodeIndex ].id, animationCurveNodes[ animationCurveNodeIndex ] );

		}

		var animationCurves = [];
		for ( nodeID in rawCurves ) {

			if ( nodeID.match( /\d+/ ) ) {

				var animationCurve = parseAnimationCurve( rawCurves[ nodeID ] );

				// seems like this check would be necessary?
				if ( ! connections.has( animationCurve.id ) ) continue;

				animationCurves.push( animationCurve );

				var firstParentConn = connections.get( animationCurve.id ).parents[ 0 ];
				var firstParentID = firstParentConn.ID;
				var firstParentRelationship = firstParentConn.relationship;
				var axis = '';

				if ( firstParentRelationship.match( /X/ ) ) {

					axis = 'x';

				} else if ( firstParentRelationship.match( /Y/ ) ) {

					axis = 'y';

				} else if ( firstParentRelationship.match( /Z/ ) ) {

					axis = 'z';

				} else {

					continue;

				}

				tmpMap.get( firstParentID ).curves[ axis ] = animationCurve;

			}

		}

		tmpMap.forEach( function ( curveNode ) {

			var id = curveNode.containerBoneID;
			if ( ! returnObject.curves.has( id ) ) {

				returnObject.curves.set( id, { T: null, R: null, S: null } );

			}
			returnObject.curves.get( id )[ curveNode.attr ] = curveNode;

			if ( curveNode.attr === 'R' ) {

				var curves = curveNode.curves;

				// Some FBX files have an AnimationCurveNode
				// which isn't any connected to any AnimationCurve.
				// Setting animation parameter for them here.

				if ( curves.x === null ) {

					curves.x = {
						version: null,
						times: [ 0.0 ],
						values: [ 0.0 ]
					};

				}

				if ( curves.y === null ) {

					curves.y = {
						version: null,
						times: [ 0.0 ],
						values: [ 0.0 ]
					};

				}

				if ( curves.z === null ) {

					curves.z = {
						version: null,
						times: [ 0.0 ],
						values: [ 0.0 ]
					};

				}

				curves.x.values = curves.x.values.map( THREE.Math.degToRad );
				curves.y.values = curves.y.values.map( THREE.Math.degToRad );
				curves.z.values = curves.z.values.map( THREE.Math.degToRad );

				if ( curveNode.preRotations !== null ) {

					var preRotations = new THREE.Euler().setFromVector3( curveNode.preRotations, 'ZYX' );
					preRotations = new THREE.Quaternion().setFromEuler( preRotations );
					var frameRotation = new THREE.Euler();
					var frameRotationQuaternion = new THREE.Quaternion();
					for ( var frame = 0; frame < curves.x.times.length; ++ frame ) {

						frameRotation.set( curves.x.values[ frame ], curves.y.values[ frame ], curves.z.values[ frame ], 'ZYX' );
						frameRotationQuaternion.setFromEuler( frameRotation ).premultiply( preRotations );
						frameRotation.setFromQuaternion( frameRotationQuaternion, 'ZYX' );
						curves.x.values[ frame ] = frameRotation.x;
						curves.y.values[ frame ] = frameRotation.y;
						curves.z.values[ frame ] = frameRotation.z;

					}

				}

			}

		} );

		for ( var nodeID in rawLayers ) {

			var layer = [];
			var children = connections.get( parseInt( nodeID ) ).children;

			for ( var childIndex = 0; childIndex < children.length; childIndex ++ ) {

				// Skip lockInfluenceWeights
				if ( tmpMap.has( children[ childIndex ].ID ) ) {

					var curveNode = tmpMap.get( children[ childIndex ].ID );
					var boneID = curveNode.containerBoneID;
					if ( layer[ boneID ] === undefined ) {

						layer[ boneID ] = {
							T: null,
							R: null,
							S: null
						};

					}

					layer[ boneID ][ curveNode.attr ] = curveNode;

				}

			}

			returnObject.layers[ nodeID ] = layer;

		}

		for ( var nodeID in rawStacks ) {

			var layers = [];
			var children = connections.get( parseInt( nodeID ) ).children;
			var timestamps = { max: 0, min: Number.MAX_VALUE };

			for ( var childIndex = 0; childIndex < children.length; ++ childIndex ) {

				var currentLayer = returnObject.layers[ children[ childIndex ].ID ];

				if ( currentLayer !== undefined ) {

					layers.push( currentLayer );

					for ( var currentLayerIndex = 0, currentLayerLength = currentLayer.length; currentLayerIndex < currentLayerLength; ++ currentLayerIndex ) {

						var layer = currentLayer[ currentLayerIndex ];

						if ( layer ) {

							getCurveNodeMaxMinTimeStamps( layer, timestamps );

						}

					}

				}

			}

			// Do we have an animation clip with actual length?
			if ( timestamps.max > timestamps.min ) {

				returnObject.stacks[ nodeID ] = {
					name: rawStacks[ nodeID ].attrName,
					layers: layers,
					length: timestamps.max - timestamps.min,
					frames: ( timestamps.max - timestamps.min ) * returnObject.fps
				};

			}

		}

		return returnObject;

	}

	function parseAnimationNode( FBXTree, animationCurveNode, connections, sceneGraph ) {

		var rawModels = FBXTree.Objects.subNodes.Model;

		var returnObject = {

			id: animationCurveNode.id,
			attr: animationCurveNode.attrName,
			internalID: animationCurveNode.id,
			attrX: false,
			attrY: false,
			attrZ: false,
			containerBoneID: - 1,
			containerID: - 1,
			curves: {
				x: null,
				y: null,
				z: null
			},
			preRotations: null

		};

		if ( returnObject.attr.match( /S|R|T/ ) ) {

			for ( var attributeKey in animationCurveNode.properties ) {

				if ( attributeKey.match( /X/ ) ) {

					returnObject.attrX = true;

				}
				if ( attributeKey.match( /Y/ ) ) {

					returnObject.attrY = true;

				}
				if ( attributeKey.match( /Z/ ) ) {

					returnObject.attrZ = true;

				}

			}

		} else {

			return null;

		}

		var conns = connections.get( returnObject.id );
		var containerIndices = conns.parents;

		for ( var containerIndicesIndex = containerIndices.length - 1; containerIndicesIndex >= 0; -- containerIndicesIndex ) {

			var boneID = findIndex( sceneGraph.skeleton.bones, function ( bone ) {

				return bone.FBX_ID === containerIndices[ containerIndicesIndex ].ID;

			} );
			if ( boneID > - 1 ) {

				returnObject.containerBoneID = boneID;
				returnObject.containerID = containerIndices[ containerIndicesIndex ].ID;
				var model = rawModels[ returnObject.containerID.toString() ];
				if ( 'PreRotation' in model.properties ) {

					returnObject.preRotations = parseVector3( model.properties.PreRotation ).multiplyScalar( Math.PI / 180 );

				}
				break;

			}

		}

		return returnObject;

	}

	function parseAnimationCurve( animationCurve ) {

		return {
			version: null,
			id: animationCurve.id,
			internalID: animationCurve.id,
			times: animationCurve.subNodes.KeyTime.properties.a.map( convertFBXTimeToSeconds ),
			values: animationCurve.subNodes.KeyValueFloat.properties.a,

			attrFlag: animationCurve.subNodes.KeyAttrFlags.properties.a,
			attrData: animationCurve.subNodes.KeyAttrDataFloat.properties.a,
		};

	}

	// Sets the maxTimeStamp and minTimeStamp variables if it has timeStamps that are either larger or smaller
	// than the max or min respectively.
	function getCurveNodeMaxMinTimeStamps( layer, timestamps ) {

		if ( layer.R ) {

			getCurveMaxMinTimeStamp( layer.R.curves, timestamps );

		}
		if ( layer.S ) {

			getCurveMaxMinTimeStamp( layer.S.curves, timestamps );

		}
		if ( layer.T ) {

			getCurveMaxMinTimeStamp( layer.T.curves, timestamps );

		}

	}

	// Sets the maxTimeStamp and minTimeStamp if one of the curve's time stamps
	// exceeds the maximum or minimum.
	function getCurveMaxMinTimeStamp( curve, timestamps ) {

		if ( curve.x ) {

			getCurveAxisMaxMinTimeStamps( curve.x, timestamps );

		}
		if ( curve.y ) {

			getCurveAxisMaxMinTimeStamps( curve.y, timestamps );

		}
		if ( curve.z ) {

			getCurveAxisMaxMinTimeStamps( curve.z, timestamps );

		}

	}

	// Sets the maxTimeStamp and minTimeStamp if one of its timestamps exceeds the maximum or minimum.
	function getCurveAxisMaxMinTimeStamps( axis, timestamps ) {

		timestamps.max = axis.times[ axis.times.length - 1 ] > timestamps.max ? axis.times[ axis.times.length - 1 ] : timestamps.max;
		timestamps.min = axis.times[ 0 ] < timestamps.min ? axis.times[ 0 ] : timestamps.min;

	}

	function addAnimations( group, animations ) {

		if ( group.animations === undefined ) {

			group.animations = [];

		}

		var stacks = animations.stacks;

		for ( var key in stacks ) {

			var stack = stacks[ key ];

			var animationData = {
				name: stack.name,
				fps: animations.fps,
				length: stack.length,
				hierarchy: []
			};

			var bones = group.skeleton.bones;

			for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

				var bone = bones[ bonesIndex ];

				var name = bone.name.replace( /.*:/, '' );
				var parentIndex = findIndex( bones, function ( parentBone ) {

					return bone.parent === parentBone;

				} );
				animationData.hierarchy.push( { parent: parentIndex, name: name, keys: [] } );

			}

			for ( var frame = 0; frame <= stack.frames; frame ++ ) {

				for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

					var bone = bones[ bonesIndex ];
					var boneIndex = bonesIndex;

					var animationNode = stack.layers[ 0 ][ boneIndex ];

					for ( var hierarchyIndex = 0, hierarchyLength = animationData.hierarchy.length; hierarchyIndex < hierarchyLength; ++ hierarchyIndex ) {

						var node = animationData.hierarchy[ hierarchyIndex ];

						if ( node.name === bone.name ) {

							node.keys.push( generateKey( animations, animationNode, bone, frame ) );

						}

					}

				}

			}

			group.animations.push( THREE.AnimationClip.parseAnimation( animationData, bones ) );

		}

	}

	var euler = new THREE.Euler();
	var quaternion = new THREE.Quaternion();

	function generateKey( animations, animationNode, bone, frame ) {

		var key = {
			time: frame / animations.fps,
			pos: bone.position.toArray(),
			rot: bone.quaternion.toArray(),
			scl: bone.scale.toArray()
		};

		if ( animationNode === undefined ) return key;

		euler.setFromQuaternion( bone.quaternion, 'ZYX', false );

		try {

			if ( hasCurve( animationNode, 'T' ) && hasKeyOnFrame( animationNode.T, frame ) ) {

				if ( animationNode.T.curves.x.values[ frame ] ) {

					key.pos[ 0 ] = animationNode.T.curves.x.values[ frame ];

				}

				if ( animationNode.T.curves.y.values[ frame ] ) {

					key.pos[ 1 ] = animationNode.T.curves.y.values[ frame ];

				}

				if ( animationNode.T.curves.z.values[ frame ] ) {

					key.pos[ 2 ] = animationNode.T.curves.z.values[ frame ];

				}

			}

			if ( hasCurve( animationNode, 'R' ) && hasKeyOnFrame( animationNode.R, frame ) ) {

				// Only update the euler's values if rotation is defined for the axis on this frame
				if ( animationNode.R.curves.x.values[ frame ] ) {

					euler.x = animationNode.R.curves.x.values[ frame ];

				}

				if ( animationNode.R.curves.y.values[ frame ] ) {

					euler.y = animationNode.R.curves.y.values[ frame ];

				}

				if ( animationNode.R.curves.z.values[ frame ] ) {

					euler.z = animationNode.R.curves.z.values[ frame ];

				}

				quaternion.setFromEuler( euler );
				key.rot = quaternion.toArray();

			}

			if ( hasCurve( animationNode, 'S' ) && hasKeyOnFrame( animationNode.S, frame ) ) {

				if ( animationNode.T.curves.x.values[ frame ] ) {

					key.scl[ 0 ] = animationNode.S.curves.x.values[ frame ];

				}

				if ( animationNode.T.curves.y.values[ frame ] ) {

					key.scl[ 1 ] = animationNode.S.curves.y.values[ frame ];

				}

				if ( animationNode.T.curves.z.values[ frame ] ) {

					key.scl[ 2 ] = animationNode.S.curves.z.values[ frame ];

				}

			}

		} catch ( error ) {

			// Curve is not fully plotted.
			console.log( 'THREE.FBXLoader: ', bone );
			console.log( 'THREE.FBXLoader: ', error );

		}

		return key;

	}

	var AXES = [ 'x', 'y', 'z' ];

	function hasCurve( animationNode, attribute ) {

		if ( animationNode === undefined ) {

			return false;

		}

		var attributeNode = animationNode[ attribute ];

		if ( ! attributeNode ) {

			return false;

		}

		return AXES.every( function ( key ) {

			return attributeNode.curves[ key ] !== null;

		} );

	}

	function hasKeyOnFrame( attributeNode, frame ) {

		return AXES.every( function ( key ) {

			return isKeyExistOnFrame( attributeNode.curves[ key ], frame );

		} );

	}

	function isKeyExistOnFrame( curve, frame ) {

		return curve.values[ frame ] !== undefined;

	}

	// parse an FBX file in ASCII format
	function TextParser() {}

	Object.assign( TextParser.prototype, {

		getPrevNode: function () {

			return this.nodeStack[ this.currentIndent - 2 ];

		},

		getCurrentNode: function () {

			return this.nodeStack[ this.currentIndent - 1 ];

		},

		getCurrentProp: function () {

			return this.currentProp;

		},

		pushStack: function ( node ) {

			this.nodeStack.push( node );
			this.currentIndent += 1;

		},

		popStack: function () {

			this.nodeStack.pop();
			this.currentIndent -= 1;

		},

		setCurrentProp: function ( val, name ) {

			this.currentProp = val;
			this.currentPropName = name;

		},

		parse: function ( text ) {

			this.currentIndent = 0;
			this.allNodes = new FBXTree();
			this.nodeStack = [];
			this.currentProp = [];
			this.currentPropName = '';

			var split = text.split( '\n' );

			for ( var lineNum = 0, lineLength = split.length; lineNum < lineLength; lineNum ++ ) {

				var l = split[ lineNum ];

				// skip comment line
				if ( l.match( /^[\s\t]*;/ ) ) {

					continue;

				}

				// skip empty line
				if ( l.match( /^[\s\t]*$/ ) ) {

					continue;

				}

				// beginning of node
				var beginningOfNodeExp = new RegExp( '^\\t{' + this.currentIndent + '}(\\w+):(.*){', '' );
				var match = l.match( beginningOfNodeExp );

				if ( match ) {

					var nodeName = match[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );
					var nodeAttrs = match[ 2 ].split( ',' );

					for ( var i = 0, l = nodeAttrs.length; i < l; i ++ ) {

						nodeAttrs[ i ] = nodeAttrs[ i ].trim().replace( /^"/, '' ).replace( /"$/, '' );

					}

					this.parseNodeBegin( l, nodeName, nodeAttrs || null );
					continue;

				}

				// node's property
				var propExp = new RegExp( '^\\t{' + ( this.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
				var match = l.match( propExp );

				if ( match ) {

					var propName = match[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
					var propValue = match[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

					// for special case: base64 image data follows "Content: ," line
					//	Content: ,
					//	 "iVB..."
					if ( propName === 'Content' && propValue === ',' ) {

						propValue = split[ ++ lineNum ].replace( /"/g, '' ).replace( /,$/, '' ).trim();

					}

					this.parseNodeProperty( l, propName, propValue );
					continue;

				}

				// end of node
				var endOfNodeExp = new RegExp( '^\\t{' + ( this.currentIndent - 1 ) + '}}' );

				if ( l.match( endOfNodeExp ) ) {

					this.nodeEnd();
					continue;

				}

				// large arrays are split over multiple lines terminated with a ',' character
				// if this is encountered the line needs to be joined to the previous line
				if ( l.match( /^[^\s\t}]/ ) ) {

					this.parseNodePropertyContinued( l );

				}

			}

			return this.allNodes;

		},

		parseNodeBegin: function ( line, nodeName, nodeAttrs ) {

			var node = { 'name': nodeName, properties: {}, 'subNodes': {} };
			var attrs = this.parseNodeAttr( nodeAttrs );
			var currentNode = this.getCurrentNode();

			// a top node
			if ( this.currentIndent === 0 ) {

				this.allNodes.add( nodeName, node );

			} else { // a subnode

				// if the subnode already exists, append it
				if ( nodeName in currentNode.subNodes ) {

					var tmp = currentNode.subNodes[ nodeName ];

					if ( this.isFlattenNode( currentNode.subNodes[ nodeName ] ) ) {

						if ( attrs.id === '' ) {

							currentNode.subNodes[ nodeName ] = [];
							currentNode.subNodes[ nodeName ].push( tmp );

						} else {

							currentNode.subNodes[ nodeName ] = {};
							currentNode.subNodes[ nodeName ][ tmp.id ] = tmp;

						}

					}

					if ( attrs.id === '' ) {

						currentNode.subNodes[ nodeName ].push( node );

					} else {

						currentNode.subNodes[ nodeName ][ attrs.id ] = node;

					}

				} else if ( typeof attrs.id === 'number' || attrs.id.match( /^\d+$/ ) ) {

					currentNode.subNodes[ nodeName ] = {};
					currentNode.subNodes[ nodeName ][ attrs.id ] = node;

				} else {

					currentNode.subNodes[ nodeName ] = node;

				}

			}


			// for this	↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
			// NodeAttribute: 1001463072, "NodeAttribute::", "LimbNode" {
			if ( nodeAttrs ) {

				node.id = attrs.id;
				node.attrName = attrs.name;
				node.attrType = attrs.type;

			}

			this.pushStack( node );

		},

		parseNodeAttr: function ( attrs ) {

			var id = attrs[ 0 ];

			if ( attrs[ 0 ] !== '' ) {

				id = parseInt( attrs[ 0 ] );

				if ( isNaN( id ) ) {

					id = attrs[ 0 ];

				}

			}

			var name = '', type = '';

			if ( attrs.length > 1 ) {

				name = attrs[ 1 ].replace( /^(\w+)::/, '' );
				type = attrs[ 2 ];

			}

			return { id: id, name: name, type: type };

		},

		parseNodeProperty: function ( line, propName, propValue ) {

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			// special case where the parent node is something like "Properties70"
			// these children nodes must treated carefully
			if ( parentName !== undefined ) {

				var propMatch = parentName.match( /Properties(\d)+/ );
				if ( propMatch ) {

					this.parseNodeSpecialProperty( line, propName, propValue );
					return;

				}

			}

			// Connections
			if ( propName === 'C' ) {

				var connProps = propValue.split( ',' ).slice( 1 );
				var from = parseInt( connProps[ 0 ] );
				var to = parseInt( connProps[ 1 ] );

				var rest = propValue.split( ',' ).slice( 3 );

				rest = rest.map( function ( elem ) {

					return elem.trim().replace( /^"/, '' );

				} );

				propName = 'connections';
				propValue = [ from, to ];
				append( propValue, rest );

				if ( currentNode.properties[ propName ] === undefined ) {

					currentNode.properties[ propName ] = [];

				}

			}

			// Node
			if ( propName === 'Node' ) {

				var id = parseInt( propValue );
				currentNode.properties.id = id;
				currentNode.id = id;

			}

			// already exists in properties, then append this
			if ( propName in currentNode.properties ) {

				if ( Array.isArray( currentNode.properties[ propName ] ) ) {

					currentNode.properties[ propName ].push( propValue );

				} else {

					currentNode.properties[ propName ] += propValue;

				}

			} else {

				if ( Array.isArray( currentNode.properties[ propName ] ) ) {

					currentNode.properties[ propName ].push( propValue );

				} else {

					currentNode.properties[ propName ] = propValue;

				}

			}

			this.setCurrentProp( currentNode.properties, propName );

			// convert string to array, unless it ends in ',' in which case more will be added to it
			if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

				currentNode.properties.a = parseNumberArray( propValue );

			}

		},

		parseNodePropertyContinued: function ( line ) {

			this.currentProp[ this.currentPropName ] += line;

			// if the line doesn't end in ',' we have reached the end of the property value
			// so convert the string to an array
			if ( line.slice( - 1 ) !== ',' ) {

				var currentNode = this.getCurrentNode();
				currentNode.properties.a = parseNumberArray( currentNode.properties.a );

			}

		},

		parseNodeSpecialProperty: function ( line, propName, propValue ) {

			// split this
			// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
			// into array like below
			// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
			var props = propValue.split( '",' );

			for ( var i = 0, l = props.length; i < l; i ++ ) {

				props[ i ] = props[ i ].trim().replace( /^\"/, '' ).replace( /\s/, '_' );

			}

			var innerPropName = props[ 0 ];
			var innerPropType1 = props[ 1 ];
			var innerPropType2 = props[ 2 ];
			var innerPropFlag = props[ 3 ];
			var innerPropValue = props[ 4 ];

			// cast value to its type
			switch ( innerPropType1 ) {

				case 'int':
				case 'enum':
				case 'bool':
				case 'ULongLong':
					innerPropValue = parseInt( innerPropValue );
					break;

				case 'double':
				case 'Number':
				case 'FieldOfView':
					innerPropValue = parseFloat( innerPropValue );
					break;

				case 'ColorRGB':
				case 'Vector3D':
				case 'Lcl_Translation':
				case 'Lcl_Rotation':
				case 'Lcl_Scaling':
					innerPropValue = parseNumberArray( innerPropValue );
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode().properties[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp( this.getPrevNode().properties, innerPropName );

		},

		nodeEnd: function () {

			this.popStack();

		},

		isFlattenNode: function ( node ) {

			return ( 'subNodes' in node && 'properties' in node ) ? true : false;

		}

	} );

	// Parse an FBX file in Binary format
	function BinaryParser() {}

	Object.assign( BinaryParser.prototype, {

		parse: function ( buffer ) {

			var reader = new BinaryReader( buffer );
			reader.skip( 23 ); // skip magic 23 bytes

			var version = reader.getUint32();

			console.log( 'THREE.FBXLoader: FBX binary version: ' + version );

			var allNodes = new FBXTree();

			while ( ! this.endOfContent( reader ) ) {

				var node = this.parseNode( reader, version );
				if ( node !== null ) allNodes.add( node.name, node );

			}

			return allNodes;

		},

		// Check if reader has reached the end of content.
		endOfContent: function ( reader ) {

			// footer size: 160bytes + 16-byte alignment padding
			// - 16bytes: magic
			// - padding til 16-byte alignment (at least 1byte?)
			//	(seems like some exporters embed fixed 15 or 16bytes?)
			// - 4bytes: magic
			// - 4bytes: version
			// - 120bytes: zero
			// - 16bytes: magic
			if ( reader.size() % 16 === 0 ) {

				return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

			} else {

				return reader.getOffset() + 160 + 16 >= reader.size();

			}

		},

		parseNode: function ( reader, version ) {

			// The first three data sizes depends on version.
			var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
			var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

			// note: do not remove this even if you get a linter warning as it moves the buffer forward
			var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

			var nameLen = reader.getUint8();
			var name = reader.getString( nameLen );

			// Regards this node as NULL-record if endOffset is zero
			if ( endOffset === 0 ) return null;

			var propertyList = [];

			for ( var i = 0; i < numProperties; i ++ ) {

				propertyList.push( this.parseProperty( reader ) );

			}

			// Regards the first three elements in propertyList as id, attrName, and attrType
			var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
			var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
			var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

			var subNodes = {};
			var properties = {};

			var isSingleProperty = false;

			// check if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			if ( numProperties === 1 && reader.getOffset() === endOffset ) {

				isSingleProperty = true;

			}

			while ( endOffset > reader.getOffset() ) {

				var node = this.parseNode( reader, version );

				if ( node === null ) continue;

				// special case: child node is single property
				if ( node.singleProperty === true ) {

					var value = node.propertyList[ 0 ];

					if ( Array.isArray( value ) ) {

						subNodes[ node.name ] = node;

						node.properties.a = value;

					} else {

						properties[ node.name ] = value;

					}

					continue;

				}

				// parse connections
				if ( name === 'Connections' && node.name === 'C' ) {

					var array = [];

					for ( var i = 1, il = node.propertyList.length; i < il; i ++ ) {

						array[ i - 1 ] = node.propertyList[ i ];

					}

					if ( properties.connections === undefined ) {

						properties.connections = [];

					}

					properties.connections.push( array );

					continue;

				}

				// special case: child node is Properties\d+
				// move child node's properties to this node.
				if ( node.name.match( /^Properties\d+$/ ) ) {

					var keys = Object.keys( node.properties );

					for ( var i = 0, il = keys.length; i < il; i ++ ) {

						var key = keys[ i ];
						properties[ key ] = node.properties[ key ];

					}

					continue;

				}

				// parse 'properties70'
				if ( name.match( /^Properties\d+$/ ) && node.name === 'P' ) {

					var innerPropName = node.propertyList[ 0 ];
					var innerPropType1 = node.propertyList[ 1 ];
					var innerPropType2 = node.propertyList[ 2 ];
					var innerPropFlag = node.propertyList[ 3 ];
					var innerPropValue;

					if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
					if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

					if ( innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

						innerPropValue = [
							node.propertyList[ 4 ],
							node.propertyList[ 5 ],
							node.propertyList[ 6 ]
						];

					} else {

						innerPropValue = node.propertyList[ 4 ];

					}

					// this will be copied to parent, see above
					properties[ innerPropName ] = {

						'type': innerPropType1,
						'type2': innerPropType2,
						'flag': innerPropFlag,
						'value': innerPropValue

					};

					continue;

				}

				if ( subNodes[ node.name ] === undefined ) {

					if ( typeof node.id === 'number' ) {

						subNodes[ node.name ] = {};
						subNodes[ node.name ][ node.id ] = node;

					} else {

						subNodes[ node.name ] = node;

					}

				} else {

					if ( node.id === '' ) {

						if ( ! Array.isArray( subNodes[ node.name ] ) ) {

							subNodes[ node.name ] = [ subNodes[ node.name ] ];

						}

						subNodes[ node.name ].push( node );

					} else {

						if ( subNodes[ node.name ][ node.id ] === undefined ) {

							subNodes[ node.name ][ node.id ] = node;

						} else {

							// conflict id. irregular?
							if ( ! Array.isArray( subNodes[ node.name ][ node.id ] ) ) {

								subNodes[ node.name ][ node.id ] = [ subNodes[ node.name ][ node.id ] ];

							}

							subNodes[ node.name ][ node.id ].push( node );

						}

					}

				}

			}

			return {

				singleProperty: isSingleProperty,
				id: id,
				attrName: attrName,
				attrType: attrType,
				name: name,
				properties: properties,
				propertyList: propertyList, // raw property list used by parent
				subNodes: subNodes

			};

		},

		parseProperty: function ( reader ) {

			var type = reader.getChar();

			switch ( type ) {

				case 'C':
					return reader.getBoolean();

				case 'D':
					return reader.getFloat64();

				case 'F':
					return reader.getFloat32();

				case 'I':
					return reader.getInt32();

				case 'L':
					return reader.getInt64();

				case 'R':
					var length = reader.getUint32();
					return reader.getArrayBuffer( length );

				case 'S':
					var length = reader.getUint32();
					return reader.getString( length );

				case 'Y':
					return reader.getInt16();

				case 'b':
				case 'c':
				case 'd':
				case 'f':
				case 'i':
				case 'l':

					var arrayLength = reader.getUint32();
					var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
					var compressedLength = reader.getUint32();

					if ( encoding === 0 ) {

						switch ( type ) {

							case 'b':
							case 'c':
								return reader.getBooleanArray( arrayLength );

							case 'd':
								return reader.getFloat64Array( arrayLength );

							case 'f':
								return reader.getFloat32Array( arrayLength );

							case 'i':
								return reader.getInt32Array( arrayLength );

							case 'l':
								return reader.getInt64Array( arrayLength );

						}

					}

					if ( window.Zlib === undefined ) {

						throw new Error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

					}

					var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
					var reader2 = new BinaryReader( inflate.decompress().buffer );

					switch ( type ) {

						case 'b':
						case 'c':
							return reader2.getBooleanArray( arrayLength );

						case 'd':
							return reader2.getFloat64Array( arrayLength );

						case 'f':
							return reader2.getFloat32Array( arrayLength );

						case 'i':
							return reader2.getInt32Array( arrayLength );

						case 'l':
							return reader2.getInt64Array( arrayLength );

					}

				default:
					throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

			}

		}

	} );


	function BinaryReader( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

	}

	Object.assign( BinaryReader.prototype, {

		getOffset: function () {

			return this.offset;

		},

		size: function () {

			return this.dv.buffer.byteLength;

		},

		skip: function ( length ) {

			this.offset += length;

		},

		// seems like true/false representation depends on exporter.
		// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
		// then sees LSB.
		getBoolean: function () {

			return ( this.getUint8() & 1 ) === 1;

		},

		getBooleanArray: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getBoolean() );

			}

			return a;

		},

		getInt8: function () {

			var value = this.dv.getInt8( this.offset );
			this.offset += 1;
			return value;

		},

		getInt8Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt8() );

			}

			return a;

		},

		getUint8: function () {

			var value = this.dv.getUint8( this.offset );
			this.offset += 1;
			return value;

		},

		getUint8Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint8() );

			}

			return a;

		},

		getInt16: function () {

			var value = this.dv.getInt16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getInt16Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt16() );

			}

			return a;

		},

		getUint16: function () {

			var value = this.dv.getUint16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getUint16Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint16() );

			}

			return a;

		},

		getInt32: function () {

			var value = this.dv.getInt32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getInt32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt32() );

			}

			return a;

		},

		getUint32: function () {

			var value = this.dv.getUint32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getUint32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint32() );

			}

			return a;

		},

		// JavaScript doesn't support 64-bit integer so calculate this here
		// 1 << 32 will return 1 so using multiply operation instead here.
		// There's a possibility that this method returns wrong value if the value
		// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
		// TODO: safely handle 64-bit integer
		getInt64: function () {

			var low, high;

			if ( this.littleEndian ) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			// calculate negative value
			if ( high & 0x80000000 ) {

				high = ~ high & 0xFFFFFFFF;
				low = ~ low & 0xFFFFFFFF;

				if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

				low = ( low + 1 ) & 0xFFFFFFFF;

				return - ( high * 0x100000000 + low );

			}

			return high * 0x100000000 + low;

		},

		getInt64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt64() );

			}

			return a;

		},

		// Note: see getInt64() comment
		getUint64: function () {

			var low, high;

			if ( this.littleEndian ) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			return high * 0x100000000 + low;

		},

		getUint64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint64() );

			}

			return a;

		},

		getFloat32: function () {

			var value = this.dv.getFloat32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getFloat32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getFloat32() );

			}

			return a;

		},

		getFloat64: function () {

			var value = this.dv.getFloat64( this.offset, this.littleEndian );
			this.offset += 8;
			return value;

		},

		getFloat64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getFloat64() );

			}

			return a;

		},

		getArrayBuffer: function ( size ) {

			var value = this.dv.buffer.slice( this.offset, this.offset + size );
			this.offset += size;
			return value;

		},

		getChar: function () {

			return String.fromCharCode( this.getUint8() );

		},

		getString: function ( size ) {

			var s = '';

			while ( size > 0 ) {

				var value = this.getUint8();
				size --;

				if ( value === 0 ) break;

				s += String.fromCharCode( value );

			}

			// Manage UTF8 encoding
			s = decodeURIComponent( escape( s ) );

			this.skip( size );

			return s;

		}

	} );

	// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
	// and BinaryParser( FBX Binary format)
	function FBXTree() {}

	Object.assign( FBXTree.prototype, {

		add: function ( key, val ) {

			this[ key ] = val;

		},

	} );

	function isFbxFormatBinary( buffer ) {

		var CORRECT = 'Kaydara FBX Binary  \0';

		return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString( buffer, 0, CORRECT.length );

	}

	function isFbxFormatASCII( text ) {

		var CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

		var cursor = 0;

		function read( offset ) {

			var result = text[ offset - 1 ];
			text = text.slice( cursor + offset );
			cursor ++;
			return result;

		}

		for ( var i = 0; i < CORRECT.length; ++ i ) {

			var num = read( 1 );
			if ( num === CORRECT[ i ] ) {

				return false;

			}

		}

		return true;

	}

	function getFbxVersion( text ) {

		var versionRegExp = /FBXVersion: (\d+)/;
		var match = text.match( versionRegExp );
		if ( match ) {

			var version = parseInt( match[ 1 ] );
			return version;

		}
		throw new Error( 'THREE.FBXLoader: Cannot find the version number for the file given.' );

	}

	// Converts FBX ticks into real time seconds.
	function convertFBXTimeToSeconds( time ) {

		return time / 46186158000;

	}


	// Parses comma separated list of numbers and returns them an array.
	// Used internally by the TextParser
	function parseNumberArray( value ) {

		var array = value.split( ',' );

		for ( var i = 0, l = array.length; i < l; i ++ ) {

			array[ i ] = parseFloat( array[ i ] );

		}

		return array;

	}

	function parseVector3( property ) {

		return new THREE.Vector3().fromArray( property.value );

	}

	function parseColor( property ) {

		return new THREE.Color().fromArray( property.value );

	}

	// Converts ArrayBuffer to String.
	function convertArrayBufferToString( buffer, from, to ) {

		if ( from === undefined ) from = 0;
		if ( to === undefined ) to = buffer.byteLength;

		var array = new Uint8Array( buffer, from, to );

		if ( window.TextDecoder !== undefined ) {

			return new TextDecoder().decode( array );

		}

		var s = '';

		for ( var i = 0, il = array.length; i < il; i ++ ) {

			s += String.fromCharCode( array[ i ] );

		}

		return s;

	}

	function findIndex( array, func ) {

		for ( var i = 0, l = array.length; i < l; i ++ ) {

			if ( func( array[ i ] ) ) return i;

		}

		return - 1;

	}

	function append( a, b ) {

		for ( var i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

			a[ j ] = b[ i ];

		}

	}

	function slice( a, b, from, to ) {

		for ( var i = from, j = 0; i < to; i ++, j ++ ) {

			a[ j ] = b[ i ];

		}

		return a;

	}

} )();
