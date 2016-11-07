/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 */

(function() {

THREE.GLTFLoader = function( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	this.parser = GLTFParser;

};

THREE.GLTFLoader.prototype = {

	constructor: THREE.GLTFLoader,

	load: function( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = this.path && ( typeof this.path === "string" ) ? this.path : THREE.Loader.prototype.extractUrlBase( url );

		var loader = new THREE.FileLoader( scope.manager );
		loader.load( url, function( text ) {

			scope.parse( JSON.parse( text ), onLoad, path );

		}, onProgress, onError );

	},

	setCrossOrigin: function( value ) {

		this.crossOrigin = value;

	},

	setPath: function( value ) {

		this.path = value;

	},

	parse: function( json, callback, path ) {

		console.time( 'GLTFLoader' );

		var glTFParser = new this.parser( json, {
			path: path || this.path,
			crossOrigin: !!this.crossOrigin
		});

		glTFParser.parse( function( scene, cameras, animations ) {

			console.timeEnd( 'GLTFLoader' );

			var glTF = {
				"scene": scene,
				"cameras": cameras,
				"animations": animations
			};

			callback( glTF );

		});

		// Developers should use `callback` argument for async notification on
		// completion to prevent side effects.
		// Function return is kept only for backward-compatability purposes.
		return {
			get scene() {

				console.warn( "Synchronous glTF object access is deprecated." +
					" Use the asynchronous 'callback' argument instead." );
				return scene;

			},
			set scene( value ) {

				console.warn( "Synchronous glTF object access is deprecated." +
					" Use the asynchronous 'callback' argument instead." );
				scene = value;

			}

		};

	}

};

/* GLTFREGISTRY */

var GLTFRegistry = function() {

	var objects = {};

	return	{
		get : function( key ) {

			return objects[ key ];

		},

		add : function( key, object ) {

			objects[ key ] = object;

		},

		remove: function( key ) {

			delete objects[ key ];

		},

		removeAll: function() {

			objects = {};

		},

		update : function( scene, camera ) {

			_each( objects, function( object ) {

				if ( object.update ) {

					object.update( scene, camera );

				}

			});

		}
	};
};

/* GLTFSHADERS */

THREE.GLTFLoader.Shaders = new GLTFRegistry();

/* GLTFSHADER */

var GLTFShader = function( targetNode, allNodes ) {

	this.boundUniforms = {};

	// bind each uniform to its source node
	_each(targetNode.material.uniforms, function(uniform, uniformId) {

		if (uniform.semantic) {

			var sourceNodeRef = uniform.node;

			var sourceNode = targetNode;
			if ( sourceNodeRef ) {
				sourceNode = allNodes[ sourceNodeRef ];
			}

			this.boundUniforms[ uniformId ] = {
				semantic: uniform.semantic,
				sourceNode: sourceNode,
				targetNode: targetNode,
				uniform: uniform
			};

		}

	}.bind( this ));

	this._m4 = new THREE.Matrix4();

}

// Update - update all the uniform values
GLTFShader.prototype.update = function( scene, camera ) {

	// update scene graph

	scene.updateMatrixWorld();

	// update camera matrices and frustum

	camera.updateMatrixWorld();
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	_each( this.boundUniforms, function( boundUniform ) {

		switch (boundUniform.semantic) {

			case "MODELVIEW":

				var m4 = boundUniform.uniform.value;
				m4.multiplyMatrices(camera.matrixWorldInverse,
				boundUniform.sourceNode.matrixWorld);
				break;

			case "MODELVIEWINVERSETRANSPOSE":

				var m3 = boundUniform.uniform.value;
				this._m4.multiplyMatrices(camera.matrixWorldInverse,
				boundUniform.sourceNode.matrixWorld);
				m3.getNormalMatrix(this._m4);
				break;

			case "PROJECTION":

				var m4 = boundUniform.uniform.value;
				m4.copy(camera.projectionMatrix);
				break;

			case "JOINTMATRIX":

				var m4v = boundUniform.uniform.value;
				for (var mi = 0; mi < m4v.length; mi++) {
					// So it goes like this:
					// SkinnedMesh world matrix is already baked into MODELVIEW;
					// ransform joints to local space,
					// then transform using joint's inverse
					m4v[mi]
						.getInverse(boundUniform.sourceNode.matrixWorld)
						.multiply(boundUniform.targetNode.skeleton.bones[ mi ].matrixWorld)
						.multiply(boundUniform.targetNode.skeleton.boneInverses[mi]);
				}
				break;

			default :

				console.warn("Unhandled shader semantic: " + boundUniform.semantic);
				break;

		}

	}.bind( this ));

};


/* GLTFANIMATION */

THREE.GLTFLoader.Animations = new GLTFRegistry();

// Construction/initialization
var GLTFAnimation = function( interps ) {

	this.running = false;
	this.loop = false;
	this.duration = 0;
	this.startTime = 0;
	this.interps = [];

	this.uuid = THREE.Math.generateUUID();

	if ( interps ) {

		this.createInterpolators( interps );

	}

};

GLTFAnimation.prototype.createInterpolators = function( interps ) {

	for ( var i = 0, len = interps.length; i < len; i ++ ) {

		var interp = new GLTFInterpolator( interps[ i ] );
		this.interps.push( interp );
		this.duration = Math.max( this.duration, interp.duration );

	}

}

// Start/stop
GLTFAnimation.prototype.play = function() {

	if ( this.running )
		return;

	this.startTime = Date.now();
	this.running = true;
	THREE.GLTFLoader.Animations.add( this.uuid, this );

};

GLTFAnimation.prototype.stop = function() {

	this.running = false;
	THREE.GLTFLoader.Animations.remove( this.uuid );

};

// Update - drive key frame evaluation
GLTFAnimation.prototype.update = function() {

	if ( !this.running )
		return;

	var now = Date.now();
	var deltat = ( now - this.startTime ) / 1000;
	var t = deltat % this.duration;
	var nCycles = Math.floor( deltat / this.duration );

	if ( nCycles >= 1 && ! this.loop ) {

		this.running = false;
		_each( this.interps, function( _, i ) {

			this.interps[ i ].interp( this.duration );

		}.bind( this ));
		this.stop();
		return;

	} else {

		_each( this.interps, function( _, i ) {

			this.interps[ i ].interp( t );

		}.bind( this ));

	}

};

/* GLTFINTERPOLATOR */

var GLTFInterpolator = function( param ) {

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
GLTFInterpolator.prototype.interp = function( t ) {

	if ( t == this.keys[ 0 ] ) {

		if ( this.isRot ) {

			this.quat3.fromArray( this.values );

		} else {

			this.vec3.fromArray( this.values );

		}

	} else if ( t < this.keys[ 0 ] ) {

		if ( this.isRot ) {

			this.quat1.copy( this.originalValue );
			this.quat2.fromArray( this.values );
			THREE.Quaternion.slerp( this.quat1, this.quat2, this.quat3, t / this.keys[ 0 ] );

		} else {

			this.vec3.copy( this.originalValue );
			this.vec2.fromArray( this.values );
			this.vec3.lerp( this.vec2, t / this.keys[ 0 ] );

		}

	} else if ( t >= this.keys[ this.count - 1 ] ) {

		if ( this.isRot ) {

			this.quat3.fromArray( this.values, ( this.count - 1 ) * 4 );

		} else {

			this.vec3.fromArray( this.values, ( this.count - 1 ) * 3 );

		}

	} else {

		for ( var i = 0; i < this.count - 1; i ++ ) {

			var key1 = this.keys[ i ];
			var key2 = this.keys[ i + 1 ];

			if ( t >= key1 && t <= key2 ) {

				if ( this.isRot ) {

					this.quat1.fromArray( this.values, i * 4 );
					this.quat2.fromArray( this.values, ( i + 1 ) * 4 );
					THREE.Quaternion.slerp( this.quat1, this.quat2, this.quat3, ( t - key1 ) / ( key2 - key1 ) );

				} else {

					this.vec3.fromArray( this.values, i * 3 );
					this.vec2.fromArray( this.values, ( i + 1 ) * 3 );
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

/* UTILITY FUNCTIONS */

var _each = function( object, callback, thisObj ) {

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

};

var resolveURL = function( url, path ) {

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
	return (path || '') + url;

};

// Three.js seems too dependent on attribute names so globally
// replace those in the shader code
var replaceTHREEShaderAttributes = function( shaderText, technique ) {

	// Expected technique attributes
	var attributes = {};

	_each( technique.attributes, function( pname, attributeId ) {

		var param = technique.parameters[ pname ];
		var atype = param.type;
		var semantic = param.semantic;

		attributes[ attributeId ] = {
			type : atype,
			semantic : semantic
		};

	});

	// Figure out which attributes to change in technique

	var shaderParams = technique.parameters;
	var shaderAttributes = technique.attributes;
	var params = {};

	_each( attributes, function( _, attributeId ) {

		var pname = shaderAttributes[ attributeId ];
		var shaderParam = shaderParams[ pname ];
		var semantic = shaderParam.semantic;
		if ( semantic ) {

			params[ attributeId ] = shaderParam;

		}

	});

	_each( params, function( param, pname ) {

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

				shaderText = shaderText.replace(regEx, 'skinWeight');
				break;

			case "JOINT":

				shaderText = shaderText.replace(regEx, 'skinIndex');
				break;

		}

	});

	return shaderText;

};

// Deferred constructor for RawShaderMaterial types
var DeferredShaderMaterial = function( params ) {

	this.isDeferredShaderMaterial = true;

	this.params = params;

};

DeferredShaderMaterial.prototype.create = function() {

	var uniforms = THREE.UniformsUtils.clone( this.params.uniforms );

	_each( this.params.uniforms, function( originalUniform, uniformId ) {

		if ( originalUniform.value instanceof THREE.Texture ) {

			uniforms[ uniformId ].value = originalUniform.value;
			uniforms[ uniformId ].value.needsUpdate = true;

		}

		uniforms[ uniformId ].semantic = originalUniform.semantic;
		uniforms[ uniformId ].node = originalUniform.node;

	});

	this.params.uniforms = uniforms;

	return new THREE.RawShaderMaterial( this.params );

};

/* GLTF PARSER */

var GLTFParser = function(json, options) {

	this.json = json || {};
	this.options = options || {};

	// loader object cache
	this.cache = new GLTFRegistry();

};

GLTFParser.prototype._withDependencies = function( dependencies ) {

	var _dependencies = {};

	for ( var i = 0; i < dependencies.length; i ++ ) {

		var dependency = dependencies[ i ];
		var fnName = "load" + dependency.charAt(0).toUpperCase() + dependency.slice(1);

		var cached = this.cache.get( dependency );

		if ( cached !== undefined ) {

			_dependencies[ dependency ] = cached;

		} else if ( this[ fnName ] ) {

			var fn = this[ fnName ]();
			this.cache.add( dependency, fn );

			_dependencies[ dependency ] = fn;

		}

	}

	return _each( _dependencies, function( dependency, dependencyId ) {

		return dependency;

	});

};

GLTFParser.prototype.parse = function( callback ) {

	// Clear the loader cache
	this.cache.removeAll();

	// Fire the callback on complete
	this._withDependencies([
		"scenes",
		"cameras",
		"animations"
	]).then(function( dependencies ) {

		var scene = dependencies.scenes[ this.json.scene ];

		var cameras = [];
		_each( dependencies.cameras, function( camera ) {

			cameras.push( camera );

		});

		var animations = [];
		_each( dependencies.animations, function( animation ) {

			animations.push( animation );

		});

		callback( scene, cameras, animations );

	}.bind( this ));

};

GLTFParser.prototype.loadShaders = function() {

	return _each( this.json.shaders, function( shader, shaderId ) {

		return new Promise( function( resolve ) {

			var loader = new THREE.FileLoader();
			loader.responseType = 'text';
			loader.load( resolveURL( shader.uri, this.options.path ), function( shaderText ) {

				resolve( shaderText );

			});

		}.bind( this ));

	}.bind( this ));

};

GLTFParser.prototype.loadBuffers = function() {

	return _each( this.json.buffers, function( buffer, bufferId ) {

		if ( buffer.type === 'arraybuffer' ) {

			return new Promise( function( resolve ) {

				var loader = new THREE.FileLoader();
				loader.responseType = 'arraybuffer';
				loader.load( resolveURL( buffer.uri, this.options.path ), function( buffer ) {

					resolve( buffer );

				} );

			}.bind( this ));

		}

	}.bind( this ));

};

GLTFParser.prototype.loadBufferViews = function() {

	return this._withDependencies([
		"buffers"
	]).then( function( dependencies ) {

		return _each( this.json.bufferViews, function( bufferView, bufferViewId ) {

			var arraybuffer = dependencies.buffers[ bufferView.buffer ];

			return arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength );

		});

	}.bind( this ));

};

GLTFParser.prototype.loadAccessors = function() {

	return this._withDependencies([
		"bufferViews"
	]).then( function( dependencies ) {

		return _each( this.json.accessors, function( accessor, accessorId ) {

			var arraybuffer = dependencies.bufferViews[ accessor.bufferView ];
			var itemSize = WEBGL_TYPE_SIZES[ accessor.type ];
			var TypedArray = WEBGL_COMPONENT_TYPES[ accessor.componentType ];

			var array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

			return new THREE.BufferAttribute( array, itemSize );

		});

	}.bind( this ));

};

GLTFParser.prototype.loadTextures = function() {

	return _each( this.json.textures, function( texture, textureId ) {

		if ( texture.source ) {

			return new Promise( function( resolve ) {

				var source = this.json.images[ texture.source ];

				var textureLoader = THREE.Loader.Handlers.get( source.uri );
				if ( textureLoader === null ) {

					textureLoader = new THREE.TextureLoader();

				}
				textureLoader.crossOrigin = this.options.crossOrigin || false;

				textureLoader.load( resolveURL( source.uri, this.options.path ), function( _texture ) {

					_texture.flipY = false;

					if ( texture.sampler ) {

						var sampler = this.json.samplers[ texture.sampler ];

						_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ];
						_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ];
						_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ];
						_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ];

					}

					resolve( _texture );

				}.bind( this ));

			}.bind( this ));

		}

	}.bind( this ));

};

GLTFParser.prototype.loadMaterials = function() {

	return this._withDependencies([
		"shaders",
		"textures"
	]).then( function( dependencies ) {

		return _each( this.json.materials, function( material, materialId ) {

			var materialType;
			var materialValues = {};
			var materialParams = {};

			var khr_material;

			if ( material.extensions && material.extensions.KHR_materials_common ) {

				khr_material = material.extensions.KHR_materials_common;

			} else if ( this.json.extensions && this.json.extensions.KHR_materials_common ) {

				khr_material = this.json.extensions.KHR_materials_common;

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

				_each( khr_material.values, function( value, prop ) {

					materialValues[ prop ] = value;

				});

				if ( khr_material.doubleSided || materialValues.doubleSided ) {

					materialParams.side = THREE.DoubleSide;

				}

				if ( khr_material.transparent || materialValues.transparent ) {

					materialParams.transparent = true;
					materialParams.opacity = ( materialValues.transparency !== undefined ) ? materialValues.transparency : 1;

				}

			} else if ( material.technique === undefined ) {

				materialType = THREE.MeshPhongMaterial;

				_each( material.values, function( value, prop ) {

					materialValues[ prop ] = value;

				});

			} else {

				materialType = DeferredShaderMaterial;

				var technique = this.json.techniques[ material.technique ];

				materialParams.uniforms = {};

				var program = this.json.programs[ technique.program ];

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

					_each( uniforms, function( pname, uniformId ) {

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
									console.warn("FLOAT_MAT2 is not a supported uniform type");
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

					});

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

				materialParams.emissive = new THREE.Color().fromArray( materialValues.emission );

			}

			if ( Array.isArray( materialValues.specular ) ) {

				materialParams.specular = new THREE.Color().fromArray( materialValues.specular );

			}

			if ( materialValues.shininess !== undefined ) {

				materialParams.shininess = materialValues.shininess;

			}

			var _material = new materialType( materialParams );
			_material.name = material.name;

			return _material;

		}.bind( this ));

	}.bind( this ));

};

GLTFParser.prototype.loadMeshes = function() {

	return this._withDependencies([
		"accessors",
		"materials"
	]).then( function( dependencies ) {

		return _each( this.json.meshes, function( mesh, meshId ) {

			var group = new THREE.Object3D();
			group.name = mesh.name;

			var primitives = mesh.primitives;

			_each( primitives, function( primitive ) {

				if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {

					var geometry = new THREE.BufferGeometry();

					var attributes = primitive.attributes;

					_each( attributes, function( attributeEntry, attributeId ) {

						if ( !attributeEntry ) {

							return;

						}

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

					});

					if ( primitive.indices ) {

						var indexArray = dependencies.accessors[ primitive.indices ];

						geometry.setIndex( indexArray );

						var offset = {
								start: 0,
								index: 0,
								count: indexArray.count
							};

						geometry.groups.push( offset );

						geometry.computeBoundingSphere();

					}


					var material = dependencies.materials[ primitive.material ];

					var meshNode = new THREE.Mesh( geometry, material );
					meshNode.castShadow = true;

					group.add( meshNode );

				} else {

					console.warn("Non-triangular primitives are not supported");

				}

			});

			return group;

		});

	}.bind( this ));

};

GLTFParser.prototype.loadCameras = function() {

	return _each( this.json.cameras, function( camera, cameraId ) {

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

			return _camera;

		} else if ( camera.type == "orthographic" && camera.orthographic ) {

			var _camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
			_camera.name = camera.name;

			return _camera;

		}

	}.bind( this ));

};

GLTFParser.prototype.loadSkins = function() {

	return this._withDependencies([
		"accessors"
	]).then( function( dependencies ) {

		return _each( this.json.skins, function( skin, skinId ) {

			var _skin = {
				bindShapeMatrix: new THREE.Matrix4().fromArray( skin.bindShapeMatrix ),
				jointNames: skin.jointNames,
				inverseBindMatrices: dependencies.accessors[ skin.inverseBindMatrices ]
			};

			return _skin;

		});

	}.bind( this ));

};

GLTFParser.prototype.loadAnimations = function() {

	return this._withDependencies([
		"accessors",
		"nodes"
	]).then( function( dependencies ) {

		return _each( this.json.animations, function( animation, animationId ) {

			var interps = [];

			_each( animation.channels, function( channel ) {

				var sampler = animation.samplers[ channel.sampler ];

				if (sampler && animation.parameters) {

						var target = channel.target;
						var name = target.id;
						var input = animation.parameters[sampler.input];
						var output = animation.parameters[sampler.output];

						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];

						var node = dependencies.nodes[ name ];

						if ( node ) {

							var interp = {
								keys : inputAccessor.array,
								values : outputAccessor.array,
								count : inputAccessor.count,
								target : node,
								path : target.path,
								type : sampler.interpolation
							};

							interps.push( interp );

						}

				}

			});

			var _animation = new GLTFAnimation(interps);
			_animation.name = "animation_" + animationId;

			return _animation;

		});

	}.bind( this ));

};

GLTFParser.prototype.loadNodes = function() {

	return _each( this.json.nodes, function( node, nodeId ) {

		var matrix = new THREE.Matrix4();

		var _node;

		if ( node.jointName ) {

			_node = new THREE.Bone();
			_node.jointName = node.jointName;

		} else {

			_node = new THREE.Object3D()

		}

		_node.name = node.name;

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

	}.bind( this )).then( function( __nodes ) {

		return this._withDependencies([
			"meshes",
			"skins",
			"cameras",
			"extensions"
		]).then( function( dependencies ) {

			return _each( __nodes, function( _node, nodeId ) {

				var node = this.json.nodes[ nodeId ];

				if ( node.meshes !== undefined ) {

					_each( node.meshes, function( meshId ) {

						var group = dependencies.meshes[ meshId ];

						_each( group.children, function( mesh ) {

							// clone Mesh to add to _node

							var originalMaterial = mesh.material;
							var originalGeometry = mesh.geometry;

							var material;
							if(originalMaterial.isDeferredShaderMaterial) {
								originalMaterial = material = originalMaterial.create();
							} else {
								material = originalMaterial;
							}

							mesh = new THREE.Mesh( originalGeometry, material );
							mesh.castShadow = true;

							var skinEntry;
							if ( node.skin ) {

								skinEntry = dependencies.skins[ node.skin ];

							}

							// Replace Mesh with SkinnedMesh in library
							if (skinEntry) {

								var geometry = originalGeometry;
								var material = originalMaterial;
								material.skinning = true;

								mesh = new THREE.SkinnedMesh( geometry, material, false );
								mesh.castShadow = true;

								var bones = [];
								var boneInverses = [];

								_each( skinEntry.jointNames, function( jointId, i ) {

									var jointNode = __nodes[ jointId ];

									if ( jointNode ) {

										jointNode.skin = mesh;
										bones.push(jointNode);

										var m = skinEntry.inverseBindMatrices.array;
										var mat = new THREE.Matrix4().fromArray( m, i * 16 );
										boneInverses.push(mat);

									} else {
										console.warn( "WARNING: joint: ''" + jointId + "' could not be found" );
									}

								});

								mesh.bind( new THREE.Skeleton( bones, boneInverses, false ), skinEntry.bindShapeMatrix );

							}

							_node.add( mesh );

						});

					});

				}

				if ( node.camera !== undefined ) {

					var camera = dependencies.cameras[ node.camera ];

					_node.add( camera );

				}

				if (node.extensions && node.extensions.KHR_materials_common
						&& node.extensions.KHR_materials_common.light) {

					var light = dependencies.extensions.KHR_materials_common.lights[ node.extensions.KHR_materials_common.light ];

					_node.add(light);

				}

				return _node;

			}.bind( this ));

		}.bind( this ));

	}.bind( this ));

};

GLTFParser.prototype.loadExtensions = function() {

	return _each( this.json.extensions, function( extension, extensionId ) {

		switch ( extensionId ) {

			case "KHR_materials_common":

				var extensionNode = {
					lights: {}
				};

				var lights = extension.lights;

				_each( lights, function( light, lightID ) {

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

						extensionNode.lights[ lightID ] = lightNode;

					}

				});

				return extensionNode;

				break;

		}

	}.bind( this ));

};

GLTFParser.prototype.loadScenes = function() {

	// scene node hierachy builder

	var buildNodeHierachy = function( nodeId, parentObject, allNodes ) {

		var _node = allNodes[ nodeId ];
		parentObject.add( _node );

		var node = this.json.nodes[ nodeId ];

		if ( node.children ) {

			_each( node.children, function( child ) {

				buildNodeHierachy( child, _node, allNodes );

			});

		}

	}.bind( this );

	return this._withDependencies([
		"nodes"
	]).then( function( dependencies ) {

		return _each( this.json.scenes, function( scene, sceneId ) {

			var _scene = new THREE.Scene();
			_scene.name = scene.name;

			_each( scene.nodes, function( nodeId ) {

				buildNodeHierachy( nodeId, _scene, dependencies.nodes );

			});

			_scene.traverse( function( child ) {

				// Register raw material meshes with GLTFLoader.Shaders
				if (child.material && child.material.isRawShaderMaterial) {
					var xshader = new GLTFShader( child, dependencies.nodes );
					THREE.GLTFLoader.Shaders.add( child.uuid, xshader );
				}

			});

			return _scene;

		});

	}.bind( this ));

};

})();
