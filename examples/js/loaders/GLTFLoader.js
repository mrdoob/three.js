/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 */

THREE.GLTFLoader = ( function () {

	function GLTFLoader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

	GLTFLoader.prototype = {

		constructor: GLTFLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = this.path && ( typeof this.path === "string" ) ? this.path : THREE.Loader.prototype.extractUrlBase( url );

			var loader = new THREE.FileLoader( scope.manager );
			loader.load( url, function ( text ) {

				scope.parse( JSON.parse( text ), onLoad, path );

			}, onProgress, onError );

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		setPath: function ( value ) {

			this.path = value;

		},

		parse: function ( json, callback, path ) {

			console.time( 'GLTFLoader' );

			var parser = new GLTFParser( json, {

				path: path || this.path,
				crossOrigin: this.crossOrigin

			} );

			parser.parse( function ( scene, scenes, cameras, animations ) {

				console.timeEnd( 'GLTFLoader' );

				var glTF = {
					"scene": scene,
					"scenes": scenes,
					"cameras": cameras,
					"animations": animations
				};

				callback( glTF );

			} );

		}

	};

	/* GLTFREGISTRY */

	function GLTFRegistry() {

		var objects = {};

		return	{

			get: function ( key ) {

				return objects[ key ];

			},

			add: function ( key, object ) {

				objects[ key ] = object;

			},

			remove: function ( key ) {

				delete objects[ key ];

			},

			removeAll: function () {

				objects = {};

			},

			update: function ( scene, camera ) {

				for ( var name in objects ) {

					var object = objects[ name ];

					if ( object.update ) {

						object.update( scene, camera );

					}

				}

			}

		};

	}

	/* GLTFSHADERS */

	GLTFLoader.Shaders = new GLTFRegistry();

	/* GLTFSHADER */

	function GLTFShader( targetNode, allNodes ) {

		var boundUniforms = {};

		// bind each uniform to its source node

		var uniforms = targetNode.material.uniforms;

		for ( var uniformId in uniforms ) {

			var uniform = uniforms[ uniformId ];

			if ( uniform.semantic ) {

				var sourceNodeRef = uniform.node;

				var sourceNode = targetNode;

				if ( sourceNodeRef ) {

					sourceNode = allNodes[ sourceNodeRef ];

				}

				boundUniforms[ uniformId ] = {
					semantic: uniform.semantic,
					sourceNode: sourceNode,
					targetNode: targetNode,
					uniform: uniform
				};

			}

		}

		this.boundUniforms = boundUniforms;
		this._m4 = new THREE.Matrix4();

	}

	// Update - update all the uniform values
	GLTFShader.prototype.update = function ( scene, camera ) {

		// update scene graph

		scene.updateMatrixWorld();

		// update camera matrices and frustum

		camera.updateMatrixWorld();
		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		var boundUniforms = this.boundUniforms;

		for ( var name in boundUniforms ) {

			var boundUniform = boundUniforms[ name ];

			switch ( boundUniform.semantic ) {

				case "MODELVIEW":

					var m4 = boundUniform.uniform.value;
					m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					break;

				case "MODELVIEWINVERSETRANSPOSE":

					var m3 = boundUniform.uniform.value;
					this._m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					m3.getNormalMatrix( this._m4 );
					break;

				case "PROJECTION":

					var m4 = boundUniform.uniform.value;
					m4.copy( camera.projectionMatrix );
					break;

				case "JOINTMATRIX":

					var m4v = boundUniform.uniform.value;

					for ( var mi = 0; mi < m4v.length; mi ++ ) {

						// So it goes like this:
						// SkinnedMesh world matrix is already baked into MODELVIEW;
						// transform joints to local space,
						// then transform using joint's inverse
						m4v[ mi ]
							.getInverse( boundUniform.sourceNode.matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.bones[ mi ].matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.boneInverses[ mi ] )
							.multiply( boundUniform.targetNode.bindMatrix );

					}

					break;

				default :

					console.warn( "Unhandled shader semantic: " + boundUniform.semantic );
					break;

			}

		}

	};


	/* ANIMATION */

	GLTFLoader.Animations = {

		update: function () {

			console.warn( 'THREE.GLTFLoader.Animation has been deprecated. Use THREE.AnimationMixer instead.' );

		}

	};

	/*********************************/
	/********** INTERNALS ************/
	/*********************************/

	/* CONSTANTS */

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
		LINES: 1,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123,

		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632
	};

	var WEBGL_TYPE = {
		5126: Number,
		//35674: THREE.Matrix2,
		35675: THREE.Matrix3,
		35676: THREE.Matrix4,
		35664: THREE.Vector2,
		35665: THREE.Vector3,
		35666: THREE.Vector4,
		35678: THREE.Texture
	};

	var WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
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

	var WEBGL_TYPE_SIZES = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16
	};

	var PATH_PROPERTIES = {
		scale: 'scale',
		translation: 'position',
		rotation: 'quaternion'
	};

	var INTERPOLATION = {
		LINEAR: THREE.InterpolateLinear,
		STEP: THREE.InterpolateDiscrete
	};

	/* UTILITY FUNCTIONS */

	function _each( object, callback, thisObj ) {

		if ( !object ) {
			return Promise.resolve();
		}

		var results;
		var fns = [];

		if ( Object.prototype.toString.call( object ) === '[object Array]' ) {

			results = [];

			var length = object.length;
			for ( var idx = 0; idx < length; idx ++ ) {
				var value = callback.call( thisObj || this, object[ idx ], idx );
				if ( value ) {
					fns.push( value );
					if ( value instanceof Promise ) {
						value.then( function( key, value ) {
							results[ idx ] = value;
						}.bind( this, key ));
					} else {
						results[ idx ] = value;
					}
				}
			}

		} else {

			results = {};

			for ( var key in object ) {
				if ( object.hasOwnProperty( key ) ) {
					var value = callback.call( thisObj || this, object[ key ], key );
					if ( value ) {
						fns.push( value );
						if ( value instanceof Promise ) {
							value.then( function( key, value ) {
								results[ key ] = value;
							}.bind( this, key ));
						} else {
							results[ key ] = value;
						}
					}
				}
			}

		}

		return Promise.all( fns ).then( function() {
			return results;
		});

	}

	function resolveURL( url, path ) {

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
		return ( path || '' ) + url;

	}

	// Three.js seems too dependent on attribute names so globally
	// replace those in the shader code
	function replaceTHREEShaderAttributes( shaderText, technique ) {

		// Expected technique attributes
		var attributes = {};

		for ( var attributeId in technique.attributes ) {

			var pname = technique.attributes[ attributeId ];

			var param = technique.parameters[ pname ];
			var atype = param.type;
			var semantic = param.semantic;

			attributes[ attributeId ] = {
				type: atype,
				semantic: semantic
			};

		}

		// Figure out which attributes to change in technique

		var shaderParams = technique.parameters;
		var shaderAttributes = technique.attributes;
		var params = {};

		for ( var attributeId in attributes ) {

			var pname = shaderAttributes[ attributeId ];
			var shaderParam = shaderParams[ pname ];
			var semantic = shaderParam.semantic;
			if ( semantic ) {

				params[ attributeId ] = shaderParam;

			}

		}

		for ( var pname in params ) {

			var param = params[ pname ];
			var semantic = param.semantic;

			var regEx = new RegExp( "\\b" + pname + "\\b", "g" );

			switch ( semantic ) {

				case "POSITION":

					shaderText = shaderText.replace( regEx, 'position' );
					break;

				case "NORMAL":

					shaderText = shaderText.replace( regEx, 'normal' );
					break;

				case 'TEXCOORD_0':
				case 'TEXCOORD0':
				case 'TEXCOORD':

					shaderText = shaderText.replace( regEx, 'uv' );
					break;

				case "WEIGHT":

					shaderText = shaderText.replace( regEx, 'skinWeight' );
					break;

				case "JOINT":

					shaderText = shaderText.replace( regEx, 'skinIndex' );
					break;

			}

		}

		return shaderText;

	}

	// Deferred constructor for RawShaderMaterial types
	function DeferredShaderMaterial( params ) {

		this.isDeferredShaderMaterial = true;

		this.params = params;

	}

	DeferredShaderMaterial.prototype.create = function () {

		var uniforms = THREE.UniformsUtils.clone( this.params.uniforms );

		for ( var uniformId in this.params.uniforms ) {

			var originalUniform = this.params.uniforms[ uniformId ];

			if ( originalUniform.value instanceof THREE.Texture ) {

				uniforms[ uniformId ].value = originalUniform.value;
				uniforms[ uniformId ].value.needsUpdate = true;

			}

			uniforms[ uniformId ].semantic = originalUniform.semantic;
			uniforms[ uniformId ].node = originalUniform.node;

		}

		this.params.uniforms = uniforms;

		return new THREE.RawShaderMaterial( this.params );

	};

	/* GLTF PARSER */

	function GLTFParser( json, options ) {

		this.json = json || {};
		this.options = options || {};

		// loader object cache
		this.cache = new GLTFRegistry();

	}

	GLTFParser.prototype._withDependencies = function ( dependencies ) {

		var _dependencies = {};

		for ( var i = 0; i < dependencies.length; i ++ ) {

			var dependency = dependencies[ i ];
			var fnName = "load" + dependency.charAt( 0 ).toUpperCase() + dependency.slice( 1 );

			var cached = this.cache.get( dependency );

			if ( cached !== undefined ) {

				_dependencies[ dependency ] = cached;

			} else if ( this[ fnName ] ) {

				var fn = this[ fnName ]();
				this.cache.add( dependency, fn );

				_dependencies[ dependency ] = fn;

			}

		}

		return _each( _dependencies, function ( dependency ) {

			return dependency;

		} );

	};

	GLTFParser.prototype.parse = function ( callback ) {

		var json = this.json;

		// Clear the loader cache
		this.cache.removeAll();

		// Fire the callback on complete
		this._withDependencies( [

			"scenes",
			"cameras",
			"animations"

		] ).then( function ( dependencies ) {

			var scene = dependencies.scenes[ json.scene ];

			var scenes = [];

			for ( var name in dependencies.scenes ) {

				scenes.push( dependencies.scenes[ name ] );

			}

			var cameras = [];

			for ( var name in dependencies.cameras ) {

				var camera = dependencies.cameras[ name ];
				cameras.push( camera );

			}

			var animations = [];

			for ( var name in dependencies.animations ) {

				animations.push( dependencies.animations[ name ] );

			}

			callback( scene, scenes, cameras, animations );

		} );

	};

	GLTFParser.prototype.loadShaders = function () {

		var json = this.json;
		var options = this.options;

		return _each( json.shaders, function ( shader ) {

			return new Promise( function ( resolve ) {

				var loader = new THREE.FileLoader();
				loader.responseType = 'text';
				loader.load( resolveURL( shader.uri, options.path ), function ( shaderText ) {

					resolve( shaderText );

				} );

			} );

		} );

	};

	GLTFParser.prototype.loadBuffers = function () {

		var json = this.json;
		var options = this.options;

		return _each( json.buffers, function ( buffer ) {

			if ( buffer.type === 'arraybuffer' ) {

				return new Promise( function ( resolve ) {

					var loader = new THREE.FileLoader();
					loader.responseType = 'arraybuffer';
					loader.load( resolveURL( buffer.uri, options.path ), function ( buffer ) {

						resolve( buffer );

					} );

				} );

			}

		} );

	};

	GLTFParser.prototype.loadBufferViews = function () {

		var json = this.json;

		return this._withDependencies( [

			"buffers"

		] ).then( function ( dependencies ) {

			return _each( json.bufferViews, function ( bufferView ) {

				var arraybuffer = dependencies.buffers[ bufferView.buffer ];

				return arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength );

			} );

		} );

	};

	GLTFParser.prototype.loadAccessors = function () {

		var json = this.json;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.accessors, function ( accessor ) {

				var arraybuffer = dependencies.bufferViews[ accessor.bufferView ];
				var itemSize = WEBGL_TYPE_SIZES[ accessor.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessor.componentType ];

				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( accessor.byteStride && accessor.byteStride !== itemBytes ) {

					// Use the full buffer if it's interleaved.
					var array = new TypedArray( arraybuffer );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					var ib = new THREE.InterleavedBuffer( array, accessor.byteStride / elementBytes );

					return new THREE.InterleavedBufferAttribute( ib, itemSize, accessor.byteOffset / elementBytes );

				} else {

					array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

					return new THREE.BufferAttribute( array, itemSize );

				}

			} );

		} );

	};

	GLTFParser.prototype.loadTextures = function () {

		var json = this.json;
		var options = this.options;

		return _each( json.textures, function ( texture ) {

			if ( texture.source ) {

				return new Promise( function ( resolve ) {

					var source = json.images[ texture.source ];

					var textureLoader = THREE.Loader.Handlers.get( source.uri );

					if ( textureLoader === null ) {

						textureLoader = new THREE.TextureLoader();

					}

					textureLoader.setCrossOrigin( options.crossOrigin );

					textureLoader.load( resolveURL( source.uri, options.path ), function ( _texture ) {

						_texture.flipY = false;

						if ( texture.sampler ) {

							var sampler = json.samplers[ texture.sampler ];

							_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ];
							_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ];
							_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ];
							_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ];

						}

						resolve( _texture );

					}, undefined, function () {

						resolve();

					} );

				} );

			}

		} );

	};

	GLTFParser.prototype.loadMaterials = function () {

		var json = this.json;

		return this._withDependencies( [

			"shaders",
			"textures"

		] ).then( function ( dependencies ) {

			return _each( json.materials, function ( material ) {

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

					switch ( khr_material.technique ) {

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

					Object.assign( materialValues, khr_material.values );

					if ( khr_material.doubleSided || materialValues.doubleSided ) {

						materialParams.side = THREE.DoubleSide;

					}

					if ( khr_material.transparent || materialValues.transparent ) {

						materialParams.transparent = true;
						materialParams.opacity = ( materialValues.transparency !== undefined ) ? materialValues.transparency : 1;

					}

				} else if ( material.technique === undefined ) {

					materialType = THREE.MeshPhongMaterial;

					Object.assign( materialValues, material.values );

				} else {

					materialType = DeferredShaderMaterial;

					var technique = json.techniques[ material.technique ];

					materialParams.uniforms = {};

					var program = json.programs[ technique.program ];

					if ( program ) {

						materialParams.fragmentShader = dependencies.shaders[ program.fragmentShader ];

						if ( ! materialParams.fragmentShader ) {

							console.warn( "ERROR: Missing fragment shader definition:", program.fragmentShader );
							materialType = THREE.MeshPhongMaterial;

						}

						var vertexShader = dependencies.shaders[ program.vertexShader ];

						if ( ! vertexShader ) {

							console.warn( "ERROR: Missing vertex shader definition:", program.vertexShader );
							materialType = THREE.MeshPhongMaterial;

						}

						// IMPORTANT: FIX VERTEX SHADER ATTRIBUTE DEFINITIONS
						materialParams.vertexShader = replaceTHREEShaderAttributes( vertexShader, technique );

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
								var unode = shaderParam.node;

								switch ( ptype ) {

									case WEBGL_CONSTANTS.FLOAT:

										uvalue = shaderParam.value;

										if ( pname == "transparency" ) {

											materialParams.transparent = true;

										}

										if ( value !== undefined ) {

											uvalue = value;

										}

										break;

									case WEBGL_CONSTANTS.FLOAT_VEC2:
									case WEBGL_CONSTANTS.FLOAT_VEC3:
									case WEBGL_CONSTANTS.FLOAT_VEC4:
									case WEBGL_CONSTANTS.FLOAT_MAT3:

										if ( shaderParam && shaderParam.value ) {

											uvalue.fromArray( shaderParam.value );

										}

										if ( value ) {

											uvalue.fromArray( value );

										}

										break;

									case WEBGL_CONSTANTS.FLOAT_MAT2:

										// what to do?
										console.warn( "FLOAT_MAT2 is not a supported uniform type" );
										break;

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

										uvalue = value ? dependencies.textures[ value ] : null;

										break;

								}

								materialParams.uniforms[ uniformId ] = {
									value: uvalue,
									semantic: usemantic,
									node: unode
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

					materialParams.map = dependencies.textures[ materialValues.diffuse ];

				}

				delete materialParams.diffuse;

				if ( typeof( materialValues.reflective ) === 'string' ) {

					materialParams.envMap = dependencies.textures[ materialValues.reflective ];

				}

				if ( typeof( materialValues.bump ) === 'string' ) {

					materialParams.bumpMap = dependencies.textures[ materialValues.bump ];

				}

				if ( Array.isArray( materialValues.emission ) ) {

					if ( materialType === THREE.MeshBasicMaterial ) {

						materialParams.color = new THREE.Color().fromArray( materialValues.emission );

					} else {

						materialParams.emissive = new THREE.Color().fromArray( materialValues.emission );

					}

				} else if ( typeof( materialValues.emission ) === 'string' ) {

					if ( materialType === THREE.MeshBasicMaterial ) {

						materialParams.map = dependencies.textures[ materialValues.emission ];

					} else {

						materialParams.emissiveMap = dependencies.textures[ materialValues.emission ];

					}

				}

				if ( Array.isArray( materialValues.specular ) ) {

					materialParams.specular = new THREE.Color().fromArray( materialValues.specular );

				} else if ( typeof( materialValues.specular ) === 'string' ) {

					materialParams.specularMap = dependencies.textures[ materialValues.specular ];

				}

				if ( materialValues.shininess !== undefined ) {

					materialParams.shininess = materialValues.shininess;

				}

				var _material = new materialType( materialParams );
				_material.name = material.name;

				return _material;

			} );

		} );

	};

	GLTFParser.prototype.loadMeshes = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors",
			"materials"

		] ).then( function ( dependencies ) {

			return _each( json.meshes, function ( mesh ) {

				var group = new THREE.Object3D();
				group.name = mesh.name;

				if ( mesh.extras ) group.userData = mesh.extras;

				var primitives = mesh.primitives;

				for ( var name in primitives ) {

					var primitive = primitives[ name ];

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {

						var geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( ! attributeEntry ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':
									geometry.addAttribute( 'position', bufferAttribute );
									break;

								case 'NORMAL':
									geometry.addAttribute( 'normal', bufferAttribute );
									break;

								case 'TEXCOORD_0':
								case 'TEXCOORD0':
								case 'TEXCOORD':
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

						if ( primitive.indices ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

						}

						var material = dependencies.materials[ primitive.material ];

						var meshNode = new THREE.Mesh( geometry, material );
						meshNode.castShadow = true;

						if ( primitive.extras ) meshNode.userData = primitive.extras;

						group.add( meshNode );

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

						var geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						_each( attributes, function ( attributeEntry, attributeId ) {

							if ( ! attributeEntry ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':
									geometry.addAttribute( 'position', bufferAttribute );
									break;

								case 'COLOR':
									geometry.addAttribute( 'color', bufferAttribute );
									break;

							}

						} );

						var material = dependencies.materials[ primitive.material ];

						var meshNode;

						if ( primitive.indices ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

							meshNode = new THREE.LineSegments( geometry, material );

						} else {

							meshNode = new THREE.Line( geometry, material );

						}

						if ( primitive.extras ) meshNode.userData = primitive.extras;

						group.add( meshNode );

					} else {

						console.warn( "Only triangular and line primitives are supported" );

					}

				}

				return group;

			} );

		} );

	};

	GLTFParser.prototype.loadCameras = function () {

		var json = this.json;

		return _each( json.cameras, function ( camera ) {

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

				var _camera = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspect_ratio, camera.perspective.znear || 1, camera.perspective.zfar || 2e6 );
				_camera.name = camera.name;

				if ( camera.extras ) _camera.userData = camera.extras;

				return _camera;

			} else if ( camera.type == "orthographic" && camera.orthographic ) {

				var _camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
				_camera.name = camera.name;

				if ( camera.extras ) _camera.userData = camera.extras;

				return _camera;

			}

		} );

	};

	GLTFParser.prototype.loadSkins = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors"

		] ).then( function ( dependencies ) {

			return _each( json.skins, function ( skin ) {

				var _skin = {
					bindShapeMatrix: new THREE.Matrix4().fromArray( skin.bindShapeMatrix ),
					jointNames: skin.jointNames,
					inverseBindMatrices: dependencies.accessors[ skin.inverseBindMatrices ]
				};

				return _skin;

			} );

		} );

	};

	GLTFParser.prototype.loadAnimations = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors",
			"nodes"

		] ).then( function ( dependencies ) {

			return _each( json.animations, function ( animation, animationId ) {

				var tracks = [];

				for ( var channelId in animation.channels ) {

					var channel = animation.channels[ channelId ];
					var sampler = animation.samplers[ channel.sampler ];

					if ( sampler && animation.parameters ) {

						var target = channel.target;
						var name = target.id;
						var input = animation.parameters[ sampler.input ];
						var output = animation.parameters[ sampler.output ];

						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];

						var node = dependencies.nodes[ name ];

						if ( node ) {

							node.updateMatrix();
							node.matrixAutoUpdate = true;

							var TypedKeyframeTrack = PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.rotation
								? THREE.QuaternionKeyframeTrack
								: THREE.VectorKeyframeTrack;

							// KeyframeTrack.optimize() will modify given 'times' and 'values'
							// buffers before creating a truncated copy to keep. Because buffers may
							// be reused by other tracks, make copies here.
							tracks.push( new TypedKeyframeTrack(
								node.name + '.' + PATH_PROPERTIES[ target.path ],
								THREE.AnimationUtils.arraySlice( inputAccessor.array, 0 ),
								THREE.AnimationUtils.arraySlice( outputAccessor.array, 0 ),
								INTERPOLATION[ sampler.interpolation ]
							) );

						}

					}

				}

				return new THREE.AnimationClip( "animation_" + animationId, undefined, tracks );

			} );

		} );

	};

	GLTFParser.prototype.loadNodes = function () {

		var json = this.json;
		var scope = this;

		return _each( json.nodes, function ( node ) {

			var matrix = new THREE.Matrix4();

			var _node;

			if ( node.jointName ) {

				_node = new THREE.Bone();
				_node.jointName = node.jointName;

			} else {

				_node = new THREE.Object3D();

			}

			_node.name = node.name;

			if ( node.extras ) _node.userData = node.extras;

			_node.matrixAutoUpdate = false;

			if ( node.matrix !== undefined ) {

				matrix.fromArray( node.matrix );
				_node.applyMatrix( matrix );

			} else {

				if ( node.translation !== undefined ) {

					_node.position.fromArray( node.translation );

				}

				if ( node.rotation !== undefined ) {

					_node.quaternion.fromArray( node.rotation );

				}

				if ( node.scale !== undefined ) {

					_node.scale.fromArray( node.scale );

				}

			}

			return _node;

		} ).then( function ( __nodes ) {

			return scope._withDependencies( [

				"meshes",
				"skins",
				"cameras",
				"extensions"

			] ).then( function ( dependencies ) {

				return _each( __nodes, function ( _node, nodeId ) {

					var node = json.nodes[ nodeId ];

					if ( node.meshes !== undefined ) {

						for ( var meshId in node.meshes ) {

							var mesh = node.meshes[ meshId ];
							var group = dependencies.meshes[ mesh ];

							if ( group === undefined ) {

								console.warn( 'GLTFLoader: Couldn\'t find node "' + mesh + '".' );
								continue;

							}

							for ( var childrenId in group.children ) {

								var child = group.children[ childrenId ];

								// clone Mesh to add to _node

								var originalMaterial = child.material;
								var originalGeometry = child.geometry;
								var originalUserData = child.userData;

								var material;

								if ( originalMaterial.isDeferredShaderMaterial ) {

									originalMaterial = material = originalMaterial.create();

								} else {

									material = originalMaterial;

								}

								switch ( child.type ) {

									case 'LineSegments':
										child = new THREE.LineSegments( originalGeometry, material );
										break;

									case 'Line':
										child = new THREE.Line( originalGeometry, material );
										break;

									default:
										child = new THREE.Mesh( originalGeometry, material );

								}

								child.castShadow = true;
								child.userData = originalUserData;

								var skinEntry;

								if ( node.skin ) {

									skinEntry = dependencies.skins[ node.skin ];

								}

								// Replace Mesh with SkinnedMesh in library
								if ( skinEntry ) {

									var geometry = originalGeometry;
									var material = originalMaterial;
									material.skinning = true;

									child = new THREE.SkinnedMesh( geometry, material, false );
									child.castShadow = true;
									child.userData = originalUserData;

									var bones = [];
									var boneInverses = [];

									var keys = Object.keys( __nodes );

									for ( var i = 0, l = skinEntry.jointNames.length; i < l; i ++ ) {

										var jointId = skinEntry.jointNames[ i ];

										var jointNode;

										for ( var j = 0, jl = keys.length; j < jl; j ++ ) {

											var n = __nodes[ keys[ j ] ];

											if ( n.jointName === jointId ) {

												jointNode = n;
												break;

											}

										}

										if ( jointNode ) {

											jointNode.skin = child;
											bones.push( jointNode );

											var m = skinEntry.inverseBindMatrices.array;
											var mat = new THREE.Matrix4().fromArray( m, i * 16 );
											boneInverses.push( mat );

										} else {

											console.warn( "WARNING: joint: ''" + jointId + "' could not be found" );

										}

									}

									child.bind( new THREE.Skeleton( bones, boneInverses, false ), skinEntry.bindShapeMatrix );

								}

								_node.add( child );

							}

						}

					}

					if ( node.camera !== undefined ) {

						var camera = dependencies.cameras[ node.camera ];

						_node.add( camera );

					}

					if ( node.extensions && node.extensions.KHR_materials_common && node.extensions.KHR_materials_common.light ) {

						var light = dependencies.extensions.KHR_materials_common.lights[ node.extensions.KHR_materials_common.light ];

						_node.add( light );

					}

					return _node;

				} );

			} );

		} );

	};

	GLTFParser.prototype.loadExtensions = function () {

		var json = this.json;

		return _each( json.extensions, function ( extension, extensionId ) {

			switch ( extensionId ) {

				case "KHR_materials_common":

					var extensionNode = {
						lights: {}
					};

					var lights = extension.lights;

					for ( var lightId in lights ) {

						var light = lights[ lightId ];
						var lightNode;

						var lightParams = light[ light.type ];
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

							extensionNode.lights[ lightId ] = lightNode;

						}

					}

					return extensionNode;

					break;

			}

		} );

	};

	GLTFParser.prototype.loadScenes = function () {

		var json = this.json;

		// scene node hierachy builder

		function buildNodeHierachy( nodeId, parentObject, allNodes ) {

			var _node = allNodes[ nodeId ];
			parentObject.add( _node );

			var node = json.nodes[ nodeId ];

			if ( node.children ) {

				var children = node.children;

				for ( var i = 0, l = children.length; i < l; i ++ ) {

					var child = children[ i ];
					buildNodeHierachy( child, _node, allNodes );

				}

			}

		}

		return this._withDependencies( [

			"nodes"

		] ).then( function ( dependencies ) {

			return _each( json.scenes, function ( scene ) {

				var _scene = new THREE.Scene();
				_scene.name = scene.name;

				if ( scene.extras ) _scene.userData = scene.extras;

				var nodes = scene.nodes;

				for ( var i = 0, l = nodes.length; i < l; i ++ ) {

					var nodeId = nodes[ i ];
					buildNodeHierachy( nodeId, _scene, dependencies.nodes );

				}

				_scene.traverse( function ( child ) {

					// Register raw material meshes with GLTFLoader.Shaders
					if ( child.material && child.material.isRawShaderMaterial ) {

						var xshader = new GLTFShader( child, dependencies.nodes );
						GLTFLoader.Shaders.add( child.uuid, xshader );

					}

				} );

				return _scene;

			} );

		} );

	};

	return GLTFLoader;

} )();
