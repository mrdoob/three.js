/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 * @author Lewy Blue https://github.com/looeee
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 * 	http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 * 	Binary format specification:
 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */


THREE.FBXLoader = ( function () {

	var fbxTree;
	var connections;
	var sceneGraph;

	function FBXLoader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

	FBXLoader.prototype = {

		constructor: FBXLoader,

		crossOrigin: 'anonymous',

		load: function ( url, onLoad, onProgress, onError ) {

			var self = this;

			var path = ( self.path === undefined ) ? THREE.LoaderUtils.extractUrlBase( url ) : self.path;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( self.path );
			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( buffer ) {

				try {

					onLoad( self.parse( buffer, path ) );

				} catch ( error ) {

					setTimeout( function () {

						if ( onError ) onError( error );

						self.manager.itemError( url );

					}, 0 );

				}

			}, onProgress, onError );

		},

		setPath: function ( value ) {

			this.path = value;
			return this;

		},

		setResourcePath: function ( value ) {

			this.resourcePath = value;
			return this;

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;
			return this;

		},

		parse: function ( FBXBuffer, path ) {

			if ( isFbxFormatBinary( FBXBuffer ) ) {

				fbxTree = new BinaryParser().parse( FBXBuffer );

			} else {

				var FBXText = convertArrayBufferToString( FBXBuffer );

				if ( ! isFbxFormatASCII( FBXText ) ) {

					throw new Error( 'THREE.FBXLoader: Unknown format.' );

				}

				if ( getFbxVersion( FBXText ) < 7000 ) {

					throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

				}

				fbxTree = new TextParser().parse( FBXText );

			}

			// console.log( fbxTree );

			var textureLoader = new THREE.TextureLoader( this.manager ).setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

			return new FBXTreeParser( textureLoader ).parse( fbxTree );

		}

	};

	// Parse the FBXTree object returned by the BinaryParser or TextParser and return a THREE.Group
	function FBXTreeParser( textureLoader ) {

		this.textureLoader = textureLoader;

	}

	FBXTreeParser.prototype = {

		constructor: FBXTreeParser,

		parse: function () {

			connections = this.parseConnections();

			var images = this.parseImages();
			var textures = this.parseTextures( images );
			var materials = this.parseMaterials( textures );
			var deformers = this.parseDeformers();
			var geometryMap = new GeometryParser().parse( deformers );

			this.parseScene( deformers, geometryMap, materials );

			return sceneGraph;

		},

		// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
		// and details the connection type
		parseConnections: function () {

			var connectionMap = new Map();

			if ( 'Connections' in fbxTree ) {

				var rawConnections = fbxTree.Connections.connections;

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

		},

		// Parse FBXTree.Objects.Video for embedded image data
		// These images are connected to textures in FBXTree.Objects.Textures
		// via FBXTree.Connections.
		parseImages: function () {

			var images = {};
			var blobs = {};

			if ( 'Video' in fbxTree.Objects ) {

				var videoNodes = fbxTree.Objects.Video;

				for ( var nodeID in videoNodes ) {

					var videoNode = videoNodes[ nodeID ];

					var id = parseInt( nodeID );

					images[ id ] = videoNode.RelativeFilename || videoNode.Filename;

					// raw image data is in videoNode.Content
					if ( 'Content' in videoNode ) {

						var arrayBufferContent = ( videoNode.Content instanceof ArrayBuffer ) && ( videoNode.Content.byteLength > 0 );
						var base64Content = ( typeof videoNode.Content === 'string' ) && ( videoNode.Content !== '' );

						if ( arrayBufferContent || base64Content ) {

							var image = this.parseImage( videoNodes[ nodeID ] );

							blobs[ videoNode.RelativeFilename || videoNode.Filename ] = image;

						}

					}

				}

			}

			for ( var id in images ) {

				var filename = images[ id ];

				if ( blobs[ filename ] !== undefined ) images[ id ] = blobs[ filename ];
				else images[ id ] = images[ id ].split( '\\' ).pop();

			}

			return images;

		},

		// Parse embedded image data in FBXTree.Video.Content
		parseImage: function ( videoNode ) {

			var content = videoNode.Content;
			var fileName = videoNode.RelativeFilename || videoNode.Filename;
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

				case 'tga':

					if ( typeof THREE.TGALoader !== 'function' ) {

						console.warn( 'FBXLoader: THREE.TGALoader is required to load TGA textures' );
						return;

					} else {

						if ( THREE.Loader.Handlers.get( '.tga' ) === null ) {

							var tgaLoader = new THREE.TGALoader();
							tgaLoader.setPath( this.textureLoader.path );

							THREE.Loader.Handlers.add( /\.tga$/i, tgaLoader );

						}

						type = 'image/tga';
						break;

					}

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

		},

		// Parse nodes in FBXTree.Objects.Texture
		// These contain details such as UV scaling, cropping, rotation etc and are connected
		// to images in FBXTree.Objects.Video
		parseTextures: function ( images ) {

			var textureMap = new Map();

			if ( 'Texture' in fbxTree.Objects ) {

				var textureNodes = fbxTree.Objects.Texture;
				for ( var nodeID in textureNodes ) {

					var texture = this.parseTexture( textureNodes[ nodeID ], images );
					textureMap.set( parseInt( nodeID ), texture );

				}

			}

			return textureMap;

		},

		// Parse individual node in FBXTree.Objects.Texture
		parseTexture: function ( textureNode, images ) {

			var texture = this.loadTexture( textureNode, images );

			texture.ID = textureNode.id;

			texture.name = textureNode.attrName;

			var wrapModeU = textureNode.WrapModeU;
			var wrapModeV = textureNode.WrapModeV;

			var valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
			var valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

			// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
			// 0: repeat(default), 1: clamp

			texture.wrapS = valueU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			texture.wrapT = valueV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

			if ( 'Scaling' in textureNode ) {

				var values = textureNode.Scaling.value;

				texture.repeat.x = values[ 0 ];
				texture.repeat.y = values[ 1 ];

			}

			return texture;

		},

		// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
		loadTexture: function ( textureNode, images ) {

			var fileName;

			var currentPath = this.textureLoader.path;

			var children = connections.get( textureNode.id ).children;

			if ( children !== undefined && children.length > 0 && images[ children[ 0 ].ID ] !== undefined ) {

				fileName = images[ children[ 0 ].ID ];

				if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

					this.textureLoader.setPath( undefined );

				}

			}

			var texture;

			var extension = textureNode.FileName.slice( - 3 ).toLowerCase();

			if ( extension === 'tga' ) {

				var loader = THREE.Loader.Handlers.get( '.tga' );

				if ( loader === null ) {

					console.warn( 'FBXLoader: TGALoader not found, creating empty placeholder texture for', fileName );
					texture = new THREE.Texture();

				} else {

					texture = loader.load( fileName );

				}

			} else if ( extension === 'psd' ) {

				console.warn( 'FBXLoader: PSD textures are not supported, creating empty placeholder texture for', fileName );
				texture = new THREE.Texture();

			} else {

				texture = this.textureLoader.load( fileName );

			}

			this.textureLoader.setPath( currentPath );

			return texture;

		},

		// Parse nodes in FBXTree.Objects.Material
		parseMaterials: function ( textureMap ) {

			var materialMap = new Map();

			if ( 'Material' in fbxTree.Objects ) {

				var materialNodes = fbxTree.Objects.Material;

				for ( var nodeID in materialNodes ) {

					var material = this.parseMaterial( materialNodes[ nodeID ], textureMap );

					if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

				}

			}

			return materialMap;

		},

		// Parse single node in FBXTree.Objects.Material
		// Materials are connected to texture maps in FBXTree.Objects.Textures
		// FBX format currently only supports Lambert and Phong shading models
		parseMaterial: function ( materialNode, textureMap ) {

			var ID = materialNode.id;
			var name = materialNode.attrName;
			var type = materialNode.ShadingModel;

			// Case where FBX wraps shading model in property object.
			if ( typeof type === 'object' ) {

				type = type.value;

			}

			// Ignore unused materials which don't have any connections.
			if ( ! connections.has( ID ) ) return null;

			var parameters = this.parseParameters( materialNode, textureMap, ID );

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
					material = new THREE.MeshPhongMaterial();
					break;

			}

			material.setValues( parameters );
			material.name = name;

			return material;

		},

		// Parse FBX material and return parameters suitable for a three.js material
		// Also parse the texture map and return any textures associated with the material
		parseParameters: function ( materialNode, textureMap, ID ) {

			var parameters = {};

			if ( materialNode.BumpFactor ) {

				parameters.bumpScale = materialNode.BumpFactor.value;

			}
			if ( materialNode.Diffuse ) {

				parameters.color = new THREE.Color().fromArray( materialNode.Diffuse.value );

			} else if ( materialNode.DiffuseColor && materialNode.DiffuseColor.type === 'Color' ) {

				// The blender exporter exports diffuse here instead of in materialNode.Diffuse
				parameters.color = new THREE.Color().fromArray( materialNode.DiffuseColor.value );

			}

			if ( materialNode.DisplacementFactor ) {

				parameters.displacementScale = materialNode.DisplacementFactor.value;

			}

			if ( materialNode.Emissive ) {

				parameters.emissive = new THREE.Color().fromArray( materialNode.Emissive.value );

			} else if ( materialNode.EmissiveColor && materialNode.EmissiveColor.type === 'Color' ) {

				// The blender exporter exports emissive color here instead of in materialNode.Emissive
				parameters.emissive = new THREE.Color().fromArray( materialNode.EmissiveColor.value );

			}

			if ( materialNode.EmissiveFactor ) {

				parameters.emissiveIntensity = parseFloat( materialNode.EmissiveFactor.value );

			}

			if ( materialNode.Opacity ) {

				parameters.opacity = parseFloat( materialNode.Opacity.value );

			}

			if ( parameters.opacity < 1.0 ) {

				parameters.transparent = true;

			}

			if ( materialNode.ReflectionFactor ) {

				parameters.reflectivity = materialNode.ReflectionFactor.value;

			}

			if ( materialNode.Shininess ) {

				parameters.shininess = materialNode.Shininess.value;

			}

			if ( materialNode.Specular ) {

				parameters.specular = new THREE.Color().fromArray( materialNode.Specular.value );

			} else if ( materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color' ) {

				// The blender exporter exports specular color here instead of in materialNode.Specular
				parameters.specular = new THREE.Color().fromArray( materialNode.SpecularColor.value );

			}

			var self = this;
			connections.get( ID ).children.forEach( function ( child ) {

				var type = child.relationship;

				switch ( type ) {

					case 'Bump':
						parameters.bumpMap = self.getTexture( textureMap, child.ID );
						break;

					case 'Maya|TEX_ao_map':
						parameters.aoMap = self.getTexture( textureMap, child.ID );
						break;

					case 'DiffuseColor':
					case 'Maya|TEX_color_map':
						parameters.map = self.getTexture( textureMap, child.ID );
						parameters.map.encoding = THREE.sRGBEncoding;
						break;

					case 'DisplacementColor':
						parameters.displacementMap = self.getTexture( textureMap, child.ID );
						break;

					case 'EmissiveColor':
						parameters.emissiveMap = self.getTexture( textureMap, child.ID );
						parameters.emissiveMap.encoding = THREE.sRGBEncoding;
						break;

					case 'NormalMap':
					case 'Maya|TEX_normal_map':
						parameters.normalMap = self.getTexture( textureMap, child.ID );
						break;

					case 'ReflectionColor':
						parameters.envMap = self.getTexture( textureMap, child.ID );
						parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
						parameters.envMap.encoding = THREE.sRGBEncoding;
						break;

					case 'SpecularColor':
						parameters.specularMap = self.getTexture( textureMap, child.ID );
						parameters.specularMap.encoding = THREE.sRGBEncoding;
						break;

					case 'TransparentColor':
						parameters.alphaMap = self.getTexture( textureMap, child.ID );
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

		},

		// get a texture from the textureMap for use by a material.
		getTexture: function ( textureMap, id ) {

			// if the texture is a layered texture, just use the first layer and issue a warning
			if ( 'LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture ) {

				console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
				id = connections.get( id ).children[ 0 ].ID;

			}

			return textureMap.get( id );

		},

		// Parse nodes in FBXTree.Objects.Deformer
		// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
		// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
		parseDeformers: function () {

			var skeletons = {};
			var morphTargets = {};

			if ( 'Deformer' in fbxTree.Objects ) {

				var DeformerNodes = fbxTree.Objects.Deformer;

				for ( var nodeID in DeformerNodes ) {

					var deformerNode = DeformerNodes[ nodeID ];

					var relationships = connections.get( parseInt( nodeID ) );

					if ( deformerNode.attrType === 'Skin' ) {

						var skeleton = this.parseSkeleton( relationships, DeformerNodes );
						skeleton.ID = nodeID;

						if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
						skeleton.geometryID = relationships.parents[ 0 ].ID;

						skeletons[ nodeID ] = skeleton;

					} else if ( deformerNode.attrType === 'BlendShape' ) {

						var morphTarget = {
							id: nodeID,
						};

						morphTarget.rawTargets = this.parseMorphTargets( relationships, DeformerNodes );
						morphTarget.id = nodeID;

						if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: morph target attached to more than one geometry is not supported.' );

						morphTargets[ nodeID ] = morphTarget;

					}

				}

			}

			return {

				skeletons: skeletons,
				morphTargets: morphTargets,

			};

		},

		// Parse single nodes in FBXTree.Objects.Deformer
		// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
		// Each skin node represents a skeleton and each cluster node represents a bone
		parseSkeleton: function ( relationships, deformerNodes ) {

			var rawBones = [];

			relationships.children.forEach( function ( child ) {

				var boneNode = deformerNodes[ child.ID ];

				if ( boneNode.attrType !== 'Cluster' ) return;

				var rawBone = {

					ID: child.ID,
					indices: [],
					weights: [],
					transformLink: new THREE.Matrix4().fromArray( boneNode.TransformLink.a ),
					// transform: new THREE.Matrix4().fromArray( boneNode.Transform.a ),
					// linkMode: boneNode.Mode,

				};

				if ( 'Indexes' in boneNode ) {

					rawBone.indices = boneNode.Indexes.a;
					rawBone.weights = boneNode.Weights.a;

				}

				rawBones.push( rawBone );

			} );

			return {

				rawBones: rawBones,
				bones: []

			};

		},

		// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
		parseMorphTargets: function ( relationships, deformerNodes ) {

			var rawMorphTargets = [];

			for ( var i = 0; i < relationships.children.length; i ++ ) {

				var child = relationships.children[ i ];

				var morphTargetNode = deformerNodes[ child.ID ];

				var rawMorphTarget = {

					name: morphTargetNode.attrName,
					initialWeight: morphTargetNode.DeformPercent,
					id: morphTargetNode.id,
					fullWeights: morphTargetNode.FullWeights.a

				};

				if ( morphTargetNode.attrType !== 'BlendShapeChannel' ) return;

				rawMorphTarget.geoID = connections.get( parseInt( child.ID ) ).children.filter( function ( child ) {

					return child.relationship === undefined;

				} )[ 0 ].ID;

				rawMorphTargets.push( rawMorphTarget );

			}

			return rawMorphTargets;

		},

		// create the main THREE.Group() to be returned by the loader
		parseScene: function ( deformers, geometryMap, materialMap ) {

			sceneGraph = new THREE.Group();

			var modelMap = this.parseModels( deformers.skeletons, geometryMap, materialMap );

			var modelNodes = fbxTree.Objects.Model;

			var self = this;
			modelMap.forEach( function ( model ) {

				var modelNode = modelNodes[ model.ID ];
				self.setLookAtProperties( model, modelNode );

				var parentConnections = connections.get( model.ID ).parents;

				parentConnections.forEach( function ( connection ) {

					var parent = modelMap.get( connection.ID );
					if ( parent !== undefined ) parent.add( model );

				} );

				if ( model.parent === null ) {

					sceneGraph.add( model );

				}


			} );

			this.bindSkeleton( deformers.skeletons, geometryMap, modelMap );

			this.createAmbientLight();

			this.setupMorphMaterials();

			sceneGraph.traverse( function ( node ) {

				if ( node.userData.transformData ) {

					if ( node.parent ) node.userData.transformData.parentMatrixWorld = node.parent.matrix;

					var transform = generateTransform( node.userData.transformData );

					node.applyMatrix( transform );

				}

			} );

			var animations = new AnimationParser().parse();

			// if all the models where already combined in a single group, just return that
			if ( sceneGraph.children.length === 1 && sceneGraph.children[ 0 ].isGroup ) {

				sceneGraph.children[ 0 ].animations = animations;
				sceneGraph = sceneGraph.children[ 0 ];

			}

			sceneGraph.animations = animations;

		},

		// parse nodes in FBXTree.Objects.Model
		parseModels: function ( skeletons, geometryMap, materialMap ) {

			var modelMap = new Map();
			var modelNodes = fbxTree.Objects.Model;

			for ( var nodeID in modelNodes ) {

				var id = parseInt( nodeID );
				var node = modelNodes[ nodeID ];
				var relationships = connections.get( id );

				var model = this.buildSkeleton( relationships, skeletons, id, node.attrName );

				if ( ! model ) {

					switch ( node.attrType ) {

						case 'Camera':
							model = this.createCamera( relationships );
							break;
						case 'Light':
							model = this.createLight( relationships );
							break;
						case 'Mesh':
							model = this.createMesh( relationships, geometryMap, materialMap );
							break;
						case 'NurbsCurve':
							model = this.createCurve( relationships, geometryMap );
							break;
						case 'LimbNode':
						case 'Root':
							model = new THREE.Bone();
							break;
						case 'Null':
						default:
							model = new THREE.Group();
							break;

					}

					model.name = THREE.PropertyBinding.sanitizeNodeName( node.attrName );
					model.ID = id;

				}

				this.getTransformData( model, node );
				modelMap.set( id, model );

			}

			return modelMap;

		},

		buildSkeleton: function ( relationships, skeletons, id, name ) {

			var bone = null;

			relationships.parents.forEach( function ( parent ) {

				for ( var ID in skeletons ) {

					var skeleton = skeletons[ ID ];

					skeleton.rawBones.forEach( function ( rawBone, i ) {

						if ( rawBone.ID === parent.ID ) {

							var subBone = bone;
							bone = new THREE.Bone();

							bone.matrixWorld.copy( rawBone.transformLink );

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

		},

		// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
		createCamera: function ( relationships ) {

			var model;
			var cameraAttribute;

			relationships.children.forEach( function ( child ) {

				var attr = fbxTree.Objects.NodeAttribute[ child.ID ];

				if ( attr !== undefined ) {

					cameraAttribute = attr;

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

				var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

				switch ( type ) {

					case 0: // Perspective
						model = new THREE.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
						if ( focalLength !== null ) model.setFocalLength( focalLength );
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

		},

		// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
		createLight: function ( relationships ) {

			var model;
			var lightAttribute;

			relationships.children.forEach( function ( child ) {

				var attr = fbxTree.Objects.NodeAttribute[ child.ID ];

				if ( attr !== undefined ) {

					lightAttribute = attr;

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

					color = new THREE.Color().fromArray( lightAttribute.Color.value );

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

						distance = lightAttribute.FarAttenuationEnd.value;

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

		},

		createMesh: function ( relationships, geometryMap, materialMap ) {

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
				model.normalizeSkinWeights();

			} else {

				model = new THREE.Mesh( geometry, material );

			}

			return model;

		},

		createCurve: function ( relationships, geometryMap ) {

			var geometry = relationships.children.reduce( function ( geo, child ) {

				if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

				return geo;

			}, null );

			// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
			var material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 1 } );
			return new THREE.Line( geometry, material );

		},

		// parse the model node for transform data
		getTransformData: function ( model, modelNode ) {

			var transformData = {};

			if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

			if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
			else transformData.eulerOrder = 'ZYX';

			if ( 'Lcl_Translation' in modelNode ) transformData.translation = modelNode.Lcl_Translation.value;

			if ( 'PreRotation' in modelNode ) transformData.preRotation = modelNode.PreRotation.value;
			if ( 'Lcl_Rotation' in modelNode ) transformData.rotation = modelNode.Lcl_Rotation.value;
			if ( 'PostRotation' in modelNode ) transformData.postRotation = modelNode.PostRotation.value;

			if ( 'Lcl_Scaling' in modelNode ) transformData.scale = modelNode.Lcl_Scaling.value;

			if ( 'ScalingOffset' in modelNode ) transformData.scalingOffset = modelNode.ScalingOffset.value;
			if ( 'ScalingPivot' in modelNode ) transformData.scalingPivot = modelNode.ScalingPivot.value;

			if ( 'RotationOffset' in modelNode ) transformData.rotationOffset = modelNode.RotationOffset.value;
			if ( 'RotationPivot' in modelNode ) transformData.rotationPivot = modelNode.RotationPivot.value;

			model.userData.transformData = transformData;

		},

		setLookAtProperties: function ( model, modelNode ) {

			if ( 'LookAtProperty' in modelNode ) {

				var children = connections.get( model.ID ).children;

				children.forEach( function ( child ) {

					if ( child.relationship === 'LookAtProperty' ) {

						var lookAtTarget = fbxTree.Objects.Model[ child.ID ];

						if ( 'Lcl_Translation' in lookAtTarget ) {

							var pos = lookAtTarget.Lcl_Translation.value;

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

		},

		bindSkeleton: function ( skeletons, geometryMap, modelMap ) {

			var bindMatrices = this.parsePoseNodes();

			for ( var ID in skeletons ) {

				var skeleton = skeletons[ ID ];

				var parents = connections.get( parseInt( skeleton.ID ) ).parents;

				parents.forEach( function ( parent ) {

					if ( geometryMap.has( parent.ID ) ) {

						var geoID = parent.ID;
						var geoRelationships = connections.get( geoID );

						geoRelationships.parents.forEach( function ( geoConnParent ) {

							if ( modelMap.has( geoConnParent.ID ) ) {

								var model = modelMap.get( geoConnParent.ID );

								model.bind( new THREE.Skeleton( skeleton.bones ), bindMatrices[ geoConnParent.ID ] );

							}

						} );

					}

				} );

			}

		},

		parsePoseNodes: function () {

			var bindMatrices = {};

			if ( 'Pose' in fbxTree.Objects ) {

				var BindPoseNode = fbxTree.Objects.Pose;

				for ( var nodeID in BindPoseNode ) {

					if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

						var poseNodes = BindPoseNode[ nodeID ].PoseNode;

						if ( Array.isArray( poseNodes ) ) {

							poseNodes.forEach( function ( poseNode ) {

								bindMatrices[ poseNode.Node ] = new THREE.Matrix4().fromArray( poseNode.Matrix.a );

							} );

						} else {

							bindMatrices[ poseNodes.Node ] = new THREE.Matrix4().fromArray( poseNodes.Matrix.a );

						}

					}

				}

			}

			return bindMatrices;

		},

		// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
		createAmbientLight: function () {

			if ( 'GlobalSettings' in fbxTree && 'AmbientColor' in fbxTree.GlobalSettings ) {

				var ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
				var r = ambientColor[ 0 ];
				var g = ambientColor[ 1 ];
				var b = ambientColor[ 2 ];

				if ( r !== 0 || g !== 0 || b !== 0 ) {

					var color = new THREE.Color( r, g, b );
					sceneGraph.add( new THREE.AmbientLight( color, 1 ) );

				}

			}

		},

		setupMorphMaterials: function () {

			var self = this;
			sceneGraph.traverse( function ( child ) {

				if ( child.isMesh ) {

					if ( child.geometry.morphAttributes.position && child.geometry.morphAttributes.position.length ) {

						if ( Array.isArray( child.material ) ) {

							child.material.forEach( function ( material, i ) {

								self.setupMorphMaterial( child, material, i );

							} );

						} else {

							self.setupMorphMaterial( child, child.material );

						}

					}

				}

			} );

		},

		setupMorphMaterial: function ( child, material, index ) {

			var uuid = child.uuid;
			var matUuid = material.uuid;

			// if a geometry has morph targets, it cannot share the material with other geometries
			var sharedMat = false;

			sceneGraph.traverse( function ( node ) {

				if ( node.isMesh ) {

					if ( Array.isArray( node.material ) ) {

						node.material.forEach( function ( mat ) {

							if ( mat.uuid === matUuid && node.uuid !== uuid ) sharedMat = true;

						} );

					} else if ( node.material.uuid === matUuid && node.uuid !== uuid ) sharedMat = true;

				}

			} );

			if ( sharedMat === true ) {

				var clonedMat = material.clone();
				clonedMat.morphTargets = true;

				if ( index === undefined ) child.material = clonedMat;
				else child.material[ index ] = clonedMat;

			} else material.morphTargets = true;

		}

	};

	// parse Geometry data from FBXTree and return map of BufferGeometries
	function GeometryParser() {}

	GeometryParser.prototype = {

		constructor: GeometryParser,

		// Parse nodes in FBXTree.Objects.Geometry
		parse: function ( deformers ) {

			var geometryMap = new Map();

			if ( 'Geometry' in fbxTree.Objects ) {

				var geoNodes = fbxTree.Objects.Geometry;

				for ( var nodeID in geoNodes ) {

					var relationships = connections.get( parseInt( nodeID ) );
					var geo = this.parseGeometry( relationships, geoNodes[ nodeID ], deformers );

					geometryMap.set( parseInt( nodeID ), geo );

				}

			}

			return geometryMap;

		},

		// Parse single node in FBXTree.Objects.Geometry
		parseGeometry: function ( relationships, geoNode, deformers ) {

			switch ( geoNode.attrType ) {

				case 'Mesh':
					return this.parseMeshGeometry( relationships, geoNode, deformers );
					break;

				case 'NurbsCurve':
					return this.parseNurbsGeometry( geoNode );
					break;

			}

		},

		// Parse single node mesh geometry in FBXTree.Objects.Geometry
		parseMeshGeometry: function ( relationships, geoNode, deformers ) {

			var skeletons = deformers.skeletons;
			var morphTargets = deformers.morphTargets;

			var modelNodes = relationships.parents.map( function ( parent ) {

				return fbxTree.Objects.Model[ parent.ID ];

			} );

			// don't create geometry if it is not associated with any models
			if ( modelNodes.length === 0 ) return;

			var skeleton = relationships.children.reduce( function ( skeleton, child ) {

				if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

				return skeleton;

			}, null );

			var morphTarget = relationships.children.reduce( function ( morphTarget, child ) {

				if ( morphTargets[ child.ID ] !== undefined ) morphTarget = morphTargets[ child.ID ];

				return morphTarget;

			}, null );

			// Assume one model and get the preRotation from that
			// if there is more than one model associated with the geometry this may cause problems
			var modelNode = modelNodes[ 0 ];

			var transformData = {};

			if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
			if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

			if ( 'GeometricTranslation' in modelNode ) transformData.translation = modelNode.GeometricTranslation.value;
			if ( 'GeometricRotation' in modelNode ) transformData.rotation = modelNode.GeometricRotation.value;
			if ( 'GeometricScaling' in modelNode ) transformData.scale = modelNode.GeometricScaling.value;

			var transform = generateTransform( transformData );

			return this.genGeometry( geoNode, skeleton, morphTarget, transform );

		},

		// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
		genGeometry: function ( geoNode, skeleton, morphTarget, preTransform ) {

			var geo = new THREE.BufferGeometry();
			if ( geoNode.attrName ) geo.name = geoNode.attrName;

			var geoInfo = this.parseGeoNode( geoNode, skeleton );
			var buffers = this.genBuffers( geoInfo );

			var positionAttribute = new THREE.Float32BufferAttribute( buffers.vertex, 3 );

			preTransform.applyToBufferAttribute( positionAttribute );

			geo.addAttribute( 'position', positionAttribute );

			if ( buffers.colors.length > 0 ) {

				geo.addAttribute( 'color', new THREE.Float32BufferAttribute( buffers.colors, 3 ) );

			}

			if ( skeleton ) {

				geo.addAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( buffers.weightsIndices, 4 ) );

				geo.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( buffers.vertexWeights, 4 ) );

				// used later to bind the skeleton to the model
				geo.FBX_Deformer = skeleton;

			}

			if ( buffers.normal.length > 0 ) {

				var normalAttribute = new THREE.Float32BufferAttribute( buffers.normal, 3 );

				var normalMatrix = new THREE.Matrix3().getNormalMatrix( preTransform );
				normalMatrix.applyToBufferAttribute( normalAttribute );

				geo.addAttribute( 'normal', normalAttribute );

			}

			buffers.uvs.forEach( function ( uvBuffer, i ) {

				// subsequent uv buffers are called 'uv1', 'uv2', ...
				var name = 'uv' + ( i + 1 ).toString();

				// the first uv buffer is just called 'uv'
				if ( i === 0 ) {

					name = 'uv';

				}

				geo.addAttribute( name, new THREE.Float32BufferAttribute( buffers.uvs[ i ], 2 ) );

			} );

			if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

				// Convert the material indices of each vertex into rendering groups on the geometry.
				var prevMaterialIndex = buffers.materialIndex[ 0 ];
				var startIndex = 0;

				buffers.materialIndex.forEach( function ( currentIndex, i ) {

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

					if ( lastIndex !== buffers.materialIndex.length ) {

						geo.addGroup( lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex );

					}

				}

				// case where there are multiple materials but the whole geometry is only
				// using one of them
				if ( geo.groups.length === 0 ) {

					geo.addGroup( 0, buffers.materialIndex.length, buffers.materialIndex[ 0 ] );

				}

			}

			this.addMorphTargets( geo, geoNode, morphTarget, preTransform );

			return geo;

		},

		parseGeoNode: function ( geoNode, skeleton ) {

			var geoInfo = {};

			geoInfo.vertexPositions = ( geoNode.Vertices !== undefined ) ? geoNode.Vertices.a : [];
			geoInfo.vertexIndices = ( geoNode.PolygonVertexIndex !== undefined ) ? geoNode.PolygonVertexIndex.a : [];

			if ( geoNode.LayerElementColor ) {

				geoInfo.color = this.parseVertexColors( geoNode.LayerElementColor[ 0 ] );

			}

			if ( geoNode.LayerElementMaterial ) {

				geoInfo.material = this.parseMaterialIndices( geoNode.LayerElementMaterial[ 0 ] );

			}

			if ( geoNode.LayerElementNormal ) {

				geoInfo.normal = this.parseNormals( geoNode.LayerElementNormal[ 0 ] );

			}

			if ( geoNode.LayerElementUV ) {

				geoInfo.uv = [];

				var i = 0;
				while ( geoNode.LayerElementUV[ i ] ) {

					geoInfo.uv.push( this.parseUVs( geoNode.LayerElementUV[ i ] ) );
					i ++;

				}

			}

			geoInfo.weightTable = {};

			if ( skeleton !== null ) {

				geoInfo.skeleton = skeleton;

				skeleton.rawBones.forEach( function ( rawBone, i ) {

					// loop over the bone's vertex indices and weights
					rawBone.indices.forEach( function ( index, j ) {

						if ( geoInfo.weightTable[ index ] === undefined ) geoInfo.weightTable[ index ] = [];

						geoInfo.weightTable[ index ].push( {

							id: i,
							weight: rawBone.weights[ j ],

						} );

					} );

				} );

			}

			return geoInfo;

		},

		genBuffers: function ( geoInfo ) {

			var buffers = {
				vertex: [],
				normal: [],
				colors: [],
				uvs: [],
				materialIndex: [],
				vertexWeights: [],
				weightsIndices: [],
			};

			var polygonIndex = 0;
			var faceLength = 0;
			var displayedWeightsWarning = false;

			// these will hold data for a single face
			var facePositionIndexes = [];
			var faceNormals = [];
			var faceColors = [];
			var faceUVs = [];
			var faceWeights = [];
			var faceWeightIndices = [];

			var self = this;
			geoInfo.vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

				var endOfFace = false;

				// Face index and vertex index arrays are combined in a single array
				// A cube with quad faces looks like this:
				// PolygonVertexIndex: *24 {
				//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
				//  }
				// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
				// to find index of last vertex bit shift the index: ^ - 1
				if ( vertexIndex < 0 ) {

					vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
					endOfFace = true;

				}

				var weightIndices = [];
				var weights = [];

				facePositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

				if ( geoInfo.color ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color );

					faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

				}

				if ( geoInfo.skeleton ) {

					if ( geoInfo.weightTable[ vertexIndex ] !== undefined ) {

						geoInfo.weightTable[ vertexIndex ].forEach( function ( wt ) {

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

				if ( geoInfo.normal ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal );

					faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

				}

				if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

					var materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material )[ 0 ];

				}

				if ( geoInfo.uv ) {

					geoInfo.uv.forEach( function ( uv, i ) {

						var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

						if ( faceUVs[ i ] === undefined ) {

							faceUVs[ i ] = [];

						}

						faceUVs[ i ].push( data[ 0 ] );
						faceUVs[ i ].push( data[ 1 ] );

					} );

				}

				faceLength ++;

				if ( endOfFace ) {

					self.genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength );

					polygonIndex ++;
					faceLength = 0;

					// reset arrays for the next face
					facePositionIndexes = [];
					faceNormals = [];
					faceColors = [];
					faceUVs = [];
					faceWeights = [];
					faceWeightIndices = [];

				}

			} );

			return buffers;

		},

		// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
		genFace: function ( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength ) {

			for ( var i = 2; i < faceLength; i ++ ) {

				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 0 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 1 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 2 ] ] );

				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 1 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 2 ] ] );

				if ( geoInfo.skeleton ) {

					buffers.vertexWeights.push( faceWeights[ 0 ] );
					buffers.vertexWeights.push( faceWeights[ 1 ] );
					buffers.vertexWeights.push( faceWeights[ 2 ] );
					buffers.vertexWeights.push( faceWeights[ 3 ] );

					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 ] );
					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 1 ] );
					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 2 ] );
					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 3 ] );

					buffers.vertexWeights.push( faceWeights[ i * 4 ] );
					buffers.vertexWeights.push( faceWeights[ i * 4 + 1 ] );
					buffers.vertexWeights.push( faceWeights[ i * 4 + 2 ] );
					buffers.vertexWeights.push( faceWeights[ i * 4 + 3 ] );

					buffers.weightsIndices.push( faceWeightIndices[ 0 ] );
					buffers.weightsIndices.push( faceWeightIndices[ 1 ] );
					buffers.weightsIndices.push( faceWeightIndices[ 2 ] );
					buffers.weightsIndices.push( faceWeightIndices[ 3 ] );

					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 ] );
					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 1 ] );
					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 2 ] );
					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 3 ] );

					buffers.weightsIndices.push( faceWeightIndices[ i * 4 ] );
					buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 1 ] );
					buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 2 ] );
					buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 3 ] );

				}

				if ( geoInfo.color ) {

					buffers.colors.push( faceColors[ 0 ] );
					buffers.colors.push( faceColors[ 1 ] );
					buffers.colors.push( faceColors[ 2 ] );

					buffers.colors.push( faceColors[ ( i - 1 ) * 3 ] );
					buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 1 ] );
					buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 2 ] );

					buffers.colors.push( faceColors[ i * 3 ] );
					buffers.colors.push( faceColors[ i * 3 + 1 ] );
					buffers.colors.push( faceColors[ i * 3 + 2 ] );

				}

				if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

					buffers.materialIndex.push( materialIndex );
					buffers.materialIndex.push( materialIndex );
					buffers.materialIndex.push( materialIndex );

				}

				if ( geoInfo.normal ) {

					buffers.normal.push( faceNormals[ 0 ] );
					buffers.normal.push( faceNormals[ 1 ] );
					buffers.normal.push( faceNormals[ 2 ] );

					buffers.normal.push( faceNormals[ ( i - 1 ) * 3 ] );
					buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
					buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

					buffers.normal.push( faceNormals[ i * 3 ] );
					buffers.normal.push( faceNormals[ i * 3 + 1 ] );
					buffers.normal.push( faceNormals[ i * 3 + 2 ] );

				}

				if ( geoInfo.uv ) {

					geoInfo.uv.forEach( function ( uv, j ) {

						if ( buffers.uvs[ j ] === undefined ) buffers.uvs[ j ] = [];

						buffers.uvs[ j ].push( faceUVs[ j ][ 0 ] );
						buffers.uvs[ j ].push( faceUVs[ j ][ 1 ] );

						buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
						buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

						buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 ] );
						buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

					} );

				}

			}

		},

		addMorphTargets: function ( parentGeo, parentGeoNode, morphTarget, preTransform ) {

			if ( morphTarget === null ) return;

			parentGeo.morphAttributes.position = [];
			// parentGeo.morphAttributes.normal = []; // not implemented

			var self = this;
			morphTarget.rawTargets.forEach( function ( rawTarget ) {

				var morphGeoNode = fbxTree.Objects.Geometry[ rawTarget.geoID ];

				if ( morphGeoNode !== undefined ) {

					self.genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name );

				}

			} );

		},

		// a morph geometry node is similar to a standard  node, and the node is also contained
		// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
		// and a special attribute Index defining which vertices of the original geometry are affected
		// Normal and position attributes only have data for the vertices that are affected by the morph
		genMorphGeometry: function ( parentGeo, parentGeoNode, morphGeoNode, preTransform, name ) {

			var morphGeo = new THREE.BufferGeometry();
			if ( morphGeoNode.attrName ) morphGeo.name = morphGeoNode.attrName;

			var vertexIndices = ( parentGeoNode.PolygonVertexIndex !== undefined ) ? parentGeoNode.PolygonVertexIndex.a : [];

			// make a copy of the parent's vertex positions
			var vertexPositions = ( parentGeoNode.Vertices !== undefined ) ? parentGeoNode.Vertices.a.slice() : [];

			var morphPositions = ( morphGeoNode.Vertices !== undefined ) ? morphGeoNode.Vertices.a : [];
			var indices = ( morphGeoNode.Indexes !== undefined ) ? morphGeoNode.Indexes.a : [];

			for ( var i = 0; i < indices.length; i ++ ) {

				var morphIndex = indices[ i ] * 3;

				// FBX format uses blend shapes rather than morph targets. This can be converted
				// by additively combining the blend shape positions with the original geometry's positions
				vertexPositions[ morphIndex ] += morphPositions[ i * 3 ];
				vertexPositions[ morphIndex + 1 ] += morphPositions[ i * 3 + 1 ];
				vertexPositions[ morphIndex + 2 ] += morphPositions[ i * 3 + 2 ];

			}

			// TODO: add morph normal support
			var morphGeoInfo = {
				vertexIndices: vertexIndices,
				vertexPositions: vertexPositions,
			};

			var morphBuffers = this.genBuffers( morphGeoInfo );

			var positionAttribute = new THREE.Float32BufferAttribute( morphBuffers.vertex, 3 );
			positionAttribute.name = name || morphGeoNode.attrName;

			preTransform.applyToBufferAttribute( positionAttribute );

			parentGeo.morphAttributes.position.push( positionAttribute );

		},

		// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
		parseNormals: function ( NormalNode ) {

			var mappingType = NormalNode.MappingInformationType;
			var referenceType = NormalNode.ReferenceInformationType;
			var buffer = NormalNode.Normals.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				if ( 'NormalIndex' in NormalNode ) {

					indexBuffer = NormalNode.NormalIndex.a;

				} else if ( 'NormalsIndex' in NormalNode ) {

					indexBuffer = NormalNode.NormalsIndex.a;

				}

			}

			return {
				dataSize: 3,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
		parseUVs: function ( UVNode ) {

			var mappingType = UVNode.MappingInformationType;
			var referenceType = UVNode.ReferenceInformationType;
			var buffer = UVNode.UV.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = UVNode.UVIndex.a;

			}

			return {
				dataSize: 2,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
		parseVertexColors: function ( ColorNode ) {

			var mappingType = ColorNode.MappingInformationType;
			var referenceType = ColorNode.ReferenceInformationType;
			var buffer = ColorNode.Colors.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = ColorNode.ColorIndex.a;

			}

			return {
				dataSize: 4,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
		parseMaterialIndices: function ( MaterialNode ) {

			var mappingType = MaterialNode.MappingInformationType;
			var referenceType = MaterialNode.ReferenceInformationType;

			if ( mappingType === 'NoMappingInformation' ) {

				return {
					dataSize: 1,
					buffer: [ 0 ],
					indices: [ 0 ],
					mappingType: 'AllSame',
					referenceType: referenceType
				};

			}

			var materialIndexBuffer = MaterialNode.Materials.a;

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

		},

		// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
		parseNurbsGeometry: function ( geoNode ) {

			if ( THREE.NURBSCurve === undefined ) {

				console.error( 'THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
				return new THREE.BufferGeometry();

			}

			var order = parseInt( geoNode.Order );

			if ( isNaN( order ) ) {

				console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id );
				return new THREE.BufferGeometry();

			}

			var degree = order - 1;

			var knots = geoNode.KnotVector.a;
			var controlPoints = [];
			var pointsValues = geoNode.Points.a;

			for ( var i = 0, l = pointsValues.length; i < l; i += 4 ) {

				controlPoints.push( new THREE.Vector4().fromArray( pointsValues, i ) );

			}

			var startKnot, endKnot;

			if ( geoNode.Form === 'Closed' ) {

				controlPoints.push( controlPoints[ 0 ] );

			} else if ( geoNode.Form === 'Periodic' ) {

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

		},

	};

	// parse animation data from FBXTree
	function AnimationParser() {}

	AnimationParser.prototype = {

		constructor: AnimationParser,

		// take raw animation clips and turn them into three.js animation clips
		parse: function () {

			var animationClips = [];

			var rawClips = this.parseClips();

			if ( rawClips !== undefined ) {

				for ( var key in rawClips ) {

					var rawClip = rawClips[ key ];

					var clip = this.addClip( rawClip );

					animationClips.push( clip );

				}

			}

			return animationClips;

		},

		parseClips: function () {

			// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
			// if this is undefined we can safely assume there are no animations
			if ( fbxTree.Objects.AnimationCurve === undefined ) return undefined;

			var curveNodesMap = this.parseAnimationCurveNodes();

			this.parseAnimationCurves( curveNodesMap );

			var layersMap = this.parseAnimationLayers( curveNodesMap );
			var rawClips = this.parseAnimStacks( layersMap );

			return rawClips;

		},

		// parse nodes in FBXTree.Objects.AnimationCurveNode
		// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
		// and is referenced by an AnimationLayer
		parseAnimationCurveNodes: function () {

			var rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

			var curveNodesMap = new Map();

			for ( var nodeID in rawCurveNodes ) {

				var rawCurveNode = rawCurveNodes[ nodeID ];

				if ( rawCurveNode.attrName.match( /S|R|T|DeformPercent/ ) !== null ) {

					var curveNode = {

						id: rawCurveNode.id,
						attr: rawCurveNode.attrName,
						curves: {},

					};

					curveNodesMap.set( curveNode.id, curveNode );

				}

			}

			return curveNodesMap;

		},

		// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
		// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
		// axis ( e.g. times and values of x rotation)
		parseAnimationCurves: function ( curveNodesMap ) {

			var rawCurves = fbxTree.Objects.AnimationCurve;

			// TODO: Many values are identical up to roundoff error, but won't be optimised
			// e.g. position times: [0, 0.4, 0. 8]
			// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
			// clearly, this should be optimised to
			// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
			// this shows up in nearly every FBX file, and generally time array is length > 100

			for ( var nodeID in rawCurves ) {

				var animationCurve = {

					id: rawCurves[ nodeID ].id,
					times: rawCurves[ nodeID ].KeyTime.a.map( convertFBXTimeToSeconds ),
					values: rawCurves[ nodeID ].KeyValueFloat.a,

				};

				var relationships = connections.get( animationCurve.id );

				if ( relationships !== undefined ) {

					var animationCurveID = relationships.parents[ 0 ].ID;
					var animationCurveRelationship = relationships.parents[ 0 ].relationship;

					if ( animationCurveRelationship.match( /X/ ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'x' ] = animationCurve;

					} else if ( animationCurveRelationship.match( /Y/ ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'y' ] = animationCurve;

					} else if ( animationCurveRelationship.match( /Z/ ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'z' ] = animationCurve;

					} else if ( animationCurveRelationship.match( /d|DeformPercent/ ) && curveNodesMap.has( animationCurveID ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'morph' ] = animationCurve;

					}

				}

			}

		},

		// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
		// to various AnimationCurveNodes and is referenced by an AnimationStack node
		// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
		parseAnimationLayers: function ( curveNodesMap ) {

			var rawLayers = fbxTree.Objects.AnimationLayer;

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

							// check that the curves are defined for at least one axis, otherwise ignore the curveNode
							if ( curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined ) {

								if ( layerCurveNodes[ i ] === undefined ) {

									var modelID = connections.get( child.ID ).parents.filter( function ( parent ) {

										return parent.relationship !== undefined;

									} )[ 0 ].ID;

									if ( modelID !== undefined ) {

										var rawModel = fbxTree.Objects.Model[ modelID.toString() ];

										var node = {

											modelName: THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ),
											ID: rawModel.id,
											initialPosition: [ 0, 0, 0 ],
											initialRotation: [ 0, 0, 0 ],
											initialScale: [ 1, 1, 1 ],

										};

										sceneGraph.traverse( function ( child ) {

											if ( child.ID === rawModel.id ) {

												node.transform = child.matrix;

												if ( child.userData.transformData ) node.eulerOrder = child.userData.transformData.eulerOrder;

											}

										} );

										if ( ! node.transform ) node.transform = new THREE.Matrix4();

										// if the animated model is pre rotated, we'll have to apply the pre rotations to every
										// animation value as well
										if ( 'PreRotation' in rawModel ) node.preRotation = rawModel.PreRotation.value;
										if ( 'PostRotation' in rawModel ) node.postRotation = rawModel.PostRotation.value;

										layerCurveNodes[ i ] = node;

									}

								}

								if ( layerCurveNodes[ i ] ) layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

							} else if ( curveNode.curves.morph !== undefined ) {

								if ( layerCurveNodes[ i ] === undefined ) {

									var deformerID = connections.get( child.ID ).parents.filter( function ( parent ) {

										return parent.relationship !== undefined;

									} )[ 0 ].ID;

									var morpherID = connections.get( deformerID ).parents[ 0 ].ID;
									var geoID = connections.get( morpherID ).parents[ 0 ].ID;

									// assuming geometry is not used in more than one model
									var modelID = connections.get( geoID ).parents[ 0 ].ID;

									var rawModel = fbxTree.Objects.Model[ modelID ];

									var node = {

										modelName: THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ),
										morphName: fbxTree.Objects.Deformer[ deformerID ].attrName,

									};

									layerCurveNodes[ i ] = node;

								}

								layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

							}

						}

					} );

					layersMap.set( parseInt( nodeID ), layerCurveNodes );

				}

			}

			return layersMap;

		},

		// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
		// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
		parseAnimStacks: function ( layersMap ) {

			var rawStacks = fbxTree.Objects.AnimationStack;

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

		},

		addClip: function ( rawClip ) {

			var tracks = [];

			var self = this;
			rawClip.layer.forEach( function ( rawTracks ) {

				tracks = tracks.concat( self.generateTracks( rawTracks ) );

			} );

			return new THREE.AnimationClip( rawClip.name, - 1, tracks );

		},

		generateTracks: function ( rawTracks ) {

			var tracks = [];

			var initialPosition = new THREE.Vector3();
			var initialRotation = new THREE.Quaternion();
			var initialScale = new THREE.Vector3();

			if ( rawTracks.transform ) rawTracks.transform.decompose( initialPosition, initialRotation, initialScale );

			initialPosition = initialPosition.toArray();
			initialRotation = new THREE.Euler().setFromQuaternion( initialRotation, rawTracks.eulerOrder ).toArray();
			initialScale = initialScale.toArray();

			if ( rawTracks.T !== undefined && Object.keys( rawTracks.T.curves ).length > 0 ) {

				var positionTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position' );
				if ( positionTrack !== undefined ) tracks.push( positionTrack );

			}

			if ( rawTracks.R !== undefined && Object.keys( rawTracks.R.curves ).length > 0 ) {

				var rotationTrack = this.generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotation, rawTracks.postRotation, rawTracks.eulerOrder );
				if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

			}

			if ( rawTracks.S !== undefined && Object.keys( rawTracks.S.curves ).length > 0 ) {

				var scaleTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale' );
				if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

			}

			if ( rawTracks.DeformPercent !== undefined ) {

				var morphTrack = this.generateMorphTrack( rawTracks );
				if ( morphTrack !== undefined ) tracks.push( morphTrack );

			}

			return tracks;

		},

		generateVectorTrack: function ( modelName, curves, initialValue, type ) {

			var times = this.getTimesForAllAxes( curves );
			var values = this.getKeyframeTrackValues( times, curves, initialValue );

			return new THREE.VectorKeyframeTrack( modelName + '.' + type, times, values );

		},

		generateRotationTrack: function ( modelName, curves, initialValue, preRotation, postRotation, eulerOrder ) {

			if ( curves.x !== undefined ) {

				this.interpolateRotations( curves.x );
				curves.x.values = curves.x.values.map( THREE.Math.degToRad );

			}
			if ( curves.y !== undefined ) {

				this.interpolateRotations( curves.y );
				curves.y.values = curves.y.values.map( THREE.Math.degToRad );

			}
			if ( curves.z !== undefined ) {

				this.interpolateRotations( curves.z );
				curves.z.values = curves.z.values.map( THREE.Math.degToRad );

			}

			var times = this.getTimesForAllAxes( curves );
			var values = this.getKeyframeTrackValues( times, curves, initialValue );

			if ( preRotation !== undefined ) {

				preRotation = preRotation.map( THREE.Math.degToRad );
				preRotation.push( eulerOrder );

				preRotation = new THREE.Euler().fromArray( preRotation );
				preRotation = new THREE.Quaternion().setFromEuler( preRotation );

			}

			if ( postRotation !== undefined ) {

				postRotation = postRotation.map( THREE.Math.degToRad );
				postRotation.push( eulerOrder );

				postRotation = new THREE.Euler().fromArray( postRotation );
				postRotation = new THREE.Quaternion().setFromEuler( postRotation ).inverse();

			}

			var quaternion = new THREE.Quaternion();
			var euler = new THREE.Euler();

			var quaternionValues = [];

			for ( var i = 0; i < values.length; i += 3 ) {

				euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], eulerOrder );

				quaternion.setFromEuler( euler );

				if ( preRotation !== undefined ) quaternion.premultiply( preRotation );
				if ( postRotation !== undefined ) quaternion.multiply( postRotation );

				quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

			}

			return new THREE.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

		},

		generateMorphTrack: function ( rawTracks ) {

			var curves = rawTracks.DeformPercent.curves.morph;
			var values = curves.values.map( function ( val ) {

				return val / 100;

			} );

			var morphNum = sceneGraph.getObjectByName( rawTracks.modelName ).morphTargetDictionary[ rawTracks.morphName ];

			return new THREE.NumberKeyframeTrack( rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values );

		},

		// For all animated objects, times are defined separately for each axis
		// Here we'll combine the times into one sorted array without duplicates
		getTimesForAllAxes: function ( curves ) {

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

		},

		getKeyframeTrackValues: function ( times, curves, initialValue ) {

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

		},

		// Rotations are defined as Euler angles which can have values  of any size
		// These will be converted to quaternions which don't support values greater than
		// PI, so we'll interpolate large rotations
		interpolateRotations: function ( curve ) {

			for ( var i = 1; i < curve.values.length; i ++ ) {

				var initialValue = curve.values[ i - 1 ];
				var valuesSpan = curve.values[ i ] - initialValue;

				var absoluteSpan = Math.abs( valuesSpan );

				if ( absoluteSpan >= 180 ) {

					var numSubIntervals = absoluteSpan / 180;

					var step = valuesSpan / numSubIntervals;
					var nextValue = initialValue + step;

					var initialTime = curve.times[ i - 1 ];
					var timeSpan = curve.times[ i ] - initialTime;
					var interval = timeSpan / numSubIntervals;
					var nextTime = initialTime + interval;

					var interpolatedTimes = [];
					var interpolatedValues = [];

					while ( nextTime < curve.times[ i ] ) {

						interpolatedTimes.push( nextTime );
						nextTime += interval;

						interpolatedValues.push( nextValue );
						nextValue += step;

					}

					curve.times = inject( curve.times, i, interpolatedTimes );
					curve.values = inject( curve.values, i, interpolatedValues );

				}

			}

		},

	};

	// parse an FBX file in ASCII format
	function TextParser() {}

	TextParser.prototype = {

		constructor: TextParser,

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

			var split = text.split( /[\r\n]+/ );

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

					self.popStack();

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

			var node = { name: nodeName };
			var attrs = this.parseNodeAttr( nodeAttrs );

			var currentNode = this.getCurrentNode();

			// a top node
			if ( this.currentIndent === 0 ) {

				this.allNodes.add( nodeName, node );

			} else { // a subnode

				// if the subnode already exists, append it
				if ( nodeName in currentNode ) {

					// special case Pose needs PoseNodes as an array
					if ( nodeName === 'PoseNode' ) {

						currentNode.PoseNode.push( node );

					} else if ( currentNode[ nodeName ].id !== undefined ) {

						currentNode[ nodeName ] = {};
						currentNode[ nodeName ][ currentNode[ nodeName ].id ] = currentNode[ nodeName ];

					}

					if ( attrs.id !== '' ) currentNode[ nodeName ][ attrs.id ] = node;

				} else if ( typeof attrs.id === 'number' ) {

					currentNode[ nodeName ] = {};
					currentNode[ nodeName ][ attrs.id ] = node;

				} else if ( nodeName !== 'Properties70' ) {

					if ( nodeName === 'PoseNode' )	currentNode[ nodeName ] = [ node ];
					else currentNode[ nodeName ] = node;

				}

			}

			if ( typeof attrs.id === 'number' ) node.id = attrs.id;
			if ( attrs.name !== '' ) node.attrName = attrs.name;
			if ( attrs.type !== '' ) node.attrType = attrs.type;

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
			//	 "/9j/4RDaRXhpZgAATU0A..."
			if ( propName === 'Content' && propValue === ',' ) {

				propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

			}

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			if ( parentName === 'Properties70' ) {

				this.parseNodeSpecialProperty( line, propName, propValue );
				return;

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

				if ( currentNode[ propName ] === undefined ) {

					currentNode[ propName ] = [];

				}

			}

			// Node
			if ( propName === 'Node' ) currentNode.id = propValue;

			// connections
			if ( propName in currentNode && Array.isArray( currentNode[ propName ] ) ) {

				currentNode[ propName ].push( propValue );

			} else {

				if ( propName !== 'a' ) currentNode[ propName ] = propValue;
				else currentNode.a = propValue;

			}

			this.setCurrentProp( currentNode, propName );

			// convert string to array, unless it ends in ',' in which case more will be added to it
			if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

				currentNode.a = parseNumberArray( propValue );

			}

		},

		parseNodePropertyContinued: function ( line ) {

			var currentNode = this.getCurrentNode();

			currentNode.a += line;

			// if the line doesn't end in ',' we have reached the end of the property value
			// so convert the string to an array
			if ( line.slice( - 1 ) !== ',' ) {

				currentNode.a = parseNumberArray( currentNode.a );

			}

		},

		// parse "Property70"
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

			// cast values where needed, otherwise leave as strings
			switch ( innerPropType1 ) {

				case 'int':
				case 'enum':
				case 'bool':
				case 'ULongLong':
				case 'double':
				case 'Number':
				case 'FieldOfView':
					innerPropValue = parseFloat( innerPropValue );
					break;

				case 'Color':
				case 'ColorRGB':
				case 'Vector3D':
				case 'Lcl_Translation':
				case 'Lcl_Rotation':
				case 'Lcl_Scaling':
					innerPropValue = parseNumberArray( innerPropValue );
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode()[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp( this.getPrevNode(), innerPropName );

		},

	};

	// Parse an FBX file in Binary format
	function BinaryParser() {}

	BinaryParser.prototype = {

		constructor: BinaryParser,

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

		// recursively parse nodes until the end of the file is reached
		parseNode: function ( reader, version ) {

			var node = {};

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

			// check if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			node.singleProperty = ( numProperties === 1 && reader.getOffset() === endOffset ) ? true : false;

			while ( endOffset > reader.getOffset() ) {

				var subNode = this.parseNode( reader, version );

				if ( subNode !== null ) this.parseSubNode( name, node, subNode );

			}

			node.propertyList = propertyList; // raw property list used by parent

			if ( typeof id === 'number' ) node.id = id;
			if ( attrName !== '' ) node.attrName = attrName;
			if ( attrType !== '' ) node.attrType = attrType;
			if ( name !== '' ) node.name = name;

			return node;

		},

		parseSubNode: function ( name, node, subNode ) {

			// special case: child node is single property
			if ( subNode.singleProperty === true ) {

				var value = subNode.propertyList[ 0 ];

				if ( Array.isArray( value ) ) {

					node[ subNode.name ] = subNode;

					subNode.a = value;

				} else {

					node[ subNode.name ] = value;

				}

			} else if ( name === 'Connections' && subNode.name === 'C' ) {

				var array = [];

				subNode.propertyList.forEach( function ( property, i ) {

					// first Connection is FBX type (OO, OP, etc.). We'll discard these
					if ( i !== 0 ) array.push( property );

				} );

				if ( node.connections === undefined ) {

					node.connections = [];

				}

				node.connections.push( array );

			} else if ( subNode.name === 'Properties70' ) {

				var keys = Object.keys( subNode );

				keys.forEach( function ( key ) {

					node[ key ] = subNode[ key ];

				} );

			} else if ( name === 'Properties70' && subNode.name === 'P' ) {

				var innerPropName = subNode.propertyList[ 0 ];
				var innerPropType1 = subNode.propertyList[ 1 ];
				var innerPropType2 = subNode.propertyList[ 2 ];
				var innerPropFlag = subNode.propertyList[ 3 ];
				var innerPropValue;

				if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
				if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

				if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

					innerPropValue = [
						subNode.propertyList[ 4 ],
						subNode.propertyList[ 5 ],
						subNode.propertyList[ 6 ]
					];

				} else {

					innerPropValue = subNode.propertyList[ 4 ];

				}

				// this will be copied to parent, see above
				node[ innerPropName ] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};

			} else if ( node[ subNode.name ] === undefined ) {

				if ( typeof subNode.id === 'number' ) {

					node[ subNode.name ] = {};
					node[ subNode.name ][ subNode.id ] = subNode;

				} else {

					node[ subNode.name ] = subNode;

				}

			} else {

				if ( subNode.name === 'PoseNode' ) {

					if ( ! Array.isArray( node[ subNode.name ] ) ) {

						node[ subNode.name ] = [ node[ subNode.name ] ];

					}

					node[ subNode.name ].push( subNode );

				} else if ( node[ subNode.name ][ subNode.id ] === undefined ) {

					node[ subNode.name ][ subNode.id ] = subNode;

				}

			}

		},

		parseProperty: function ( reader ) {

			var type = reader.getString( 1 );

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

					if ( typeof Zlib === 'undefined' ) {

						console.error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

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

	};

	function BinaryReader( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

	}

	BinaryReader.prototype = {

		constructor: BinaryReader,

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

		getUint8: function () {

			var value = this.dv.getUint8( this.offset );
			this.offset += 1;
			return value;

		},

		getInt16: function () {

			var value = this.dv.getInt16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

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

		getString: function ( size ) {

			// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a[ i ] = this.getUint8();

			}

			var nullByte = a.indexOf( 0 );
			if ( nullByte >= 0 ) a = a.slice( 0, nullByte );

			return THREE.LoaderUtils.decodeText( new Uint8Array( a ) );

		}

	};

	// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
	// and BinaryParser( FBX Binary format)
	function FBXTree() {}

	FBXTree.prototype = {

		constructor: FBXTree,

		add: function ( key, val ) {

			this[ key ] = val;

		},

	};

	// ************** UTILITY FUNCTIONS **************

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

	var dataArray = [];

	// extracts the data from the correct position in the FBX array based on indexing type
	function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

		var index;

		switch ( infoObject.mappingType ) {

			case 'ByPolygonVertex' :
				index = polygonVertexIndex;
				break;
			case 'ByPolygon' :
				index = polygonIndex;
				break;
			case 'ByVertice' :
				index = vertexIndex;
				break;
			case 'AllSame' :
				index = infoObject.indices[ 0 ];
				break;
			default :
				console.warn( 'THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType );

		}

		if ( infoObject.referenceType === 'IndexToDirect' ) index = infoObject.indices[ index ];

		var from = index * infoObject.dataSize;
		var to = from + infoObject.dataSize;

		return slice( dataArray, infoObject.buffer, from, to );

	}

	var tempEuler = new THREE.Euler();
	var tempVec = new THREE.Vector3();

	// generate transformation from FBX transform data
	// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
	// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
	function generateTransform( transformData ) {

		var lTranslationM = new THREE.Matrix4();
		var lPreRotationM = new THREE.Matrix4();
		var lRotationM = new THREE.Matrix4();
		var lPostRotationM = new THREE.Matrix4();

		var lScalingM = new THREE.Matrix4();
		var lScalingPivotM = new THREE.Matrix4();
		var lScalingOffsetM = new THREE.Matrix4();
		var lRotationOffsetM = new THREE.Matrix4();
		var lRotationPivotM = new THREE.Matrix4();

		var lParentGX = new THREE.Matrix4();
		var lGlobalT = new THREE.Matrix4();

		var inheritType = ( transformData.inheritType ) ? transformData.inheritType : 0;

		if ( transformData.translation ) lTranslationM.setPosition( tempVec.fromArray( transformData.translation ) );

		if ( transformData.preRotation ) {

			var array = transformData.preRotation.map( THREE.Math.degToRad );
			array.push( transformData.eulerOrder );
			lPreRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

		}

		if ( transformData.rotation ) {

			var array = transformData.rotation.map( THREE.Math.degToRad );
			array.push( transformData.eulerOrder );
			lRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

		}

		if ( transformData.postRotation ) {

			var array = transformData.postRotation.map( THREE.Math.degToRad );
			array.push( transformData.eulerOrder );
			lPostRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

		}

		if ( transformData.scale ) lScalingM.scale( tempVec.fromArray( transformData.scale ) );

		// Pivots and offsets
		if ( transformData.scalingOffset ) lScalingOffsetM.setPosition( tempVec.fromArray( transformData.scalingOffset ) );
		if ( transformData.scalingPivot ) lScalingPivotM.setPosition( tempVec.fromArray( transformData.scalingPivot ) );
		if ( transformData.rotationOffset ) lRotationOffsetM.setPosition( tempVec.fromArray( transformData.rotationOffset ) );
		if ( transformData.rotationPivot ) lRotationPivotM.setPosition( tempVec.fromArray( transformData.rotationPivot ) );

		// parent transform
		if ( transformData.parentMatrixWorld ) lParentGX = transformData.parentMatrixWorld;

		// Global Rotation
		var lLRM = lPreRotationM.multiply( lRotationM ).multiply( lPostRotationM );
		var lParentGRM = new THREE.Matrix4();
		lParentGX.extractRotation( lParentGRM );

		// Global Shear*Scaling
		var lParentTM = new THREE.Matrix4();
		var lLSM;
		var lParentGSM;
		var lParentGRSM;

		lParentTM.copyPosition( lParentGX );
		lParentGRSM = lParentTM.getInverse( lParentTM ).multiply( lParentGX );
		lParentGSM = lParentGRM.getInverse( lParentGRM ).multiply( lParentGRSM );
		lLSM = lScalingM;

		var lGlobalRS;
		if ( inheritType === 0 ) {

			lGlobalRS = lParentGRM.multiply( lLRM ).multiply( lParentGSM ).multiply( lLSM );

		} else if ( inheritType === 1 ) {

			lGlobalRS = lParentGRM.multiply( lParentGSM ).multiply( lLRM ).multiply( lLSM );

		} else {

			var lParentLSM = new THREE.Matrix4().copy( lScalingM );

			var lParentGSM_noLocal = lParentGSM.multiply( lParentLSM.getInverse( lParentLSM ) );

			lGlobalRS = lParentGRM.multiply( lLRM ).multiply( lParentGSM_noLocal ).multiply( lLSM );

		}

		// Calculate the local transform matrix
		var lTransform = lTranslationM.multiply( lRotationOffsetM ).multiply( lRotationPivotM ).multiply( lPreRotationM ).multiply( lRotationM ).multiply( lPostRotationM ).multiply( lRotationPivotM.getInverse( lRotationPivotM ) ).multiply( lScalingOffsetM ).multiply( lScalingPivotM ).multiply( lScalingM ).multiply( lScalingPivotM.getInverse( lScalingPivotM ) );

		var lLocalTWithAllPivotAndOffsetInfo = new THREE.Matrix4().copyPosition( lTransform );

		var lGlobalTranslation = lParentGX.multiply( lLocalTWithAllPivotAndOffsetInfo );
		lGlobalT.copyPosition( lGlobalTranslation );

		lTransform = lGlobalT.multiply( lGlobalRS );

		return lTransform;

	}

	// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
	// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
	function getEulerOrder( order ) {

		order = order || 0;

		var enums = [
			'ZYX', // -> XYZ extrinsic
			'YZX', // -> XZY extrinsic
			'XZY', // -> YZX extrinsic
			'ZXY', // -> YXZ extrinsic
			'YXZ', // -> ZXY extrinsic
			'XYZ', // -> ZYX extrinsic
			//'SphericXYZ', // not possible to support
		];

		if ( order === 6 ) {

			console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );
			return enums[ 0 ];

		}

		return enums[ order ];

	}

	// Parses comma separated list of numbers and returns them an array.
	// Used internally by the TextParser
	function parseNumberArray( value ) {

		var array = value.split( ',' ).map( function ( val ) {

			return parseFloat( val );

		} );

		return array;

	}

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

	// inject array a2 into array a1 at index
	function inject( a1, index, a2 ) {

		return a1.slice( 0, index ).concat( a2 ).concat( a1.slice( index ) );

	}

	return FBXLoader;

} )();