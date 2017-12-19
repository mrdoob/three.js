/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 * @author Lewy Blue https://github.com/looeee
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
 *	Euler rotation order
 *
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

			var resourceDirectory = THREE.LoaderUtils.extractUrlBase( url );

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
			var skeletons = parseDeformers( FBXTree, connections );
			var geometryMap = parseGeometries( FBXTree, connections, skeletons );
			var sceneGraph = parseScene( FBXTree, connections, skeletons, geometryMap, materials );

			return sceneGraph;

		}

	} );

	// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
	// and details the connection type
	function parseConnections( FBXTree ) {

		var connectionMap = new Map();

		if ( 'Connections' in FBXTree ) {

			var rawConnections = FBXTree.Connections.properties.connections;

			rawConnections.forEach( function ( rawConnection ) {

				var fromID = rawConnection[ 0 ];
				var toID = rawConnection[ 1 ];
				var relationship = rawConnection[ 2 ];

				if ( ! connectionMap.has( fromID ) ) {

					connectionMap.set( fromID, {
						parents: [],
						children: []
					} );

				}

				var parentRelationship = { ID: toID, relationship: relationship };
				connectionMap.get( fromID ).parents.push( parentRelationship );

				if ( ! connectionMap.has( toID ) ) {

					connectionMap.set( toID, {
						parents: [],
						children: []
					} );

				}

				var childRelationship = { ID: fromID, relationship: relationship };
				connectionMap.get( toID ).children.push( childRelationship );

			} );

		}

		return connectionMap;

	}

	// Parse FBXTree.Objects.subNodes.Video for embedded image data
	// These images are connected to textures in FBXTree.Objects.subNodes.Textures
	// via FBXTree.Connections. Note that images can be duplicated here, in which case only one
	// may have a .Content field - we'll check for this and duplicate the data in the imageMap
	function parseImages( FBXTree ) {

		var imageMap = new Map();

		var names = {};
		var duplicates = [];

		if ( 'Video' in FBXTree.Objects.subNodes ) {

			var videoNodes = FBXTree.Objects.subNodes.Video;

			for ( var nodeID in videoNodes ) {

				var videoNode = videoNodes[ nodeID ];

				var id = parseInt( nodeID );

				// check whether the file name is used by another videoNode
				// and if so keep a record of both ids as a duplicate pair [ id1, id2 ]
				if ( videoNode.properties.fileName in names ) {

					duplicates.push( [ id, names[ videoNode.properties.fileName ] ] );

				}

				names[ videoNode.properties.fileName ] = id;

				// raw image data is in videoNode.properties.Content
				if ( 'Content' in videoNode.properties && videoNode.properties.Content !== '' ) {

					var image = parseImage( videoNodes[ nodeID ] );

					imageMap.set( id, image );

				}

			}

		}


		// check each duplicate pair - if only one is in the image map then
		// create an entry for the other id containing the same image data
		// Note: it seems to be possible for entries to have the same file name but different
		// content, we won't overwrite these
		duplicates.forEach( function ( duplicatePair ) {

			if ( imageMap.has( duplicatePair[ 0 ] ) && ! imageMap.has( duplicatePair[ 1 ] ) ) {

				var image = imageMap.get( duplicatePair[ 0 ] );
				imageMap.set( duplicatePair[ 1 ], image );

			} else if ( imageMap.has( duplicatePair[ 1 ] ) && ! imageMap.has( duplicatePair[ 0 ] ) ) {

				var image = imageMap.get( duplicatePair[ 1 ] );
				imageMap.set( duplicatePair[ 0 ], image );

			}

		} );

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

		if ( typeof content === 'string' ) { // ASCII format

			return 'data:' + type + ';base64,' + content;

		} else { // Binary Format

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

		var texture = loadTexture( textureNode, loader, imageMap, connections );

		texture.ID = textureNode.id;

		texture.name = textureNode.attrName;

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

		return texture;

	}

	// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
	function loadTexture( textureNode, loader, imageMap, connections ) {

		var fileName;

		var filePath = textureNode.properties.FileName;
		var relativeFilePath = textureNode.properties.RelativeFilename;

		var children = connections.get( textureNode.id ).children;

		if ( children !== undefined && children.length > 0 && imageMap.has( children[ 0 ].ID ) ) {

			fileName = imageMap.get( children[ 0 ].ID );

		}
		// check that relative path is not an actually an absolute path and if so use it to load texture
		else if ( relativeFilePath !== undefined && relativeFilePath[ 0 ] !== '/' && relativeFilePath.match( /^[a-zA-Z]:/ ) === null ) {

			fileName = relativeFilePath;

		}
		// texture specified by absolute path
		else {

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

		loader.setPath( currentPath );

		return texture;

	}

	// Parse nodes in FBXTree.Objects.subNodes.Material
	function parseMaterials( FBXTree, textureMap, connections ) {

		var materialMap = new Map();

		if ( 'Material' in FBXTree.Objects.subNodes ) {

			var materialNodes = FBXTree.Objects.subNodes.Material;
			for ( var nodeID in materialNodes ) {

				var material = parseMaterial( FBXTree, materialNodes[ nodeID ], textureMap, connections );
				if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

			}

		}

		return materialMap;

	}

	// Parse single node in FBXTree.Objects.subNodes.Material
	// Materials are connected to texture maps in FBXTree.Objects.subNodes.Textures
	// FBX format currently only supports Lambert and Phong shading models
	function parseMaterial( FBXTree, materialNode, textureMap, connections ) {

		var ID = materialNode.id;
		var name = materialNode.attrName;
		var type = materialNode.properties.ShadingModel;

		//Case where FBX wraps shading model in property object.
		if ( typeof type === 'object' ) {

			type = type.value;

		}

		// Ignore unused materials which don't have any connections.
		if ( ! connections.has( ID ) ) return null;

		var parameters = parseParameters( FBXTree, materialNode.properties, textureMap, ID, connections );

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
	function parseParameters( FBXTree, properties, textureMap, ID, connections ) {

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

		connections.get( ID ).children.forEach( function ( child ) {

			var type = child.relationship;

			switch ( type ) {

				case 'Bump':
					parameters.bumpMap = textureMap.get( child.ID );
					break;

				case 'DiffuseColor':
					parameters.map = getTexture( FBXTree, textureMap, child.ID, connections );
					break;

				case 'DisplacementColor':
					parameters.displacementMap = getTexture( FBXTree, textureMap, child.ID, connections );
					break;


				case 'EmissiveColor':
					parameters.emissiveMap = getTexture( FBXTree, textureMap, child.ID, connections );
					break;

				case 'NormalMap':
					parameters.normalMap = getTexture( FBXTree, textureMap, child.ID, connections );
					break;

				case 'ReflectionColor':
					parameters.envMap = getTexture( FBXTree, textureMap, child.ID, connections );
					parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
					break;

				case 'SpecularColor':
					parameters.specularMap = getTexture( FBXTree, textureMap, child.ID, connections );
					break;

				case 'TransparentColor':
					parameters.alphaMap = getTexture( FBXTree, textureMap, child.ID, connections );
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

		} );

		return parameters;

	}

	// get a texture from the textureMap for use by a material.
	function getTexture( FBXTree, textureMap, id, connections ) {

		// if the texture is a layered texture, just use the first layer and issue a warning
		if ( 'LayeredTexture' in FBXTree.Objects.subNodes && id in FBXTree.Objects.subNodes.LayeredTexture ) {

			console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
			id = connections.get( id ).children[ 0 ].ID;

		}

		return textureMap.get( id );

	}

	// Parse nodes in FBXTree.Objects.subNodes.Deformer
	// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
	// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
	function parseDeformers( FBXTree, connections ) {

		var skeletons = {};

		if ( 'Deformer' in FBXTree.Objects.subNodes ) {

			var DeformerNodes = FBXTree.Objects.subNodes.Deformer;

			for ( var nodeID in DeformerNodes ) {

				var deformerNode = DeformerNodes[ nodeID ];

				if ( deformerNode.attrType === 'Skin' ) {

					var relationships = connections.get( parseInt( nodeID ) );

					var skeleton = parseSkeleton( relationships, DeformerNodes );
					skeleton.ID = nodeID;

					if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
					skeleton.geometryID = relationships.parents[ 0 ].ID;

					skeletons[ nodeID ] = skeleton;

				}

			}

		}

		return skeletons;

	}

	// Parse single nodes in FBXTree.Objects.subNodes.Deformer
	// The top level deformer nodes have type 'Skin' and subDeformer nodes have type 'Cluster'
	// Each skin node represents a skeleton and each cluster node represents a bone
	function parseSkeleton( connections, deformerNodes ) {

		var rawBones = [];

		connections.children.forEach( function ( child ) {

			var subDeformerNode = deformerNodes[ child.ID ];

			if ( subDeformerNode.attrType !== 'Cluster' ) return;

			var rawBone = {

				ID: child.ID,
				indices: [],
				weights: [],

				// the global initial transform of the geometry node this bone is connected to
				transform: new THREE.Matrix4().fromArray( subDeformerNode.subNodes.Transform.properties.a ),

				// the global initial transform of this bone
				transformLink: new THREE.Matrix4().fromArray( subDeformerNode.subNodes.TransformLink.properties.a ),

			};

			if ( 'Indexes' in subDeformerNode.subNodes ) {

				rawBone.indices = subDeformerNode.subNodes.Indexes.properties.a;
				rawBone.weights = subDeformerNode.subNodes.Weights.properties.a;

			}

			rawBones.push( rawBone );

		} );

		return {

			rawBones: rawBones,
			bones: []

		};

	}

	// Parse nodes in FBXTree.Objects.subNodes.Geometry
	function parseGeometries( FBXTree, connections, skeletons ) {

		var geometryMap = new Map();

		if ( 'Geometry' in FBXTree.Objects.subNodes ) {

			var geometryNodes = FBXTree.Objects.subNodes.Geometry;

			for ( var nodeID in geometryNodes ) {

				var relationships = connections.get( parseInt( nodeID ) );
				var geo = parseGeometry( FBXTree, relationships, geometryNodes[ nodeID ], skeletons );
				geometryMap.set( parseInt( nodeID ), geo );

			}

		}

		return geometryMap;

	}

	// Parse single node in FBXTree.Objects.subNodes.Geometry
	function parseGeometry( FBXTree, relationships, geometryNode, skeletons ) {

		switch ( geometryNode.attrType ) {

			case 'Mesh':
				return parseMeshGeometry( FBXTree, relationships, geometryNode, skeletons );
				break;

			case 'NurbsCurve':
				return parseNurbsGeometry( geometryNode );
				break;

		}

	}

	// Parse single node mesh geometry in FBXTree.Objects.subNodes.Geometry
	function parseMeshGeometry( FBXTree, relationships, geometryNode, skeletons ) {

		var modelNodes = relationships.parents.map( function ( parent ) {

			return FBXTree.Objects.subNodes.Model[ parent.ID ];

		} );

		// don't create geometry if it is not associated with any models
		if ( modelNodes.length === 0 ) return;

		var skeleton = relationships.children.reduce( function ( skeleton, child ) {

			if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

			return skeleton;

		}, null );

		var preTransform = new THREE.Matrix4();

		// TODO: if there is more than one model associated with the geometry, AND the models have
		// different geometric transforms, then this will cause problems
		// if ( modelNodes.length > 1 ) { }

		// For now just assume one model and get the preRotations from that
		var modelNode = modelNodes[ 0 ];

		if ( 'GeometricRotation' in modelNode.properties ) {

			var array = modelNode.properties.GeometricRotation.value.map( THREE.Math.degToRad );
			array[ 3 ] = 'ZYX';

			preTransform.makeRotationFromEuler( new THREE.Euler().fromArray( array ) );

		}

		if ( 'GeometricTranslation' in modelNode.properties ) {

			preTransform.setPosition( new THREE.Vector3().fromArray( modelNode.properties.GeometricTranslation.value ) );

		}

		return genGeometry( FBXTree, relationships, geometryNode, skeleton, preTransform );

	}

	// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.subNodes.Geometry
	function genGeometry( FBXTree, relationships, geometryNode, skeleton, preTransform ) {

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

		if ( skeleton !== null ) {

			skeleton.rawBones.forEach( function ( rawBone, i ) {

				// loop over the bone's vertex indices and weights
				rawBone.indices.forEach( function ( index, j ) {

					if ( weightTable[ index ] === undefined ) weightTable[ index ] = [];

					weightTable[ index ].push( {

						id: i,
						weight: rawBone.weights[ j ],

					} );

				} );

			} );

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

		vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

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

			if ( skeleton ) {

				if ( weightTable[ vertexIndex ] !== undefined ) {

					weightTable[ vertexIndex ].forEach( function ( wt ) {

						weights.push( wt.weight );
						weightIndices.push( wt.id );

					} );


				}

				if ( weights.length > 4 ) {

					if ( ! displayedWeightsWarning ) {

						console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
						displayedWeightsWarning = true;

					}

					var wIndex = [ 0, 0, 0, 0 ];
					var Weight = [ 0, 0, 0, 0 ];

					weights.forEach( function ( weight, weightIndex ) {

						var currentWeight = weight;
						var currentIndex = weightIndices[ weightIndex ];

						Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

							if ( currentWeight > comparedWeight ) {

								comparedWeightArray[ comparedWeightIndex ] = currentWeight;
								currentWeight = comparedWeight;

								var tmp = wIndex[ comparedWeightIndex ];
								wIndex[ comparedWeightIndex ] = currentIndex;
								currentIndex = tmp;

							}

						} );

					} );

					weightIndices = wIndex;
					weights = Weight;

				}

				// if the weight array is shorter than 4 pad with 0s
				while ( weights.length < 4 ) {

					weights.push( 0 );
					weightIndices.push( 0 );

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

			if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

				var materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, materialInfo )[ 0 ];

			}

			if ( uvInfo ) {

				uvInfo.forEach( function ( uv, i ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

					if ( faceUVs[ i ] === undefined ) {

						faceUVs[ i ] = [];

					}

					faceUVs[ i ].push( data[ 0 ] );
					faceUVs[ i ].push( data[ 1 ] );

				} );

			}

			faceLength ++;

			// we have reached the end of a face - it may have 4 sides though
			// in which case the data is split to represent two 3 sided faces
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

					if ( skeleton ) {

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

					if ( colorInfo ) {

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

					if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

						materialIndexBuffer.push( materialIndex );
						materialIndexBuffer.push( materialIndex );
						materialIndexBuffer.push( materialIndex );

					}

					if ( normalInfo ) {

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

					if ( uvInfo ) {

						uvInfo.forEach( function ( uv, j ) {

							if ( uvsBuffer[ j ] === undefined ) uvsBuffer[ j ] = [];

							uvsBuffer[ j ].push( faceUVs[ j ][ 0 ] );
							uvsBuffer[ j ].push( faceUVs[ j ][ 1 ] );

							uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
							uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

							uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 ] );
							uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

						} );

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

		} );

		var geo = new THREE.BufferGeometry();
		geo.name = geometryNode.name;

		var positionAttribute = new THREE.Float32BufferAttribute( vertexBuffer, 3 );

		preTransform.applyToBufferAttribute( positionAttribute );

		geo.addAttribute( 'position', positionAttribute );

		if ( colorsBuffer.length > 0 ) {

			geo.addAttribute( 'color', new THREE.Float32BufferAttribute( colorsBuffer, 3 ) );

		}

		if ( skeleton ) {

			geo.addAttribute( 'skinIndex', new THREE.Float32BufferAttribute( weightsIndicesBuffer, 4 ) );

			geo.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( vertexWeightsBuffer, 4 ) );

			// used later to bind the skeleton to the model
			geo.FBX_Deformer = skeleton;

		}

		if ( normalBuffer.length > 0 ) {

			geo.addAttribute( 'normal', new THREE.Float32BufferAttribute( normalBuffer, 3 ) );

		}

		uvsBuffer.forEach( function ( uvBuffer, i ) {

			// subsequent uv buffers are called 'uv1', 'uv2', ...
			var name = 'uv' + ( i + 1 ).toString();

			// the first uv buffer is just called 'uv'
			if ( i === 0 ) {

				name = 'uv';

			}

			geo.addAttribute( name, new THREE.Float32BufferAttribute( uvsBuffer[ i ], 2 ) );

		} );

		if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

			// Convert the material indices of each vertex into rendering groups on the geometry.
			var prevMaterialIndex = materialIndexBuffer[ 0 ];
			var startIndex = 0;

			materialIndexBuffer.forEach( function ( currentIndex, i ) {

				if ( currentIndex !== prevMaterialIndex ) {

					geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

					prevMaterialIndex = currentIndex;
					startIndex = i;

				}

			} );

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

		for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {

			materialIndices.push( i );

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
	// Parameters:
	// 	- polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
	// 	- polygonIndex - Index of polygon in geometry.
	// 	- vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
	// 	- infoObject: can be materialInfo, normalInfo, UVInfo or colorInfo
	// Index type:
	//	- Direct: index is same as polygonVertexIndex
	//	- IndexToDirect: infoObject has it's own set of indices
	var dataArray = [];

	var GetData = {

		ByPolygonVertex: {

			Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = ( polygonVertexIndex * infoObject.dataSize );
				var to = ( polygonVertexIndex * infoObject.dataSize ) + infoObject.dataSize;

				return slice( dataArray, infoObject.buffer, from, to );

			},

			IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var index = infoObject.indices[ polygonVertexIndex ];
				var from = ( index * infoObject.dataSize );
				var to = ( index * infoObject.dataSize ) + infoObject.dataSize;

				return slice( dataArray, infoObject.buffer, from, to );

			}

		},

		ByPolygon: {

			Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = polygonIndex * infoObject.dataSize;
				var to = polygonIndex * infoObject.dataSize + infoObject.dataSize;

				return slice( dataArray, infoObject.buffer, from, to );

			},

			IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var index = infoObject.indices[ polygonIndex ];
				var from = index * infoObject.dataSize;
				var to = index * infoObject.dataSize + infoObject.dataSize;

				return slice( dataArray, infoObject.buffer, from, to );

			}

		},

		ByVertice: {

			Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = ( vertexIndex * infoObject.dataSize );
				var to = ( vertexIndex * infoObject.dataSize ) + infoObject.dataSize;

				return slice( dataArray, infoObject.buffer, from, to );

			}

		},

		AllSame: {

			IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

				var from = infoObject.indices[ 0 ] * infoObject.dataSize;
				var to = infoObject.indices[ 0 ] * infoObject.dataSize + infoObject.dataSize;

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

		vertices.forEach( function ( vertex, i ) {

			vertex.toArray( positions, i * 3 );

		} );

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		return geometry;

	}

	// create the main THREE.Group() to be returned by the loader
	function parseScene( FBXTree, connections, skeletons, geometryMap, materialMap ) {

		var sceneGraph = new THREE.Group();

		var modelMap = parseModels( FBXTree, skeletons, geometryMap, materialMap, connections );

		var modelNodes = FBXTree.Objects.subNodes.Model;

		modelMap.forEach( function ( model ) {

			var modelNode = modelNodes[ model.ID ];
			setLookAtProperties( FBXTree, model, modelNode, connections, sceneGraph );

			var parentConnections = connections.get( model.ID ).parents;

			parentConnections.forEach( function ( connection ) {

				var parent = modelMap.get( connection.ID );
				if ( parent !== undefined ) parent.add( model );

			} );

			if ( model.parent === null ) {

				sceneGraph.add( model );

			}


		} );


		bindSkeleton( FBXTree, skeletons, geometryMap, modelMap, connections, sceneGraph );

		addAnimations( FBXTree, connections, sceneGraph, modelMap );

		createAmbientLight( FBXTree, sceneGraph );

		return sceneGraph;

	}

	// parse nodes in FBXTree.Objects.subNodes.Model
	function parseModels( FBXTree, skeletons, geometryMap, materialMap, connections ) {

		var modelMap = new Map();
		var modelNodes = FBXTree.Objects.subNodes.Model;

		for ( var nodeID in modelNodes ) {

			var id = parseInt( nodeID );
			var node = modelNodes[ nodeID ];
			var relationships = connections.get( id );

			var model = buildSkeleton( relationships, skeletons, id, node.attrName );

			if ( ! model ) {

				switch ( node.attrType ) {

					case 'Camera':
						model = createCamera( FBXTree, relationships );
						break;
					case 'Light':
						model = createLight( FBXTree, relationships );
						break;
					case 'Mesh':
						model = createMesh( FBXTree, relationships, geometryMap, materialMap );
						break;
					case 'NurbsCurve':
						model = createCurve( relationships, geometryMap );
						break;
					case 'LimbNode': // usually associated with a Bone, however if a Bone was not created we'll make a Group instead
					case 'Null':
					default:
						model = new THREE.Group();
						break;

				}

				model.name = THREE.PropertyBinding.sanitizeNodeName( node.attrName );
				model.ID = id;

			}

			setModelTransforms( FBXTree, model, node );
			modelMap.set( id, model );

		}

		return modelMap;

	}

	function buildSkeleton( relationships, skeletons, id, name ) {

		var bone = null;

		relationships.parents.forEach( function ( parent ) {

			for ( var ID in skeletons ) {

				var skeleton = skeletons[ ID ];

				skeleton.rawBones.forEach( function ( rawBone, i ) {

					if ( rawBone.ID === parent.ID ) {

						var subBone = bone;
						bone = new THREE.Bone();

						// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id
						bone.name = THREE.PropertyBinding.sanitizeNodeName( name );
						bone.ID = id;

						skeleton.bones[ i ] = bone;

						// In cases where a bone is shared between multiple meshes
						// duplicate the bone here and and it as a child of the first bone
						if ( subBone !== null ) {

							bone.add( subBone );

						}

					}

				} );

			}

		} );

		return bone;

	}

	// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
	function createCamera( FBXTree, relationships ) {

		var model;
		var cameraAttribute;

		relationships.children.forEach( function ( child ) {

			var attr = FBXTree.Objects.subNodes.NodeAttribute[ child.ID ];

			if ( attr !== undefined && attr.properties !== undefined ) {

				cameraAttribute = attr.properties;

			}

		} );

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

		return model;

	}

	// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
	function createLight( FBXTree, relationships ) {

		var model;
		var lightAttribute;

		relationships.children.forEach( function ( child ) {

			var attr = FBXTree.Objects.subNodes.NodeAttribute[ child.ID ];

			if ( attr !== undefined && attr.properties !== undefined ) {

				lightAttribute = attr.properties;

			}

		} );

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

				color = parseColor( lightAttribute.Color );

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

		return model;

	}

	function createMesh( FBXTree, relationships, geometryMap, materialMap ) {

		var model;
		var geometry = null;
		var material = null;
		var materials = [];

		// get geometry and materials(s) from connections
		relationships.children.forEach( function ( child ) {

			if ( geometryMap.has( child.ID ) ) {

				geometry = geometryMap.get( child.ID );

			}

			if ( materialMap.has( child.ID ) ) {

				materials.push( materialMap.get( child.ID ) );

			}

		} );

		if ( materials.length > 1 ) {

			material = materials;

		} else if ( materials.length > 0 ) {

			material = materials[ 0 ];

		} else {

			material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
			materials.push( material );

		}

		if ( 'color' in geometry.attributes ) {

			materials.forEach( function ( material ) {

				material.vertexColors = THREE.VertexColors;

			} );

		}

		if ( geometry.FBX_Deformer ) {

			materials.forEach( function ( material ) {

				material.skinning = true;

			} );

			model = new THREE.SkinnedMesh( geometry, material );

		} else {

			model = new THREE.Mesh( geometry, material );

		}

		return model;

	}

	function createCurve( relationships, geometryMap ) {

		var geometry = relationships.children.reduce( function ( geo, child ) {

			if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

			return geo;

		}, null );

		// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
		var material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 1 } );
		return new THREE.Line( geometry, material );

	}

	// Parse ambient color in FBXTree.GlobalSettings.properties - if it's not set to black (default), create an ambient light
	function createAmbientLight( FBXTree, sceneGraph ) {

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

	}

	function setLookAtProperties( FBXTree, model, modelNode, connections, sceneGraph ) {

		if ( 'LookAtProperty' in modelNode.properties ) {

			var children = connections.get( model.ID ).children;

			children.forEach( function ( child ) {

				if ( child.relationship === 'LookAtProperty' ) {

					var lookAtTarget = FBXTree.Objects.subNodes.Model[ child.ID ];

					if ( 'Lcl_Translation' in lookAtTarget.properties ) {

						var pos = lookAtTarget.properties.Lcl_Translation.value;

						// DirectionalLight, SpotLight
						if ( model.target !== undefined ) {

							model.target.position.fromArray( pos );
							sceneGraph.add( model.target );

						} else { // Cameras and other Object3Ds

							model.lookAt( new THREE.Vector3().fromArray( pos ) );

						}

					}

				}

			} );

		}

	}

	// parse the model node for transform details and apply them to the model
	function setModelTransforms( FBXTree, model, modelNode ) {

		// http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
		if ( 'RotationOrder' in modelNode.properties ) {

			var enums = [
				'XYZ', // default
				'XZY',
				'YZX',
				'ZXY',
				'YXZ',
				'ZYX',
				'SphericXYZ',
			];

			var value = parseInt( modelNode.properties.RotationOrder.value, 10 );

			if ( value > 0 && value < 6 ) {

				// model.rotation.order = enums[ value ];

				// Note: Euler order other than XYZ is currently not supported, so just display a warning for now
				console.warn( 'THREE.FBXLoader: unsupported Euler Order: %s. Currently only XYZ order is supported. Animations and rotations may be incorrect.', enums[ value ] );

			} else if ( value === 6 ) {

				console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );

			}

		}

		if ( 'Lcl_Translation' in modelNode.properties ) {

			model.position.fromArray( modelNode.properties.Lcl_Translation.value );

		}

		if ( 'Lcl_Rotation' in modelNode.properties ) {

			var rotation = modelNode.properties.Lcl_Rotation.value.map( THREE.Math.degToRad );
			rotation.push( 'ZYX' );
			model.rotation.fromArray( rotation );

		}

		if ( 'Lcl_Scaling' in modelNode.properties ) {

			model.scale.fromArray( modelNode.properties.Lcl_Scaling.value );

		}

		if ( 'PreRotation' in modelNode.properties ) {

			var array = modelNode.properties.PreRotation.value.map( THREE.Math.degToRad );
			array[ 3 ] = 'ZYX';

			var preRotations = new THREE.Euler().fromArray( array );

			preRotations = new THREE.Quaternion().setFromEuler( preRotations );
			var currentRotation = new THREE.Quaternion().setFromEuler( model.rotation );
			preRotations.multiply( currentRotation );
			model.rotation.setFromQuaternion( preRotations, 'ZYX' );

		}

	}

	function bindSkeleton( FBXTree, skeletons, geometryMap, modelMap, connections, sceneGraph ) {

		// Now with the bones created, we can update the skeletons and bind them to the skinned meshes.
		sceneGraph.updateMatrixWorld( true );

		var worldMatrices = new Map();

		// Put skeleton into bind pose.
		if ( 'Pose' in FBXTree.Objects.subNodes ) {

			var BindPoseNode = FBXTree.Objects.subNodes.Pose;

			for ( var nodeID in BindPoseNode ) {

				if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

					var poseNodes = BindPoseNode[ nodeID ].subNodes.PoseNode;

					if ( Array.isArray( poseNodes ) ) {

						poseNodes.forEach( function ( node ) {

							var rawMatWrd = new THREE.Matrix4().fromArray( node.subNodes.Matrix.properties.a );
							worldMatrices.set( parseInt( node.properties.Node ), rawMatWrd );

						} );

					} else {

						var rawMatWrd = new THREE.Matrix4().fromArray( poseNodes.subNodes.Matrix.properties.a );
						worldMatrices.set( parseInt( poseNodes.properties.Node ), rawMatWrd );

					}

				}

			}

		}

		for ( var ID in skeletons ) {

			var skeleton = skeletons[ ID ];

			skeleton.bones.forEach( function ( bone, i ) {

				// if the bone's initial transform is set in a poseNode, copy that
				if ( worldMatrices.has( bone.ID ) ) {

					var mat = worldMatrices.get( bone.ID );
					bone.matrixWorld.copy( mat );

				}
				// otherwise use the transform from the rawBone
				else {

					bone.matrixWorld.copy( skeleton.rawBones[ i ].transformLink );

				}

			} );

			// Now that skeleton is in bind pose, bind to model.
			var parents = connections.get( parseInt( skeleton.ID ) ).parents;

			parents.forEach( function ( parent ) {

				if ( geometryMap.has( parent.ID ) ) {

					var geoID = parent.ID;
					var geoRelationships = connections.get( geoID );

					geoRelationships.parents.forEach( function ( geoConnParent ) {

						if ( modelMap.has( geoConnParent.ID ) ) {

							var model = modelMap.get( geoConnParent.ID );

							model.bind( new THREE.Skeleton( skeleton.bones ), model.matrixWorld );

						}

					} );

				}

			} );

		}

		//Skeleton is now bound, return objects to starting world positions.
		sceneGraph.updateMatrixWorld( true );

	}

	function parseAnimations( FBXTree, connections ) {

		// since the actual transformation data is stored in FBXTree.Objects.subNodes.AnimationCurve,
		// if this is undefined we can safely assume there are no animations
		if ( FBXTree.Objects.subNodes.AnimationCurve === undefined ) return undefined;

		var curveNodesMap = parseAnimationCurveNodes( FBXTree );

		parseAnimationCurves( FBXTree, connections, curveNodesMap );

		var layersMap = parseAnimationLayers( FBXTree, connections, curveNodesMap );
		var rawClips = parseAnimStacks( FBXTree, connections, layersMap );

		return rawClips;

	}

	// parse nodes in FBXTree.Objects.subNodes.AnimationCurveNode
	// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
	// and is referenced by an AnimationLayer
	function parseAnimationCurveNodes( FBXTree ) {

		var rawCurveNodes = FBXTree.Objects.subNodes.AnimationCurveNode;

		var curveNodesMap = new Map();

		for ( var nodeID in rawCurveNodes ) {

			var rawCurveNode = rawCurveNodes[ nodeID ];

			if ( rawCurveNode.attrName.match( /S|R|T/ ) !== null ) {

				var curveNode = {

					id: rawCurveNode.id,
					attr: rawCurveNode.attrName,
					curves: {},

				};

			}

			curveNodesMap.set( curveNode.id, curveNode );

		}

		return curveNodesMap;

	}

	// parse nodes in  FBXTree.Objects.subNodes.AnimationCurve and connect them up to
	// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
	// axis ( e.g. times and values of x rotation)
	function parseAnimationCurves( FBXTree, connections, curveNodesMap ) {

		var rawCurves = FBXTree.Objects.subNodes.AnimationCurve;

		for ( var nodeID in rawCurves ) {

			var animationCurve = {

				id: rawCurves[ nodeID ].id,
				times: rawCurves[ nodeID ].subNodes.KeyTime.properties.a.map( convertFBXTimeToSeconds ),
				values: rawCurves[ nodeID ].subNodes.KeyValueFloat.properties.a,

			};

			var relationships = connections.get( animationCurve.id );

			if ( relationships !== undefined ) {

				var animationCurveID = relationships.parents[ 0 ].ID;
				var animationCurveRelationship = relationships.parents[ 0 ].relationship;
				var axis = '';

				if ( animationCurveRelationship.match( /X/ ) ) {

					axis = 'x';

				} else if ( animationCurveRelationship.match( /Y/ ) ) {

					axis = 'y';

				} else if ( animationCurveRelationship.match( /Z/ ) ) {

					axis = 'z';

				} else {

					continue;

				}

				curveNodesMap.get( animationCurveID ).curves[ axis ] = animationCurve;

			}

		}

	}

	// parse nodes in FBXTree.Objects.subNodes.AnimationLayer. Each layers holds references
	// to various AnimationCurveNodes and is referenced by an AnimationStack node
	// note: theoretically a stack can multiple layers, however in practice there always seems to be one per stack
	function parseAnimationLayers( FBXTree, connections, curveNodesMap ) {

		var rawLayers = FBXTree.Objects.subNodes.AnimationLayer;

		var layersMap = new Map();

		for ( var nodeID in rawLayers ) {

			var layerCurveNodes = [];

			var connection = connections.get( parseInt( nodeID ) );

			if ( connection !== undefined ) {

				// all the animationCurveNodes used in the layer
				var children = connection.children;

				children.forEach( function ( child, i ) {

					if ( curveNodesMap.has( child.ID ) ) {

						var curveNode = curveNodesMap.get( child.ID );

						if ( layerCurveNodes[ i ] === undefined ) {

							var modelID;

							connections.get( child.ID ).parents.forEach( function ( parent ) {

								if ( parent.relationship !== undefined ) modelID = parent.ID;

							} );

							var rawModel = FBXTree.Objects.subNodes.Model[ modelID.toString() ];

							var node = {

								modelName: THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ),
								initialPosition: [ 0, 0, 0 ],
								initialRotation: [ 0, 0, 0 ],
								initialScale: [ 1, 1, 1 ],

							};

							if ( 'Lcl_Translation' in rawModel.properties ) node.initialPosition = rawModel.properties.Lcl_Translation.value;

							if ( 'Lcl_Rotation' in rawModel.properties ) node.initialRotation = rawModel.properties.Lcl_Rotation.value;

							if ( 'Lcl_Scaling' in rawModel.properties ) node.initialScale = rawModel.properties.Lcl_Scaling.value;

							// if the animated model is pre rotated, we'll have to apply the pre rotations to every
							// animation value as well
							if ( 'PreRotation' in rawModel.properties ) node.preRotations = rawModel.properties.PreRotation.value;

							layerCurveNodes[ i ] = node;

						}

						layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

					}

				} );

				layersMap.set( parseInt( nodeID ), layerCurveNodes );

			}

		}

		return layersMap;

	}

	// parse nodes in FBXTree.Objects.subNodes.AnimationStack. These are the top level node in the animation
	// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
	function parseAnimStacks( FBXTree, connections, layersMap ) {

		var rawStacks = FBXTree.Objects.subNodes.AnimationStack;

		// connect the stacks (clips) up to the layers
		var rawClips = {};

		for ( var nodeID in rawStacks ) {

			var children = connections.get( parseInt( nodeID ) ).children;

			if ( children.length > 1 ) {

				// it seems like stacks will always be associated with a single layer. But just in case there are files
				// where there are multiple layers per stack, we'll display a warning
				console.warn( 'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.' );

			}

			var layer = layersMap.get( children[ 0 ].ID );

			rawClips[ nodeID ] = {

				name: rawStacks[ nodeID ].attrName,
				layer: layer,

			};

		}

		return rawClips;

	}

	// take raw animation data from parseAnimations and connect it up to the loaded models
	function addAnimations( FBXTree, connections, sceneGraph ) {

		sceneGraph.animations = [];

		var rawClips = parseAnimations( FBXTree, connections );

		if ( rawClips === undefined ) return;

		for ( var key in rawClips ) {

			var rawClip = rawClips[ key ];

			var clip = addClip( rawClip );

			sceneGraph.animations.push( clip );

		}

	}

	function addClip( rawClip ) {

		var tracks = [];

		rawClip.layer.forEach( function ( rawTracks ) {

			tracks = tracks.concat( generateTracks( rawTracks ) );

		} );

		return new THREE.AnimationClip( rawClip.name, - 1, tracks );

	}

	function generateTracks( rawTracks ) {

		var tracks = [];

		if ( rawTracks.T !== undefined ) {

			var positionTrack = generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, rawTracks.initialPosition, 'position' );
			if ( positionTrack !== undefined ) tracks.push( positionTrack );

		}

		if ( rawTracks.R !== undefined ) {

			var rotationTrack = generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, rawTracks.initialRotation, rawTracks.preRotations );
			if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

		}

		if ( rawTracks.S !== undefined ) {

			var scaleTrack = generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, rawTracks.initialScale, 'scale' );
			if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

		}

		return tracks;

	}

	function generateVectorTrack( modelName, curves, initialValue, type ) {

		var times = getTimesForAllAxes( curves );
		var values = getKeyframeTrackValues( times, curves, initialValue );

		return new THREE.VectorKeyframeTrack( modelName + '.' + type, times, values );

	}

	function generateRotationTrack( modelName, curves, initialValue, preRotations ) {

		if ( curves.x !== undefined ) curves.x.values = curves.x.values.map( THREE.Math.degToRad );
		if ( curves.y !== undefined ) curves.y.values = curves.y.values.map( THREE.Math.degToRad );
		if ( curves.z !== undefined ) curves.z.values = curves.z.values.map( THREE.Math.degToRad );

		var times = getTimesForAllAxes( curves );
		var values = getKeyframeTrackValues( times, curves, initialValue );

		if ( preRotations !== undefined ) {

			preRotations = preRotations.map( THREE.Math.degToRad );
			preRotations.push( 'ZYX' );

			preRotations = new THREE.Euler().fromArray( preRotations );
			preRotations = new THREE.Quaternion().setFromEuler( preRotations );

		}

		var quaternion = new THREE.Quaternion();
		var euler = new THREE.Euler();

		var quaternionValues = [];

		for ( var i = 0; i < values.length; i += 3 ) {

			euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], 'ZYX' );

			quaternion.setFromEuler( euler );

			if ( preRotations !== undefined )quaternion.premultiply( preRotations );

			quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

		}

		return new THREE.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

	}

	function getKeyframeTrackValues( times, curves, initialValue ) {

		var prevValue = initialValue;

		var values = [];

		var xIndex = - 1;
		var yIndex = - 1;
		var zIndex = - 1;

		times.forEach( function ( time ) {

			if ( curves.x ) xIndex = curves.x.times.indexOf( time );
			if ( curves.y ) yIndex = curves.y.times.indexOf( time );
			if ( curves.z ) zIndex = curves.z.times.indexOf( time );

			// if there is an x value defined for this frame, use that
			if ( xIndex !== - 1 ) {

				var xValue = curves.x.values[ xIndex ];
				values.push( xValue );
				prevValue[ 0 ] = xValue;

			} else {

				// otherwise use the x value from the previous frame
				values.push( prevValue[ 0 ] );

			}

			if ( yIndex !== - 1 ) {

				var yValue = curves.y.values[ yIndex ];
				values.push( yValue );
				prevValue[ 1 ] = yValue;

			} else {

				values.push( prevValue[ 1 ] );

			}

			if ( zIndex !== - 1 ) {

				var zValue = curves.z.values[ zIndex ];
				values.push( zValue );
				prevValue[ 2 ] = zValue;

			} else {

				values.push( prevValue[ 2 ] );

			}

		} );

		return values;

	}

	// For all animated objects, times are defined separately for each axis
	// Here we'll combine the times into one sorted array without duplicates
	function getTimesForAllAxes( curves ) {

		var times = [];

		// first join together the times for each axis, if defined
		if ( curves.x !== undefined ) times = times.concat( curves.x.times );
		if ( curves.y !== undefined ) times = times.concat( curves.y.times );
		if ( curves.z !== undefined ) times = times.concat( curves.z.times );

		// then sort them and remove duplicates
		times = times.sort( function ( a, b ) {

			return a - b;

		} ).filter( function ( elem, index, array ) {

			return array.indexOf( elem ) == index;

		} );

		return times;

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

			var self = this;

			var split = text.split( '\n' );

			split.forEach( function ( line, i ) {

				var matchComment = line.match( /^[\s\t]*;/ );
				var matchEmpty = line.match( /^[\s\t]*$/ );

				if ( matchComment || matchEmpty ) return;

				var matchBeginning = line.match( '^\\t{' + self.currentIndent + '}(\\w+):(.*){', '' );
				var matchProperty = line.match( '^\\t{' + ( self.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
				var matchEnd = line.match( '^\\t{' + ( self.currentIndent - 1 ) + '}}' );

				if ( matchBeginning ) {

					self.parseNodeBegin( line, matchBeginning );

				} else if ( matchProperty ) {

					self.parseNodeProperty( line, matchProperty, split[ ++ i ] );

				} else if ( matchEnd ) {

					self.nodeEnd();

				} else if ( line.match( /^[^\s\t}]/ ) ) {

					// large arrays are split over multiple lines terminated with a ',' character
					// if this is encountered the line needs to be joined to the previous line
					self.parseNodePropertyContinued( line );

				}

			} );

			return this.allNodes;

		},

		parseNodeBegin: function ( line, property ) {

			var nodeName = property[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );

			var nodeAttrs = property[ 2 ].split( ',' ).map( function ( attr ) {

				return attr.trim().replace( /^"/, '' ).replace( /"$/, '' );

			} );

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

		parseNodeProperty: function ( line, property, contentLine ) {

			var propName = property[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
			var propValue = property[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

			// for special case: base64 image data follows "Content: ," line
			//	Content: ,
			//	 "iVB..."
			if ( propName === 'Content' && propValue === ',' ) {

				propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

			}

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
			var props = propValue.split( '",' ).map( function ( prop ) {

				return prop.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

			} );

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

					node.propertyList.forEach( function ( property, i ) {

						array[ i - 1 ] = property;

					} );

					if ( properties.connections === undefined ) {

						properties.connections = [];

					}

					properties.connections.push( array );

					continue;

				}

				// special case: child node is Properties\d+
				// move child node's properties to this node.
				if ( node.name === 'Properties70' ) {

					var keys = Object.keys( node.properties );

					keys.forEach( function ( key ) {

						properties[ key ] = node.properties[ key ];

					} );

					continue;

				}

				// parse 'properties70'
				if ( name === 'Properties70' && node.name === 'P' ) {

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

			var s = THREE.LoaderUtils.decodeText( this.getUint8Array( size ) );

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

		var array = value.split( ',' ).map( function ( val ) {

			return parseFloat( val );

		} );

		return array;

	}

	function parseColor( property ) {

		var color = new THREE.Color();

		if ( property.type === 'Color' ) {

			return color.setScalar( property.value );

		}

		return color.fromArray( property.value );

	}

	// Converts ArrayBuffer to String.
	function convertArrayBufferToString( buffer, from, to ) {

		if ( from === undefined ) from = 0;
		if ( to === undefined ) to = buffer.byteLength;

		return THREE.LoaderUtils.decodeText( new Uint8Array( buffer, from, to ) );

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
