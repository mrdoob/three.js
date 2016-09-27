/**
 * @author richt / http://richt.me
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 */

THREE.GLTFLoader = function( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.GLTFLoader.prototype = {

	constructor: THREE.GLTFLoader,

	load: function( url, onLoad, onProgress, onError ) {

		var scope = this;

		var baseUrl = this.baseUrl && ( typeof this.baseUrl === "string" ) ? this.baseUrl : THREE.Loader.prototype.extractUrlBase( url );

		var loader = new THREE.XHRLoader( scope.manager );
		loader.load( url, function( text ) {

			scope.parse( JSON.parse( text ), onLoad, baseUrl );

		}, onProgress, onError );

	},

	setCrossOrigin: function( value ) {

		this.crossOrigin = value;

	},

	setBaseUrl: function( value ) {

		this.baseUrl = value;

	},

	parse: function( json, callback, baseUrl ) {

		baseUrl = baseUrl || this.baseUrl || "";

		var resolveURL = function( url ) {

			// Invalid URL
			if ( typeof url !== 'string' || url === '' )
				return '';

			// Absolute URL
			if ( /^https?:\/\//i.test( url ) ) {

				return url;

			}

			// Data URI
			if ( /^data:.*,.*$/i.test( url ) ) {

				return url;

			}

			// Relative URL
			return baseUrl + url;

		};

		function waitForPromises() {

			var promisedProperties = [];

			for ( var i = 0; i < arguments.length; i ++ ) {

				var objectKeys = Object.keys( arguments[ i ] );
				for ( var j = 0; j < objectKeys.length; j ++ ) {

					promisedProperties.push( arguments[ i ][ objectKeys[ j ] ] );

				}

			}

			return Promise.all( promisedProperties );

		}

		// Three.js seems too dependent on attribute names so globally
		// replace those in the shader code
		var replaceShaderDefinitions = function( shaderText, technique ) {

			// Expected technique attributes
			var attributes = {};

			for ( var attributeId in technique.attributes ) {

				var pname = technique.attributes[ attributeId ];
				var param = technique.parameters[ pname ];
				var atype = param.type;
				var semantic = param.semantic;

				attributes[ attributeId ] = {
					type : atype,
					semantic : semantic
				};

			}

			// Figure out which attributes to change in technique

			var shaderParams = technique.parameters;
			var shaderAttributes = technique.attributes;
			var params = {};

			for ( var attribute in attributes ) {

				var pname = shaderAttributes[ attribute ];
				var shaderParam = shaderParams[ pname ];
				var semantic = shaderParam.semantic;
				if ( semantic ) {

					params[ attribute ] = shaderParam;

				}

			}

			for ( var pname in params ) {

				var param = params[ pname ];
				var semantic = param.semantic;

				var regEx = eval( "/" + pname + "/g" );

				switch ( semantic ) {

					case "POSITION":

						shaderText = shaderText.replace( regEx, 'position' );
						break;

					case "NORMAL":

						shaderText = shaderText.replace( regEx, 'normal' );
						break;

					case "TEXCOORD_0":

						shaderText = shaderText.replace( regEx, 'uv' );
						break;

					case "WEIGHT":

						shaderText = shaderText.replace(regEx, 'skinWeight');
						break;

					case "JOINT":

						shaderText = shaderText.replace(regEx, 'skinIndex');
						break;

				}

			}

			return shaderText;

		};

		console.time( 'GLTFLoader' );

		var library = {
			buffers: {},
			bufferViews: {},
			accessors: {},
			textures: {},
			materials: {},
			meshes: {},
			cameras: {},
			skins: {},
			animations: {},
			nodes: {},
			scenes: {},
			shaders: {},
			lights: {},
			extensions: {}
		};

		var promises = ( function( libraryItems ) {

			var resolvers = {};

			for ( var resolver in libraryItems ) {

				let resolve;

				resolvers[ resolver ] = new Promise( function( r ) {

					resolve = r;

				} );

				resolvers[ resolver ].resolve = resolve;

			}

			return resolvers;

		} )( library );

		var WEBGL_CONSTANTS = {
			FLOAT: 5126,
			//FLOAT_MAT2: 35674,
			FLOAT_MAT3: 35675,
			FLOAT_MAT4: 35676,
			FLOAT_VEC2: 35664,
			FLOAT_VEC3: 35665,
			FLOAT_VEC4: 35666,
			LINEAR: 9729,
			REPEAT: 10497,
			SAMPLER_2D: 35678,
			TRIANGLES: 4,
			UNSIGNED_BYTE: 5121,
			UNSIGNED_SHORT: 5123,

			VERTEX_SHADER: 35633,
			FRAGMENT_SHADER: 35632
		};

		var WEBGL_TYPE = {
			5126: Object, // no special type
			//35674: Object,
			35675: THREE.Matrix3,
			35676: THREE.Matrix4,
			35664: THREE.Vector2,
			35665: THREE.Vector3,
			35666: THREE.Vector4,
			35678: Object // no special type
		};

		var WEBGL_FILTERS = {
			9728: THREE.NearestFilter,
			9729: THREE.LinearFilter,
			9984: THREE.NearestMipMapNearestFilter,
			9985: THREE.LinearMipMapNearestFilter,
			9986: THREE.NearestMipMapLinearFilter,
			9987: THREE.LinearMipMapLinearFilter
		};

		var WEBGL_WRAPPINGS = {
			33071: THREE.ClampToEdgeWrapping,
			33648: THREE.MirroredRepeatWrapping,
			10497: THREE.RepeatWrapping
		};

		// shaders

		var shaders = json.shaders;

		for ( var shaderId in shaders ) {

			var shader = shaders[ shaderId ];

			library.shaders[ shaderId ] = new Promise( function( resolve ) {

				var loader = new THREE.XHRLoader();
				loader.responseType = 'text';
				loader.load( resolveURL( shader.uri ), function( shaderText ) {

					resolve( shaderText );

				} );

			} );

		}

		waitForPromises(
			library.shaders
		).then( function( values ) {

			var count = 0;
			for ( var shaderId in library.shaders ) {

				library.shaders[ shaderId ] = values[ count ++ ];

			}

			promises.shaders.resolve();

		} );

		// buffers

		var buffers = json.buffers;

		for ( var bufferId in buffers ) {

			var buffer = buffers[ bufferId ];

			if ( buffer.type === 'arraybuffer' ) {

				library.buffers[ bufferId ] = new Promise( function( resolve ) {

					var loader = new THREE.XHRLoader();
					loader.responseType = 'arraybuffer';
					loader.load( resolveURL( buffer.uri ), function( buffer ) {

						resolve( buffer );

					} );

				} );

			}

		}

		waitForPromises(
			library.buffers
		).then( function( values ) {

			var count = 0;
			for ( var bufferId in library.buffers ) {

				library.buffers[ bufferId ] = values[ count ++ ];

			}

			promises.buffers.resolve();

		} );

		// buffer views

		waitForPromises([
			promises.buffers
		]).then( function() {

			var bufferViews = json.bufferViews;

			for ( var bufferViewId in bufferViews ) {

				var bufferView = bufferViews[ bufferViewId ];
				var arraybuffer = library.buffers[ bufferView.buffer ];

				library.bufferViews[ bufferViewId ] = arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength );

			}

			promises.bufferViews.resolve();

		} );

		// accessors

		waitForPromises([
			promises.bufferViews
		]).then( function() {

			var COMPONENT_TYPES = {
				5120: Int8Array,
				5121: Uint8Array,
				5122: Int16Array,
				5123: Uint16Array,
				5125: Uint32Array,
				5126: Float32Array,
			};

			var TYPE_SIZES = {
				'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4,
				'MAT2': 4, 'MAT3': 9, 'MAT4': 16
			};

			var accessors = json.accessors;

			for ( var accessorId in accessors ) {

				var accessor = accessors[ accessorId ];

				var arraybuffer = library.bufferViews[ accessor.bufferView ];
				var itemSize = TYPE_SIZES[ accessor.type ];
				var TypedArray = COMPONENT_TYPES[ accessor.componentType ];

				var array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

				library.accessors[ accessorId ] = new THREE.BufferAttribute( array, itemSize );

			}

			promises.accessors.resolve();

		} );

		// textures

		var textures = json.textures;

		for ( let textureId in textures ) {

			var texture = textures[ textureId ];

			if ( texture.source ) {

				var source = json.images[ texture.source ];

				var textureLoader = THREE.Loader.Handlers.get( source.uri );
				if ( textureLoader === null ) {

					textureLoader = new THREE.TextureLoader();

				}
				textureLoader.crossOrigin = this.crossOrigin;

				library.textures[ textureId ] = new Promise( function( resolve ) {

					textureLoader.load( resolveURL( source.uri ), function( _texture ) {

						// UV buffer attributes are also flipped
						_texture.flipY = true;

						if ( texture.sampler ) {

							var sampler = json.samplers[ texture.sampler ];

							_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ];
							_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ];
							_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ];
							_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ];

						}

						resolve( _texture );

					} );

				} );

			}

		}

		waitForPromises(
			library.textures
		).then( function( values ) {

			var count = 0;
			for ( var textureId in library.textures ) {

				library.textures[ textureId ] = values[ count ++ ];

			}

			promises.textures.resolve();

		} );

		// materials

		// Deferred constructor for RawShaderMaterial types
		var DeferredShaderMaterial = function( params ) {

			this.isDeferredShaderMaterial = true;

			this.params = params;

		};

		DeferredShaderMaterial.prototype.clone = function() {

			var uniforms = THREE.UniformsUtils.clone( this.params.uniforms );

			for ( var uniformId in uniforms ) {

				if ( uniforms[ uniformId ].value instanceof THREE.Texture ) {

					uniforms[ uniformId ].value.needsUpdate = true;

				}

			}

			this.params.uniforms = uniforms;

			return new THREE.RawShaderMaterial( this.params )

		};

		waitForPromises([
			promises.textures,
			promises.shaders
		]).then( function() {

		var materials = json.materials;

		for ( var materialId in materials ) {

			var material = materials[ materialId ];

			var materialType;
			var materialValues = {};
			var materialParams = {};

			var khr_material;

			if ( material.extensions && material.extensions.KHR_materials_common ) {

				khr_material = material.extensions.KHR_materials_common;

			} else if ( json.extensions && json.extensions.KHR_materials_common ) {

				khr_material = json.extensions.KHR_materials_common;

			}

			if ( khr_material ) {

				switch ( khr_material.technique )
				{
					case 'BLINN' :
					case 'PHONG' :
						materialType = THREE.MeshPhongMaterial;
						break;

					case 'LAMBERT' :
						materialType = THREE.MeshLambertMaterial;
						break;

					case 'CONSTANT' :
					default :
						materialType = THREE.MeshBasicMaterial;
						break;
				}

				for ( prop in khr_material.values ) {

					materialValues[ prop ] = khr_material.values[ prop ];

				}

				if ( khr_material.doubleSided )
				{

					materialParams.side = THREE.DoubleSide;

				}

				if ( khr_material.transparent )
				{

					materialParams.transparent = true;

				}

			} else if ( material.technique === undefined ) {

				materialType = THREE.MeshPhongMaterial;

				materialParams.side = THREE.DoubleSide;

				for ( var prop in material.values ) {

					materialValues[ prop ] = material.values[ prop ];

				}

			} else {

				materialType = DeferredShaderMaterial;

				materialParams.side = THREE.DoubleSide;

				var technique = json.techniques[ material.technique ];

				materialParams.uniforms = {};

				var program = json.programs[ technique.program ];

				if ( program ) {

					materialParams.fragmentShader = library.shaders[ program.fragmentShader ];

					if ( ! materialParams.fragmentShader ) {

						console.warn( "ERROR: Missing fragment shader definition:", program.fragmentShader );
						materialType = THREE.MeshPhongMaterial;

					}

					var vertexShader = library.shaders[ program.vertexShader ];

					if ( ! vertexShader ) {

						console.warn( "ERROR: Missing vertex shader definition:", program.vertexShader );
						materialType = THREE.MeshPhongMaterial;

					}

					// IMPORTANT: FIX VERTEX SHADER ATTRIBUTE DEFINITIONS
					materialParams.vertexShader = replaceShaderDefinitions( vertexShader, technique );

					var uniforms = technique.uniforms;

					for ( var uniformId in uniforms ) {

						var pname = uniforms[ uniformId ];
						var shaderParam = technique.parameters[ pname ];

						var ptype = shaderParam.type;

						if ( WEBGL_TYPE[ ptype ] ) {

							var pcount = shaderParam.count;
							var value = material.values[ pname ];

							var uvalue = new WEBGL_TYPE[ ptype ]();
							var usemantic = shaderParam.semantic;

							switch ( ptype ) {

								case WEBGL_CONSTANTS.FLOAT_MAT4:

									if ( pcount ) {

										uvalue = new Array( pcount );

										for ( var mi = 0; mi < pcount; mi ++ ) {

											uvalue[ mi ] = new WEBGL_TYPE[ ptype ]();

										}

										if ( shaderParam && shaderParam.value ) {

											var m4v = shaderParam.value;
											uvalue.fromArray( m4v );

										}

										if ( value ) {

											uvalue.fromArray( value );

										}

									}	else {

										if ( shaderParam && shaderParam.value ) {

											var m4 = shaderParam.value;
											uvalue.fromArray( m4 );

										}

										if ( value ) {

											uvalue.fromArray( value );

										}

									}

									break;

								case WEBGL_CONSTANTS.SAMPLER_2D:

									uvalue = value ? library.textures[ value ] : null;

									break;

								case WEBGL_CONSTANTS.FLOAT:

									if ( shaderParam && shaderParam.value ) {

										uvalue = shaderParam.value;

									}

									if ( pname == "transparency" ) {

										uvalue = value;
										materialParams.transparent = true;

									}

									break;

								default: // everything else is a straight copy

									if ( shaderParam && shaderParam.value ) {

										uvalue.fromArray( shaderParam.value );

									}

									if ( value ) {

										uvalue.fromArray( value );

									}

									break;

							}

							materialParams.uniforms[ uniformId ] = {
								value: uvalue,
								semantic: usemantic
							};

						} else {

							throw new Error( "Unknown shader uniform param type: " + ptype );

						}

					}

				}

			}

			if ( Array.isArray( materialValues.diffuse ) ) {

				materialParams.color = new THREE.Color().fromArray( materialValues.diffuse );

			} else if ( typeof( materialValues.diffuse ) === 'string' ) {

				materialParams.map = library.textures[ materialValues.diffuse ];

			}

			if ( typeof( materialValues.reflective ) == 'string' ) {

				materialParams.envMap = library.textures[ materialValues.reflective ];

			}

			if ( typeof( materialValues.bump ) === 'string' ) {

				materialParams.bumpMap = library.textures[ materialValues.bump ];

			}

			if ( Array.isArray( materialValues.emission ) ) materialParams.emissive = new THREE.Color().fromArray( materialValues.emission );
			if ( Array.isArray( materialValues.specular ) ) materialParams.specular = new THREE.Color().fromArray( materialValues.specular );

			if ( materialValues.shininess !== undefined ) materialParams.shininess = materialValues.shininess;

			var _material = new materialType( materialParams );
			_material.name = material.name;

			library.materials[ materialId ] = _material;

		}

		promises.materials.resolve();

	} );

		// meshes

		waitForPromises([
			promises.accessors,
			promises.materials
		]).then( function() {

		var meshes = json.meshes;

		for ( var meshId in meshes ) {

			var mesh = meshes[ meshId ];

			var group = new THREE.Object3D();
			group.name = mesh.name;

			var primitives = mesh.primitives;

			for ( var i = 0; i < primitives.length; i ++ ) {

				var primitive = primitives[ i ];

				if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ) {

					var geometry = new THREE.BufferGeometry();

					if ( primitive.indices ) {

						var indexArray = library.accessors[ primitive.indices ];

						geometry.setIndex( indexArray, 1 );

						var offset = {
							start: 0,
							index: 0,
							count: indexArray.count
						};

						geometry.groups.push( offset );

					}

					var attributes = primitive.attributes;

					for ( var attributeId in attributes ) {

						var attributeEntry = attributes[ attributeId ];

						if ( ! attributeEntry ) {

							continue;

						}

						var bufferAttribute = library.accessors[ attributeEntry ];

						switch ( attributeId ) {

							case 'POSITION':
								geometry.addAttribute( 'position', bufferAttribute );
								break;

							case 'NORMAL':
								geometry.addAttribute( 'normal', bufferAttribute );
								break;

							case 'TEXCOORD_0':
								// Flip Y value for UVs
								var floatArray = bufferAttribute.array;
								for ( i = 0; i < floatArray.length / 2; i ++ ) {

									floatArray[ i * 2 + 1 ] = 1.0 - floatArray[ i * 2 + 1 ];

								}
								bufferAttribute.array = floatArray;

								geometry.addAttribute( 'uv', bufferAttribute );
								break;

							case 'WEIGHT':
								geometry.addAttribute( 'skinWeight', bufferAttribute );
								break;

							case 'JOINT':

								geometry.addAttribute( 'skinIndex', bufferAttribute );
								break;

						}

					}

					geometry.computeBoundingSphere();

					var material = library.materials[ primitive.material ];

					var meshNode = new THREE.Mesh( geometry, material );
					meshNode.castShadow = true;

					group.add( meshNode );

				}

			}

			library.meshes[ meshId ] = group;

		}

		promises.meshes.resolve();

	} );

		// cameras

		var cameras = json.cameras;

		for ( var cameraId in cameras ) {

			var camera = cameras[ cameraId ];

			if ( camera.type == "perspective" && camera.perspective ) {

				var yfov = camera.perspective.yfov;
				var xfov = camera.perspective.xfov;
				var aspect_ratio = camera.perspective.aspect_ratio || 1;

				// According to COLLADA spec...
				// aspect_ratio = xfov / yfov
				xfov = ( xfov === undefined && yfov ) ? yfov * aspect_ratio : xfov;

				// According to COLLADA spec...
				// aspect_ratio = xfov / yfov
				// yfov = ( yfov === undefined && xfov ) ? xfov / aspect_ratio : yfov;

				library.cameras[ cameraId ] = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspect_ratio, camera.perspective.znear || 1, camera.perspective.zfar || 2e6 );
				library.cameras[ cameraId ].name = camera.name;

			} else if ( camera.type == "orthographic" && camera.orthographic ) {

				library.cameras[ cameraId ] = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
				library.cameras[ cameraId ].name = camera.name;

			}

		}

		promises.cameras.resolve();

		// scene node hierachy builder

		var buildNodeHierachy = function( nodeId, parentObject ) {

			var _node = library.nodes[ nodeId ];
			parentObject.add( _node );

			var node = json.nodes[ nodeId ];

			if ( node.children ) {

				for ( var i = 0; i < node.children.length; i ++ ) {

					var childId = node.children[ i ];

					buildNodeHierachy( childId, _node );

				}

			}

		};

		// skins

		waitForPromises([
			promises.accessors,
			promises.buffers,
			promises.bufferViews
		]).then( function() {

			var skins = json.skins;

			for ( var skinId in skins ) {

				var skin = skins[ skinId ];

				var skinEntry = {
					bindShapeMatrix: new THREE.Matrix4().fromArray( skin.bindShapeMatrix ),
					jointNames: skin.jointNames,
					inverseBindMatrices: library.accessors[ skin.inverseBindMatrices ]
				};

				library.skins[ skinId ] = skinEntry;

			}

			promises.skins.resolve();

		});

		// animations

		waitForPromises([
			promises.buffers,
			promises.bufferViews,
			promises.nodes
		]).then( function() {

			var animations = json.animations;
			var nodeAnimationChannels = {};

			for ( var animationId in animations ) {

				var animation = animations[ animationId ];

				var interps = [];

				for ( var i = 0; i < animation.channels.length; i ++ ) {

					var channel = animation.channels[ i ];
					var sampler = animation.samplers[ channel.sampler ];

					if (sampler && animation.parameters) {

							var target = channel.target;
							var name = target.id;
							var input = animation.parameters[sampler.input];
							var output = animation.parameters[sampler.output];

							var inputAccessor = library.accessors[ input ];
							var outputAccessor = library.accessors[ output ];

							var node = library.nodes[ name ];

							if ( node ) {

								var interp = {
									keys : inputAccessor.array,
									values : outputAccessor.array,
									count : inputAccessor.count,
									target : node,
									path : target.path,
									type : sampler.interpolation
								};

								if ( !nodeAnimationChannels[ name ] ) {

									nodeAnimationChannels[ name ] = [];

								}

								nodeAnimationChannels[ name ].push( interp );
								interps.push( interp );

							}

					}

				}

				library.animations[ animationId ] = new THREE.GLTFAnimation(interps);
				library.animations[ animationId ].name = "animation_" + animationId;

			}

			promises.animations.resolve();

		});

		// nodes

		waitForPromises([
			promises.meshes,
			promises.skins,
			promises.lights
		]).then( function() {

			var nodes = json.nodes;

			for ( var nodeId in nodes ) {

				var node = json.nodes[ nodeId ];
				var matrix = new THREE.Matrix4();

				var object;

				if ( node.jointName ) {

					object = new THREE.Bone();
					object.jointName = node.jointName;

				} else {

					object = new THREE.Object3D()

				}

				object.name = node.name;

				object.matrixAutoUpdate = false;

				if ( node.matrix !== undefined ) {

					matrix.fromArray( node.matrix );
					object.applyMatrix( matrix );

				} else {

					if ( node.translation !== undefined ) {

						object.position.fromArray( node.translation );

					}

					if ( node.rotation !== undefined ) {

						object.quaternion.fromArray( node.rotation );

					}

					if ( node.scale !== undefined ) {

						object.scale.fromArray( node.scale );

					}

				}

				if ( node.meshes !== undefined ) {

					var skinEntry;
					if ( node.skin ) {

						skinEntry = library.skins[ node.skin ];

					}

					for ( var i = 0; i < node.meshes.length; i ++ ) {

						var meshId = node.meshes[ i ];

						var group = library.meshes[ meshId ];

						for ( var j = 0; j < group.children.length; j ++ ) {

							let mesh = group.children[ j ];

							// clone node to add to object

							var originalMaterial = mesh.material;

							var geometry = mesh.geometry.clone();
							var material = originalMaterial.clone();

							mesh = new THREE.Mesh( geometry, material );
							mesh.castShadow = true;

							// Replace Mesh with SkinnedMesh in library
							if (skinEntry) {

								var geometry = mesh.geometry.clone();
								var material = originalMaterial.clone();
								material.skinning = true;

								mesh = new THREE.SkinnedMesh( geometry, material, false );
								mesh.castShadow = true;

								// Wait for nodes to be processed before requesting further
								// nodes
								promises.nodes.then( function() {

									var bones = [];
									var boneInverses = [];

									for ( var i = 0; i < skinEntry.jointNames.length; i ++ ) {

										var jointId = skinEntry.jointNames[i];
										var jointNode = library.nodes[ jointId ];

										if ( jointNode ) {

											jointNode.skin = mesh;
											bones.push(jointNode);

											var m = skinEntry.inverseBindMatrices.array;
											var mat = new THREE.Matrix4().set(
													m[i * 16 + 0], m[i * 16 + 4], m[i * 16 + 8], m[i * 16 + 12],
													m[i * 16 + 1], m[i * 16 + 5], m[i * 16 + 9], m[i * 16 + 13],
													m[i * 16 + 2], m[i * 16 + 6], m[i * 16 + 10], m[i * 16 + 14],
													m[i * 16 + 3], m[i * 16 + 7], m[i * 16 + 11], m[i * 16 + 15]
												);
											boneInverses.push(mat);

										} else {
											console.warn( "WARNING: joint: ''" + jointId + "' could not be found" );
										}

									}

									mesh.bind( new THREE.Skeleton( bones, boneInverses, false ), skinEntry.bindShapeMatrix );

								});


							}

							object.add( mesh );

						}

					}

				}

				if ( node.camera !== undefined ) {

					var camera = library.cameras[ node.camera ];

					object.add( camera );

				}

				if (node.extensions && node.extensions.KHR_materials_common
						&& node.extensions.KHR_materials_common.light) {

					var light = library.lights[ node.extensions.KHR_materials_common.light ];

					object.add(light);

				}

				library.nodes[ nodeId ] = object;

			}

			promises.nodes.resolve();

		});

		// extensions

		for ( var extensionId in json.extensions ) {

			var extension = json.extensions[ extensionId ];

			switch ( extensionId ) {

				case "KHR_materials_common":

					var extensionNode = new THREE.Object3D();

					var lights = extension.lights;

					for ( var lightID in lights ) {

						var light = lights[ lightID ];
						var lightNode;

						var lightParams = light[light.type];
						var color = new THREE.Color().fromArray( lightParams.color );

						switch ( light.type ) {

							case "directional":
								lightNode = new THREE.DirectionalLight( color );
								lightNode.position.set( 0, 0, 1 );
							break;

							case "point":
								lightNode = new THREE.PointLight( color );
							break;

							case "spot ":
								lightNode = new THREE.SpotLight( color );
								lightNode.position.set( 0, 0, 1 );
							break;

							case "ambient":
								lightNode = new THREE.AmbientLight( color );
							break;

						}

						if ( lightNode ) {

							library.lights[ lightID ] = lightNode;

							extensionNode.add( lightNode );

						}

					}

					library.extensions[ extensionId ] = extensionNode;

					break;

			}

		}

		promises.lights.resolve();
		promises.extensions.resolve();

		// scenes

		waitForPromises([
			promises.textures,
			promises.meshes,
			promises.cameras,
			promises.skins,
			promises.nodes,
			promises.extensions
		]).then( function() {

			var scenes = json.scenes;

			for ( var sceneId in scenes ) {

				var scene = scenes[ sceneId ];
				var container = new THREE.Scene();
				container.name = scene.name;

				for ( var i = 0; i < scene.nodes.length; i ++ ) {

					var nodeId = scene.nodes[ i ];

					buildNodeHierachy( nodeId, container );

				}

				container.traverse( function( child ) {

					// Register raw material meshes with GLTFShaders
					if (child.material && child.material.isRawShaderMaterial) {
						var xshader = new THREE.GLTFShader( child );
						THREE.GLTFShaders.add( xshader );
					}

				});

				for ( var extensionId in library.extensions ) {

					var extension = library.extensions[ extensionId ];

					container.add( extension );

				}

				library.scenes[ sceneId ] = container;

			}

			promises.scenes.resolve();

		} );

		// Wait for all library components to be run before invoking callback
		waitForPromises( promises ).then( function() {

			console.timeEnd( 'GLTFLoader' );

			var cameras = [];
			for ( var cameraId in library.cameras ) {

				cameras.push( library.cameras[ cameraId ] );

			}

			var animations = [];
			for ( var animationId in library.animations ) {

				animations.push( library.animations[ animationId ] );

			}

			var glTF = {

				scene		:	library.scenes[ json.scene ],
				cameras		:	cameras,
				animations	:	animations

			};

			callback( glTF );

		} );

		// Developers should use `callback` argument for async notification on
		// completion to prevent side effects.
		// Function return is kept only for backward-compatability purposes.
		return {
		get scene() {

			console.warn( "synchronous glTF object access is deprecated. " +
					"Instead use 'callback' argument in function call " +
					"to access asynchronous glTF object." );
			return library.scenes[ json.scene ];

		},
		set scene( value ) {

			library.scenes[ json.scene ] = value;

		}
	};

	}

};

/* GLTFREGISTRY */

var GLTFRegistry = function() {

var objects = [];

	return	{
		add : function( object ) {

			objects.push( object );

		},

		remove: function( object ) {

			var i = objects.indexOf( object );

			if ( i !== - 1 ) {

				objects.splice( i, 1 );

			}

		},

		update : function( scene, camera ) {

			for ( i = 0; i < objects.length; i ++ ) {

				objects[ i ].update( scene, camera );

			}

		}
	};
};

/* GLTFSHADERS */

THREE.GLTFShaders = new GLTFRegistry();

/* GLTFSHADER */

THREE.GLTFShader = function( object3D ) {

	this.object = object3D;

	this._m4 = new THREE.Matrix4();

}

// Update - update all the uniform values
THREE.GLTFShader.prototype.update = function( scene, camera ) {

	// update scene graph

	scene.updateMatrixWorld();

	// update camera matrices and frustum

	camera.updateMatrixWorld();
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	var uniforms = this.object && this.object.material && this.object.material.uniforms ? this.object.material.uniforms : {};

	for ( var uniformId in uniforms ) {

		var uniform = uniforms[ uniformId ];

		if ( uniform.semantic ) {

			switch ( uniform.semantic ) {

				case "MODELVIEW":

					var m4 = uniform.value;
					m4.multiplyMatrices( camera.matrixWorldInverse,
					this.object.matrixWorld );

					break;

				case "MODELVIEWINVERSETRANSPOSE":

					var m3 = uniform.value;
					this._m4.multiplyMatrices( camera.matrixWorldInverse,
					this.object.matrixWorld );
					m3.getNormalMatrix( this._m4 );

					break;

				case "PROJECTION":

					var m4 = uniform.value;
					m4.copy( camera.projectionMatrix );

					break;

				case "JOINTMATRIX":

					var m4v = uniform.value;
					for ( var mi = 0; mi < m4v.length; mi ++ ) {

						// TODO: fix this!

						// So it goes like this:
						// SkinnedMesh world matrix is already baked into MODELVIEW;
						// transform joints to local space,
						// then transform using joint's inverse
						m4v[ mi ]
							.getInverse( this.object.matrixWorld )
							.multiply( this.object.skeleton.bones[ mi ].matrixWorld )
							.multiply( this.object.skeleton.boneInverses[ mi ] );

					}

					break;

				default:

					console.warn( "Unhandled shader semantic: '" + semantic + "'" );
					break;

			}

		}

	}

};


/* GLTFANIMATION */

THREE.GLTFAnimator = new GLTFRegistry();

// Construction/initialization
THREE.GLTFAnimation = function( interps ) {

	this.running = false;
	this.loop = false;
	this.duration = 0;
	this.startTime = 0;
	this.interps = [];

	if ( interps ) {

		this.createInterpolators( interps );

	}

};

THREE.GLTFAnimation.prototype.createInterpolators = function( interps ) {

	var i, len = interps.length;
	for ( i = 0; i < len; i ++ )
	{

		var interp = new THREE.GLTFInterpolator( interps[ i ] );
		this.interps.push( interp );
		this.duration = Math.max( this.duration, interp.duration );

	}

}

// Start/stop
THREE.GLTFAnimation.prototype.play = function() {

	if ( this.running )
		return;

	this.startTime = Date.now();
	this.running = true;
	THREE.GLTFAnimator.add( this );

};

THREE.GLTFAnimation.prototype.stop = function() {

	this.running = false;
	THREE.GLTFAnimator.remove( this );

};

// Update - drive key frame evaluation
THREE.GLTFAnimation.prototype.update = function() {

	if ( !this.running )
		return;

	var now = Date.now();
	var deltat = ( now - this.startTime ) / 1000;
	var t = deltat % this.duration;
	var nCycles = Math.floor( deltat / this.duration );

	if ( nCycles >= 1 && ! this.loop ) {

		this.running = false;
		for ( var i = 0; i < this.interps.length; i ++ ) {

			this.interps[ i ].interp( this.duration );

		}
		this.stop();
		return;

	} else {

		for ( var i = 0; i < this.interps.length; i ++ ) {

			this.interps[ i ].interp( t );

		}

	}

};

/* GLTFINTERPOLATOR */

THREE.GLTFInterpolator = function( param ) {

	this.keys = param.keys;
	this.values = param.values;
	this.count = param.count;
	this.type = param.type;
	this.path = param.path;
	this.isRot = false;

	var node = param.target;
	node.updateMatrix();
	node.matrixAutoUpdate = true;
	this.targetNode = node;

	switch ( param.path ) {

		case "translation" :

			this.target = node.position;
			this.originalValue = node.position.clone();
			break;

		case "rotation" :

			this.target = node.quaternion;
			this.originalValue = node.quaternion.clone();
			this.isRot = true;
			break;

		case "scale" :

			this.target = node.scale;
			this.originalValue = node.scale.clone();
			break;

	}

	this.duration = this.keys[ this.count - 1 ];

	this.vec1 = new THREE.Vector3();
	this.vec2 = new THREE.Vector3();
	this.vec3 = new THREE.Vector3();
	this.quat1 = new THREE.Quaternion();
	this.quat2 = new THREE.Quaternion();
	this.quat3 = new THREE.Quaternion();

};

//Interpolation and tweening methods
THREE.GLTFInterpolator.prototype.interp = function( t ) {

	if ( t == this.keys[ 0 ] ) {

		if ( this.isRot ) {

			this.quat3.set( this.values[ 0 ], this.values[ 1 ], this.values[ 2 ], this.values[ 3 ] );

		} else {

			this.vec3.set( this.values[ 0 ], this.values[ 1 ], this.values[ 2 ] );

		}

	} else if ( t < this.keys[ 0 ] ) {

		if ( this.isRot ) {

			this.quat1.set( this.originalValue.x,
					this.originalValue.y,
					this.originalValue.z,
					this.originalValue.w );
			this.quat2.set( this.values[ 0 ],
					this.values[ 1 ],
					this.values[ 2 ],
					this.values[ 3 ] );
			THREE.Quaternion.slerp( this.quat1, this.quat2, this.quat3, t / this.keys[ 0 ] );

		} else {

			this.vec3.set( this.originalValue.x,
					this.originalValue.y,
					this.originalValue.z );
			this.vec2.set( this.values[ 0 ],
					this.values[ 1 ],
					this.values[ 2 ] );

			this.vec3.lerp( this.vec2, t / this.keys[ 0 ] );

		}

	} else if ( t >= this.keys[ this.count - 1 ] ) {

		if ( this.isRot ) {

			this.quat3.set( this.values[ ( this.count - 1 ) * 4 ],
					this.values[ ( this.count - 1 ) * 4 + 1 ],
					this.values[ ( this.count - 1 ) * 4 + 2 ],
					this.values[ ( this.count - 1 ) * 4 + 3 ] );

		} else {

			this.vec3.set( this.values[ ( this.count - 1 ) * 3 ],
					this.values[ ( this.count - 1 ) * 3 + 1 ],
					this.values[ ( this.count - 1 ) * 3 + 2 ] );

		}

	} else {

		for ( var i = 0; i < this.count - 1; i ++ ) {

			var key1 = this.keys[ i ];
			var key2 = this.keys[ i + 1 ];

			if ( t >= key1 && t <= key2 ) {

				if ( this.isRot ) {

					this.quat1.set( this.values[ i * 4 ],
							this.values[ i * 4 + 1 ],
							this.values[ i * 4 + 2 ],
							this.values[ i * 4 + 3 ] );
					this.quat2.set( this.values[ ( i + 1 ) * 4 ],
							this.values[ ( i + 1 ) * 4 + 1 ],
							this.values[ ( i + 1 ) * 4 + 2 ],
							this.values[ ( i + 1 ) * 4 + 3 ] );
					THREE.Quaternion.slerp( this.quat1, this.quat2, this.quat3, ( t - key1 ) / ( key2 - key1 ) );

				} else {

					this.vec3.set( this.values[ i * 3 ],
							this.values[ i * 3 + 1 ],
							this.values[ i * 3 + 2 ] );
					this.vec2.set( this.values[ ( i + 1 ) * 3 ],
							this.values[ ( i + 1 ) * 3 + 1 ],
							this.values[ ( i + 1 ) * 3 + 2 ] );

					this.vec3.lerp( this.vec2, ( t - key1 ) / ( key2 - key1 ) );

				}

			}

		}

	}

	if ( this.target ) {

		if ( this.isRot ) {

			this.target.copy( this.quat3 );

		} else {

			this.target.copy( this.vec3 );

		}

	}

};
