/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 * @author Takahiro / https://github.com/takahirox
 * @author Don McCurdy / https://www.donmccurdy.com
 */

THREE.GLTF2Loader = ( function () {

	function GLTF2Loader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

	GLTF2Loader.prototype = {

		constructor: GLTF2Loader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = this.path && ( typeof this.path === "string" ) ? this.path : THREE.Loader.prototype.extractUrlBase( url );

			var loader = new THREE.FileLoader( scope.manager );

			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( data ) {

				scope.parse( data, onLoad, path );

			}, onProgress, onError );

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		setPath: function ( value ) {

			this.path = value;

		},

		parse: function ( data, callback, path ) {

			var content;
			var extensions = {};

			var magic = convertUint8ArrayToString( new Uint8Array( data, 0, 4 ) );

			if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

				extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );
				content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

			} else {

				content = convertUint8ArrayToString( new Uint8Array( data ) );

			}

			var json = JSON.parse( content );

			if ( json.extensionsUsed ) {

				if( json.extensionsUsed.indexOf( EXTENSIONS.KHR_LIGHTS ) >= 0 ) {

					extensions[ EXTENSIONS.KHR_LIGHTS ] = new GLTFLightsExtension( json );

				}

				if( json.extensionsUsed.indexOf( EXTENSIONS.KHR_MATERIALS_COMMON ) >= 0 ) {

					extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] = new GLTFMaterialsCommonExtension( json );

				}

				if( json.extensionsUsed.indexOf( EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ) >= 0 ) {

					extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] = new GLTFMaterialsPbrSpecularGlossinessExtension();

				}

				if ( json.extensionsUsed.indexOf( EXTENSIONS.KHR_TECHNIQUE_WEBGL ) >= 0 ) {

					extensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ] = new GLTFTechniqueWebglExtension( json );

				}

			}

			console.time( 'GLTF2Loader' );

			var parser = new GLTFParser( json, extensions, {

				path: path || this.path,
				crossOrigin: this.crossOrigin

			} );

			parser.parse( function ( scene, scenes, cameras, animations ) {

				console.timeEnd( 'GLTF2Loader' );

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

	/*********************************/
	/********** EXTENSIONS ***********/
	/*********************************/

	var EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF',
		KHR_LIGHTS: 'KHR_lights',
		KHR_MATERIALS_COMMON: 'KHR_materials_common',
		KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
		KHR_TECHNIQUE_WEBGL: 'KHR_technique_webgl',
	};

	/**
	 * Lights Extension
	 *
	 * Specification: PENDING
	 */
	function GLTFLightsExtension( json ) {

		this.name = EXTENSIONS.KHR_LIGHTS;

		this.lights = {};

		var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_LIGHTS ] ) || {};
		var lights = extension.lights || {};

		for ( var lightId in lights ) {

			var light = lights[ lightId ];
			var lightNode;

			var color = new THREE.Color().fromArray( light.color );

			switch ( light.type ) {

				case 'directional':
					lightNode = new THREE.DirectionalLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;

				case 'point':
					lightNode = new THREE.PointLight( color );
					break;

				case 'spot':
					lightNode = new THREE.SpotLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;

				case 'ambient':
					lightNode = new THREE.AmbientLight( color );
					break;

			}

			if ( lightNode ) {

				if ( light.constantAttenuation !== undefined ) {

					lightNode.intensity = light.constantAttenuation;

				}

				if ( light.linearAttenuation !== undefined ) {

					lightNode.distance = 1 / light.linearAttenuation;

				}

				if ( light.quadraticAttenuation !== undefined ) {

					lightNode.decay = light.quadraticAttenuation;

				}

				if ( light.fallOffAngle !== undefined ) {

					lightNode.angle = light.fallOffAngle;

				}

				if ( light.fallOffExponent !== undefined ) {

					console.warn( 'GLTF2Loader: light.fallOffExponent not currently supported.' );

				}

				lightNode.name = light.name || ( 'light_' + lightId );
				this.lights[ lightId ] = lightNode;

			}

		}

	}

	/**
	 * Common Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/Khronos/KHR_materials_common
	 */
	function GLTFMaterialsCommonExtension( json ) {

		this.name = EXTENSIONS.KHR_MATERIALS_COMMON;

	}

	GLTFMaterialsCommonExtension.prototype.getMaterialType = function ( material ) {

		var khrMaterial = material.extensions[ this.name ];

		switch ( khrMaterial.type ) {

			case 'commonBlinn' :
			case 'commonPhong' :
				return THREE.MeshPhongMaterial;

			case 'commonLambert' :
				return THREE.MeshLambertMaterial;

			case 'commonConstant' :
			default :
				return THREE.MeshBasicMaterial;

		}

	};

	GLTFMaterialsCommonExtension.prototype.extendParams = function ( materialParams, material, dependencies ) {

		var khrMaterial = material.extensions[ this.name ];

		var keys = [];

		// TODO: Currently ignored: 'ambientFactor', 'ambientTexture'
		switch ( khrMaterial.type ) {

			case 'commonBlinn' :
			case 'commonPhong' :
				keys.push( 'diffuseFactor', 'diffuseTexture', 'specularFactor', 'specularTexture', 'shininessFactor' );
				break;

			case 'commonLambert' :
				keys.push( 'diffuseFactor', 'diffuseTexture' );
				break;

			case 'commonConstant' :
			default :
				break;

		}

		var materialValues = {};

		keys.forEach( function( v ) {

			if ( khrMaterial[ v ] !== undefined ) materialValues[ v ] = khrMaterial[ v ];

		} );

		if ( materialValues.diffuseFactor !== undefined ) {

			materialParams.color = new THREE.Color().fromArray( materialValues.diffuseFactor );
			materialParams.opacity = materialValues.diffuseFactor[ 3 ];

		}

		if ( materialValues.diffuseTexture !== undefined ) {

			materialParams.map = dependencies.textures[ materialValues.diffuseTexture.index ];

		}

		if ( materialValues.specularFactor !== undefined ) {

			materialParams.specular = new THREE.Color().fromArray( materialValues.specularFactor );

		}

		if ( materialValues.specularTexture !== undefined ) {

			materialParams.specularMap = dependencies.textures[ materialValues.specularTexture.index ];

		}

		if ( materialValues.shininessFactor !== undefined ) {

			materialParams.shininess = materialValues.shininessFactor;

		}

	};

	/* BINARY EXTENSION */

	var BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';
	var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
	var BINARY_EXTENSION_HEADER_LENGTH = 12;
	var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

	function GLTFBinaryExtension( data ) {

		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;

		var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

		this.header = {
			magic: convertUint8ArrayToString( new Uint8Array( data.slice( 0, 4 ) ) ),
			version: headerView.getUint32( 4, true ),
			length: headerView.getUint32( 8, true )
		};

		if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

			throw new Error( 'GLTF2Loader: Unsupported glTF-Binary header.' );

		} else if ( this.header.version < 2.0 ) {

			throw new Error( 'GLTF2Loader: Legacy binary file detected. Use GLTFLoader instead.' );

		}

		var chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		var chunkIndex = 0;

		while ( chunkIndex < chunkView.byteLength ) {

			var chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			var chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				this.content = convertUint8ArrayToString( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			// Clients must ignore chunks with unknown types.

			chunkIndex += chunkLength;

		}

		if ( this.content === null ) {

			throw new Error( 'GLTF2Loader: JSON content not found.' );

		}

	}

	/**
	 * WebGL Technique Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/Khronos/KHR_technique_webgl
	 */
	function GLTFTechniqueWebglExtension( json ) {

		this.name = EXTENSIONS.KHR_TECHNIQUE_WEBGL;

		var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ] ) || {};

		this.techniques = extension.techniques || {};
		this.programs = extension.programs || {};
		this.shaders = extension.shaders || {};

	}

	GLTFTechniqueWebglExtension.prototype.getMaterialType = function () {

		return DeferredShaderMaterial;

	};

	GLTFTechniqueWebglExtension.prototype.extendParams = function ( materialParams, material, dependencies ) {

		var extension = material[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ];
		var technique = dependencies.techniques[ extension.technique ];

		materialParams.uniforms = {};

		var program = dependencies.programs[ technique.program ];

		if ( program === undefined ) {

			return;

		}

		materialParams.fragmentShader = dependencies.shaders[ program.fragmentShader ];

		if ( ! materialParams.fragmentShader ) {

			throw new Error( 'ERROR: Missing fragment shader definition:', program.fragmentShader );

		}

		var vertexShader = dependencies.shaders[ program.vertexShader ];

		if ( ! vertexShader ) {

			throw new Error( 'ERROR: Missing vertex shader definition:', program.vertexShader );

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
				var value;

				if ( material.values !== undefined ) value = material.values[ pname ];

				var uvalue = new WEBGL_TYPE[ ptype ]();
				var usemantic = shaderParam.semantic;
				var unode = shaderParam.node;

				switch ( ptype ) {

					case WEBGL_CONSTANTS.FLOAT:

						uvalue = shaderParam.value;

						if ( pname === 'transparency' ) {

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
						console.warn( 'FLOAT_MAT2 is not a supported uniform type' );
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

						} else {

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

						if ( value !== undefined ) {

							uvalue = dependencies.textures[ value ];

						} else if ( shaderParam.value !== undefined ) {

							uvalue = dependencies.textures[ shaderParam.value ];

						} else {

							uvalue = null;

						}

						break;

				}

				materialParams.uniforms[ uniformId ] = {
					value: uvalue,
					semantic: usemantic,
					node: unode
				};

			} else {

				throw new Error( 'Unknown shader uniform param type: ' + ptype );

			}

		}

		var states = technique.states || {};
		var enables = states.enable || [];
		var functions = states.functions || {};

		var enableCullFace = false;
		var enableDepthTest = false;
		var enableBlend = false;

		for ( var i = 0, il = enables.length; i < il; i ++ ) {

			var enable = enables[ i ];

			switch ( STATES_ENABLES[ enable ] ) {

				case 'CULL_FACE':

					enableCullFace = true;

					break;

				case 'DEPTH_TEST':

					enableDepthTest = true;

					break;

				case 'BLEND':

					enableBlend = true;

					break;

				// TODO: implement
				case 'SCISSOR_TEST':
				case 'POLYGON_OFFSET_FILL':
				case 'SAMPLE_ALPHA_TO_COVERAGE':

					break;

				default:

					throw new Error( "Unknown technique.states.enable: " + enable );

			}

		}

		if ( enableCullFace ) {

			materialParams.side = functions.cullFace !== undefined ? WEBGL_SIDES[ functions.cullFace ] : THREE.FrontSide;

		} else {

			materialParams.side = THREE.DoubleSide;

		}

		materialParams.depthTest = enableDepthTest;
		materialParams.depthFunc = functions.depthFunc !== undefined ? WEBGL_DEPTH_FUNCS[ functions.depthFunc ] : THREE.LessDepth;
		materialParams.depthWrite = functions.depthMask !== undefined ? functions.depthMask[ 0 ] : true;

		materialParams.blending = enableBlend ? THREE.CustomBlending : THREE.NoBlending;
		materialParams.transparent = enableBlend;

		var blendEquationSeparate = functions.blendEquationSeparate;

		if ( blendEquationSeparate !== undefined ) {

			materialParams.blendEquation = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 0 ] ];
			materialParams.blendEquationAlpha = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 1 ] ];

		} else {

			materialParams.blendEquation = THREE.AddEquation;
			materialParams.blendEquationAlpha = THREE.AddEquation;

		}

		var blendFuncSeparate = functions.blendFuncSeparate;

		if ( blendFuncSeparate !== undefined ) {

			materialParams.blendSrc = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 0 ] ];
			materialParams.blendDst = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 1 ] ];
			materialParams.blendSrcAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 2 ] ];
			materialParams.blendDstAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 3 ] ];

		} else {

			materialParams.blendSrc = THREE.OneFactor;
			materialParams.blendDst = THREE.ZeroFactor;
			materialParams.blendSrcAlpha = THREE.OneFactor;
			materialParams.blendDstAlpha = THREE.ZeroFactor;

		}

	};

	/**
	 * Specular-Glossiness Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/Khronos/KHR_materials_pbrSpecularGlossiness
	 */
	function GLTFMaterialsPbrSpecularGlossinessExtension() {

		return {

			name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,

			getMaterialType: function () {

				return THREE.ShaderMaterial;

			},

			extendParams: function ( params, material, dependencies ) {

				// specification
				// https://github.com/sbtron/glTF/tree/KHRpbrSpecGloss/extensions/Khronos/KHR_materials_pbrSpecularGlossiness

				var pbrSpecularGlossiness = material.extensions[ this.name ];

				var shader = THREE.ShaderLib[ 'standard' ];

				var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

				var specularMapParsFragmentChunk = [
					'#ifdef USE_SPECULARMAP',
					'	uniform sampler2D specularMap;',
					'#endif'
				].join( '\n' );

				var glossinessMapParsFragmentChunk = [
					'#ifdef USE_GLOSSINESSMAP',
					'	uniform sampler2D glossinessMap;',
					'#endif'
				].join( '\n' );

				var specularMapFragmentChunk = [
					'vec3 specularFactor = specular;',
					'#ifdef USE_SPECULARMAP',
					'	vec4 texelSpecular = texture2D( specularMap, vUv );',
					'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
					'	specularFactor *= texelSpecular.rgb;',
					'#endif'
				].join( '\n' );

				var glossinessMapFragmentChunk = [
					'float glossinessFactor = glossiness;',
					'#ifdef USE_GLOSSINESSMAP',
					'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
					'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
					'	glossinessFactor *= texelGlossiness.a;',
					'#endif'
				].join( '\n' );

				var lightPhysicalFragmentChunk = [
					'PhysicalMaterial material;',
					'material.diffuseColor = diffuseColor.rgb;',
					'material.specularRoughness = clamp( 1.0 - glossinessFactor, 0.04, 1.0 );',
					'material.specularColor = specularFactor.rgb;',
				].join( '\n' );

				var fragmentShader = shader.fragmentShader
							.replace( '#include <specularmap_fragment>', '' )
							.replace( 'uniform float roughness;', 'uniform vec3 specular;' )
							.replace( 'uniform float metalness;', 'uniform float glossiness;' )
							.replace( '#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk )
							.replace( '#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk )
							.replace( '#include <roughnessmap_fragment>', specularMapFragmentChunk )
							.replace( '#include <metalnessmap_fragment>', glossinessMapFragmentChunk )
							.replace( '#include <lights_physical_fragment>', lightPhysicalFragmentChunk );

				delete uniforms.roughness;
				delete uniforms.metalness;
				delete uniforms.roughnessMap;
				delete uniforms.metalnessMap;

				uniforms.specular = { value: new THREE.Color().setHex( 0x111111 ) };
				uniforms.glossiness = { value: 0.5 };
				uniforms.specularMap = { value: null };
				uniforms.glossinessMap = { value: null };

				params.vertexShader = shader.vertexShader;
				params.fragmentShader = fragmentShader;
				params.uniforms = uniforms;
				params.defines = { 'STANDARD': '' };

				params.color = new THREE.Color( 1.0, 1.0, 1.0 );
				params.opacity = 1.0;

				if ( Array.isArray( pbrSpecularGlossiness.diffuseFactor ) ) {

					var array = pbrSpecularGlossiness.diffuseFactor;

					params.color.fromArray( array );
					params.opacity = array[ 3 ];

				}

				if ( pbrSpecularGlossiness.diffuseTexture !== undefined ) {

					params.map = dependencies.textures[ pbrSpecularGlossiness.diffuseTexture.index ];

				}

				params.emissive = new THREE.Color( 0.0, 0.0, 0.0 );
				params.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
				params.specular = new THREE.Color( 1.0, 1.0, 1.0 );

				if ( Array.isArray( pbrSpecularGlossiness.specularFactor ) ) {

					params.specular.fromArray( pbrSpecularGlossiness.specularFactor );

				}

				if ( pbrSpecularGlossiness.specularGlossinessTexture !== undefined ) {

					params.glossinessMap = dependencies.textures[ pbrSpecularGlossiness.specularGlossinessTexture.index ];
					params.specularMap = dependencies.textures[ pbrSpecularGlossiness.specularGlossinessTexture.index ];

				}

			},

			createMaterial: function ( params ) {

				// setup material properties based on MeshStandardMaterial for Specular-Glossiness

				var material = new THREE.ShaderMaterial( {
					defines: params.defines,
					vertexShader: params.vertexShader,
					fragmentShader: params.fragmentShader,
					uniforms: params.uniforms,
					fog: true,
					lights: true,
					opacity: params.opacity,
					transparent: params.transparent
				} );

				material.color = params.color;

				material.map = params.map === undefined ? null : params.map;

				material.lightMap = null;
				material.lightMapIntensity = 1.0;

				material.aoMap = params.aoMap === undefined ? null : params.aoMap;
				material.aoMapIntensity = 1.0;

				material.emissive = params.emissive;
				material.emissiveIntensity = 1.0;
				material.emissiveMap = params.emissiveMap === undefined ? null : params.emissiveMap;

				material.bumpMap = params.bumpMap === undefined ? null : params.bumpMap;
				material.bumpScale = 1;

				material.normalMap = params.normalMap === undefined ? null : params.normalMap;
				material.normalScale = new THREE.Vector2( 1, 1 );

				material.displacementMap = null;
				material.displacementScale = 1;
				material.displacementBias = 0;

				material.specularMap = params.specularMap === undefined ? null : params.specularMap;
				material.specular = params.specular;

				material.glossinessMap = params.glossinessMap === undefined ? null : params.glossinessMap;
				material.glossiness = params.glossiness;

				material.alphaMap = null;

				material.envMap = params.envMap === undefined ? null : params.envMap;
				material.envMapIntensity = 1.0;

				material.refractionRatio = 0.98;

				material.extensions.derivatives = true;

				return material;

			},

			// Here's based on refreshUniformsCommon() and refreshUniformsStandard() in WebGLRenderer.
			refreshUniforms: function ( renderer, scene, camera, geometry, material, group ) {

				var uniforms = material.uniforms;
				var defines = material.defines;

				uniforms.opacity.value = material.opacity;

				uniforms.diffuse.value.copy( material.color );
				uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

				uniforms.map.value = material.map;
				uniforms.specularMap.value = material.specularMap;
				uniforms.alphaMap.value = material.alphaMap;

				uniforms.lightMap.value = material.lightMap;
				uniforms.lightMapIntensity.value = material.lightMapIntensity;

				uniforms.aoMap.value = material.aoMap;
				uniforms.aoMapIntensity.value = material.aoMapIntensity;

				// uv repeat and offset setting priorities
				// 1. color map
				// 2. specular map
				// 3. normal map
				// 4. bump map
				// 5. alpha map
				// 6. emissive map

				var uvScaleMap;

				if ( material.map ) {

					uvScaleMap = material.map;

				} else if ( material.specularMap ) {

					uvScaleMap = material.specularMap;

				} else if ( material.displacementMap ) {

					uvScaleMap = material.displacementMap;

				} else if ( material.normalMap ) {

					uvScaleMap = material.normalMap;

				} else if ( material.bumpMap ) {

					uvScaleMap = material.bumpMap;

				} else if ( material.glossinessMap ) {

					uvScaleMap = material.glossinessMap;

				} else if ( material.alphaMap ) {

					uvScaleMap = material.alphaMap;

				} else if ( material.emissiveMap ) {

					uvScaleMap = material.emissiveMap;

				}

				if ( uvScaleMap !== undefined ) {

					// backwards compatibility
					if ( uvScaleMap.isWebGLRenderTarget ) {

						uvScaleMap = uvScaleMap.texture;

					}

					var offset = uvScaleMap.offset;
					var repeat = uvScaleMap.repeat;

					uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

				}

				uniforms.envMap.value = material.envMap;
				uniforms.envMapIntensity.value = material.envMapIntensity;
				uniforms.flipEnvMap.value = ( material.envMap && material.envMap.isCubeTexture ) ? -1 : 1;

				uniforms.refractionRatio.value = material.refractionRatio;

				uniforms.specular.value.copy( material.specular );
				uniforms.glossiness.value = material.glossiness;

				uniforms.glossinessMap.value = material.glossinessMap;

				uniforms.emissiveMap.value = material.emissiveMap;
				uniforms.bumpMap.value = material.bumpMap;
				uniforms.normalMap.value = material.normalMap;

				uniforms.displacementMap.value = material.displacementMap;
				uniforms.displacementScale.value = material.displacementScale;
				uniforms.displacementBias.value = material.displacementBias;

				if ( uniforms.glossinessMap.value !== null && defines.USE_GLOSSINESSMAP === undefined ) {

					defines.USE_GLOSSINESSMAP = '';
					// set USE_ROUGHNESSMAP to enable vUv
					defines.USE_ROUGHNESSMAP = ''

				}

				if ( uniforms.glossinessMap.value === null && defines.USE_GLOSSINESSMAP !== undefined ) {

					delete defines.USE_GLOSSINESSMAP;
					delete defines.USE_ROUGHNESSMAP;

				}

			}

		};

	}

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

	var WEBGL_TEXTURE_FORMATS = {
		6406: THREE.AlphaFormat,
		6407: THREE.RGBFormat,
		6408: THREE.RGBAFormat,
		6409: THREE.LuminanceFormat,
		6410: THREE.LuminanceAlphaFormat
	};

	var WEBGL_TEXTURE_DATATYPES = {
		5121: THREE.UnsignedByteType,
		32819: THREE.UnsignedShort4444Type,
		32820: THREE.UnsignedShort5551Type,
		33635: THREE.UnsignedShort565Type
	};

	var WEBGL_SIDES = {
		1028: THREE.BackSide,  // Culling front
		1029: THREE.FrontSide  // Culling back
		//1032: THREE.NoSide   // Culling front and back, what to do?
	};

	var WEBGL_DEPTH_FUNCS = {
		512: THREE.NeverDepth,
		513: THREE.LessDepth,
		514: THREE.EqualDepth,
		515: THREE.LessEqualDepth,
		516: THREE.GreaterEqualDepth,
		517: THREE.NotEqualDepth,
		518: THREE.GreaterEqualDepth,
		519: THREE.AlwaysDepth
	};

	var WEBGL_BLEND_EQUATIONS = {
		32774: THREE.AddEquation,
		32778: THREE.SubtractEquation,
		32779: THREE.ReverseSubtractEquation
	};

	var WEBGL_BLEND_FUNCS = {
		0: THREE.ZeroFactor,
		1: THREE.OneFactor,
		768: THREE.SrcColorFactor,
		769: THREE.OneMinusSrcColorFactor,
		770: THREE.SrcAlphaFactor,
		771: THREE.OneMinusSrcAlphaFactor,
		772: THREE.DstAlphaFactor,
		773: THREE.OneMinusDstAlphaFactor,
		774: THREE.DstColorFactor,
		775: THREE.OneMinusDstColorFactor,
		776: THREE.SrcAlphaSaturateFactor
		// The followings are not supported by Three.js yet
		//32769: CONSTANT_COLOR,
		//32770: ONE_MINUS_CONSTANT_COLOR,
		//32771: CONSTANT_ALPHA,
		//32772: ONE_MINUS_CONSTANT_COLOR
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
		rotation: 'quaternion',
		weights: 'morphTargetInfluences'
	};

	var INTERPOLATION = {
		LINEAR: THREE.InterpolateLinear,
		STEP: THREE.InterpolateDiscrete
	};

	var STATES_ENABLES = {
		2884: 'CULL_FACE',
		2929: 'DEPTH_TEST',
		3042: 'BLEND',
		3089: 'SCISSOR_TEST',
		32823: 'POLYGON_OFFSET_FILL',
		32926: 'SAMPLE_ALPHA_TO_COVERAGE'
	};

	var ALPHA_MODES = {
		OPAQUE: 'OPAQUE',
		MASK: 'MASK',
		BLEND: 'BLEND'
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

							results[ key ] = value;

						}.bind( this, idx ));

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

		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) {

			return url;

		}

		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) {

			return url;

		}

		// Blob URL
		if ( /^blob:.*$/i.test( url ) ) {

			return url;

		}

		// Relative URL
		return ( path || '' ) + url;

	}

	function convertUint8ArrayToString( array ) {

		if ( window.TextDecoder !== undefined ) {

			return new TextDecoder().decode( array );

		}

		// Avoid the String.fromCharCode.apply(null, array) shortcut, which
		// throws a "maximum call stack size exceeded" error for large arrays.

		var s = '';

		for ( var i = 0, il = array.length; i < il; i ++ ) {

			s += String.fromCharCode( array[ i ] );

		}

		return s;

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

				case 'POSITION':

					shaderText = shaderText.replace( regEx, 'position' );
					break;

				case 'NORMAL':

					shaderText = shaderText.replace( regEx, 'normal' );
					break;

				case 'TEXCOORD_0':
				case 'TEXCOORD0':
				case 'TEXCOORD':

					shaderText = shaderText.replace( regEx, 'uv' );
					break;

				case 'TEXCOORD_1':

					shaderText = shaderText.replace( regEx, 'uv2' );
					break;

				case 'COLOR_0':
				case 'COLOR0':
				case 'COLOR':

					shaderText = shaderText.replace( regEx, 'color' );
					break;

				case 'WEIGHTS_0':
				case 'WEIGHT': // WEIGHT semantic deprecated.

					shaderText = shaderText.replace( regEx, 'skinWeight' );
					break;

				case 'JOINTS_0':
				case 'JOINT': // JOINT semantic deprecated.

					shaderText = shaderText.replace( regEx, 'skinIndex' );
					break;

			}

		}

		return shaderText;

	}

	function createDefaultMaterial() {

		return new THREE.MeshPhongMaterial( {
			color: 0x00000,
			emissive: 0x888888,
			specular: 0x000000,
			shininess: 0,
			transparent: false,
			depthTest: true,
			side: THREE.FrontSide
		} );

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

	function GLTFParser( json, extensions, options ) {

		this.json = json || {};
		this.extensions = extensions || {};
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

			var scenes = [];

			for ( var name in dependencies.scenes ) {

				scenes.push( dependencies.scenes[ name ] );

			}

			var scene = json.scene !== undefined ? dependencies.scenes[ json.scene ] : scenes[ 0 ];

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
		var extensions = this.extensions;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			var shaders = extensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ] !== undefined ? extensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ].shaders : json.shaders;

			if ( shaders === undefined ) shaders = {};

			return _each( shaders, function ( shader ) {

				if ( shader.bufferView !== undefined ) {

					var bufferView = dependencies.bufferViews[ shader.bufferView ];
					var array = new Uint8Array( bufferView );
					return convertUint8ArrayToString( array );

				}

				return new Promise( function ( resolve ) {

					var loader = new THREE.FileLoader();
					loader.setResponseType( 'text' );
					loader.load( resolveURL( shader.uri, options.path ), function ( shaderText ) {

						resolve( shaderText );

					} );

				} );

			} );

		} );

	};

	GLTFParser.prototype.loadBuffers = function () {

		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;

		return _each( json.buffers, function ( buffer, name ) {

			if ( buffer.type === 'arraybuffer' || buffer.type === undefined ) {

				// If present, GLB container is required to be the first buffer.
				if ( buffer.uri === undefined && name === 0 ) {

					return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body;

				}

				return new Promise( function ( resolve ) {

					var loader = new THREE.FileLoader();
					loader.setResponseType( 'arraybuffer' );
					loader.load( resolveURL( buffer.uri, options.path ), function ( buffer ) {

						resolve( buffer );

					} );

				} );

			} else {

				console.warn( 'THREE.GLTF2Loader: ' + buffer.type + ' buffer type is not supported' );

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

				var byteLength = bufferView.byteLength || 0;
				var byteOffset = bufferView.byteOffset || 0;

				return arraybuffer.slice( byteOffset, byteOffset + byteLength );

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
				var byteStride = json.bufferViews[ accessor.bufferView ].byteStride;
				var array;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( byteStride && byteStride !== itemBytes ) {

					// Use the full buffer if it's interleaved.
					array = new TypedArray( arraybuffer );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					var ib = new THREE.InterleavedBuffer( array, byteStride / elementBytes );

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

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.textures, function ( texture ) {

				if ( texture.source !== undefined ) {

					return new Promise( function ( resolve ) {

						var source = json.images[ texture.source ];
						var sourceUri = source.uri;

						var urlCreator;

						if ( source.bufferView !== undefined ) {

							var bufferView = dependencies.bufferViews[ source.bufferView ];
							var blob = new Blob( [ bufferView ], { type: source.mimeType } );
							urlCreator = window.URL || window.webkitURL;
							sourceUri = urlCreator.createObjectURL( blob );

						}

						var textureLoader = THREE.Loader.Handlers.get( sourceUri );

						if ( textureLoader === null ) {

							textureLoader = new THREE.TextureLoader();

						}

						textureLoader.setCrossOrigin( options.crossOrigin );

						textureLoader.load( resolveURL( sourceUri, options.path ), function ( _texture ) {

							if ( urlCreator !== undefined ) {

								urlCreator.revokeObjectURL( sourceUri );

							}

							_texture.flipY = false;

							if ( texture.name !== undefined ) _texture.name = texture.name;

							_texture.format = texture.format !== undefined ? WEBGL_TEXTURE_FORMATS[ texture.format ] : THREE.RGBAFormat;

							if ( texture.internalFormat !== undefined && _texture.format !== WEBGL_TEXTURE_FORMATS[ texture.internalFormat ] ) {

								console.warn( 'THREE.GLTF2Loader: Three.js doesn\'t support texture internalFormat which is different from texture format. ' +
															'internalFormat will be forced to be the same value as format.' );

							}

							_texture.type = texture.type !== undefined ? WEBGL_TEXTURE_DATATYPES[ texture.type ] : THREE.UnsignedByteType;

							var samplers = json.samplers || {};
							var sampler = samplers[ texture.sampler ] || {};

							_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || THREE.LinearFilter;
							_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || THREE.NearestMipMapLinearFilter;
							_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || THREE.RepeatWrapping;
							_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || THREE.RepeatWrapping;

							resolve( _texture );

						}, undefined, function () {

							resolve();

						} );

					} );

				}

			} );

		} );

	};

	GLTFParser.prototype.loadMaterials = function () {

		var json = this.json;
		var extensions = this.extensions;

		return this._withDependencies( [

			'shaders',
			'textures'

		] ).then( function ( dependencies ) {

			return _each( json.materials, function ( material ) {

				var materialType;
				var materialParams = {};
				var materialExtensions = material.extensions || {};

				if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) {

					materialType = extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].getMaterialType( material );
					extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].extendParams( materialParams, material, dependencies );

				} else if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

					materialType = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].getMaterialType( material );
					extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].extendParams( materialParams, material, dependencies );

				} else if ( materialExtensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ] ) {

					materialType = extensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ].getMaterialType( material );
					extensions[ EXTENSIONS.KHR_TECHNIQUE_WEBGL ].extendParams( materialParams, material, dependencies );

				} else if ( material.pbrMetallicRoughness !== undefined ) {

					// Specification:
					// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

					materialType = THREE.MeshStandardMaterial;

					var metallicRoughness = material.pbrMetallicRoughness;

					materialParams.color = new THREE.Color( 1.0, 1.0, 1.0 );
					materialParams.opacity = 1.0;

					if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

						var array = metallicRoughness.baseColorFactor;

						materialParams.color.fromArray( array );
						materialParams.opacity = array[ 3 ];

					}

					if ( metallicRoughness.baseColorTexture !== undefined ) {

						materialParams.map = dependencies.textures[ metallicRoughness.baseColorTexture.index ];

					}

					materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
					materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

					if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

						var textureIndex = metallicRoughness.metallicRoughnessTexture.index;
						materialParams.metalnessMap = dependencies.textures[ textureIndex ];
						materialParams.roughnessMap = dependencies.textures[ textureIndex ];

					}

				} else {

					materialType = THREE.MeshPhongMaterial;

				}

				if ( material.doubleSided === true ) {

					materialParams.side = THREE.DoubleSide;

				}

				var alphaMode = material.alphaMode || ALPHA_MODES.OPAQUE;

				if ( alphaMode !== ALPHA_MODES.OPAQUE ) {

					materialParams.transparent = true;

				} else {

					materialParams.transparent = false;

				}

				if ( material.normalTexture !== undefined ) {

					materialParams.normalMap = dependencies.textures[ material.normalTexture.index ];

				}

				if ( material.occlusionTexture !== undefined ) {

					materialParams.aoMap = dependencies.textures[ material.occlusionTexture.index ];

				}

				if ( material.emissiveFactor !== undefined ) {

					if ( materialType === THREE.MeshBasicMaterial ) {

						materialParams.color = new THREE.Color().fromArray( material.emissiveFactor );

					} else {

						materialParams.emissive = new THREE.Color().fromArray( material.emissiveFactor );

					}

				}

				if ( material.emissiveTexture !== undefined ) {

					if ( materialType === THREE.MeshBasicMaterial ) {

						materialParams.map = dependencies.textures[ material.emissiveTexture.index ];

					} else {

						materialParams.emissiveMap = dependencies.textures[ material.emissiveTexture.index ];

					}

				}

				var _material;

				if ( materialType === THREE.ShaderMaterial ) {

					_material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

				} else {

					_material = new materialType( materialParams );

				}

				if ( material.name !== undefined ) _material.name = material.name;

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

				var group = new THREE.Group();
				if ( mesh.name !== undefined ) group.name = mesh.name;

				if ( mesh.extras ) group.userData = mesh.extras;

				var primitives = mesh.primitives || [];

				for ( var name in primitives ) {

					var primitive = primitives[ name ];

					var material = primitive.material !== undefined ? dependencies.materials[ primitive.material ] : createDefaultMaterial();

					var geometry;

					var meshNode;

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {

						geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( attributeEntry === undefined ) return;

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

								case 'TEXCOORD_1':

									geometry.addAttribute( 'uv2', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':

									geometry.addAttribute( 'color', bufferAttribute );
									break;

								case 'WEIGHTS_0':
								case 'WEIGHT': // WEIGHT semantic deprecated.

									geometry.addAttribute( 'skinWeight', bufferAttribute );
									break;

								case 'JOINTS_0':
								case 'JOINT': // JOINT semantic deprecated.

									geometry.addAttribute( 'skinIndex', bufferAttribute );
									break;

							}

						}

						if ( primitive.indices !== undefined ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

						}

						if ( material.aoMap
								&& geometry.attributes.uv2 === undefined
								&& geometry.attributes.uv !== undefined ) {

							console.log( 'GLTF2Loader: Duplicating UVs to support aoMap.' );
							geometry.addAttribute( 'uv2', new THREE.BufferAttribute( geometry.attributes.uv.array, 2 ) );

						}

						meshNode = new THREE.Mesh( geometry, material );
						meshNode.castShadow = true;

						if ( primitive.targets !== undefined ) {

							var targets = primitive.targets;
							var morphAttributes = geometry.morphAttributes;

							morphAttributes.position = [];
							morphAttributes.normal = [];

							material.morphTargets = true;

							for ( var i = 0, il = targets.length; i < il; i ++ ) {

								var target = targets[ i ];
								var attributeName = 'morphTarget' + i;

								var positionAttribute, normalAttribute;

								if ( target.POSITION !== undefined ) {

									// Three.js morph formula is
									//   position
									//     + weight0 * ( morphTarget0 - position )
									//     + weight1 * ( morphTarget1 - position )
									//     ...
									// while the glTF one is
									//   position
									//     + weight0 * morphTarget0
									//     + weight1 * morphTarget1
									//     ...
									// then adding position to morphTarget.
									// So morphTarget value will depend on mesh's position, then cloning attribute
									// for the case if attribute is shared among two or more meshes.

									positionAttribute = dependencies.accessors[ target.POSITION ].clone();
									var position = geometry.attributes.position;

									for ( var j = 0, jl = positionAttribute.array.length; j < jl; j ++ ) {

										positionAttribute.array[ j ] += position.array[ j ];

									}

								} else {

									// Copying the original position not to affect the final position.
									// See the formula above.
									positionAttribute = geometry.attributes.position.clone();

								}

								if ( target.NORMAL !== undefined ) {

									material.morphNormals = true;

									// see target.POSITION's comment

									normalAttribute = dependencies.accessors[ target.NORMAL ].clone();
									var normal = geometry.attributes.normal;

									for ( var j = 0, jl = normalAttribute.array.length; j < jl; j ++ ) {

										normalAttribute.array[ j ] += normal.array[ j ];

									}

								} else {

									normalAttribute = geometry.attributes.normal.clone();

								}

								// TODO: implement
								if ( target.TANGENT !== undefined ) {

								}

								positionAttribute.name = attributeName;
								normalAttribute.name = attributeName;

								morphAttributes.position.push( positionAttribute );
								morphAttributes.normal.push( normalAttribute );

							}

							meshNode.updateMorphTargets();

							if ( mesh.weights !== undefined ) {

								for ( var i = 0, il = mesh.weights.length; i < il; i ++ ) {

									meshNode.morphTargetInfluences[ i ] = mesh.weights[ i ];

								}

							}

						}

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

						geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( ! attributeEntry ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':
									geometry.addAttribute( 'position', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':
									geometry.addAttribute( 'color', bufferAttribute );
									break;

							}

						}

						if ( primitive.indices !== undefined ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

						}

						meshNode = new THREE.LineSegments( geometry, material );

					} else {

						throw new Error( 'Only triangular and line primitives are supported' );

					}

					if ( geometry.attributes.color !== undefined ) {

						material.vertexColors = THREE.VertexColors;
						material.needsUpdate = true;

					}

					meshNode.name = ( name === "0" ? group.name : group.name + name );

					if ( primitive.extras ) meshNode.userData = primitive.extras;

					group.add( meshNode );

				}

				return group;

			} );

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
	 */
	GLTFParser.prototype.loadCameras = function () {

		var json = this.json;

		return _each( json.cameras, function ( camera ) {

			var _camera;

			var params = camera[ camera.type ];

			if ( !params ) {

				console.warn( 'GLTF2Loader: Missing camera parameters.' );
				return;

			}

			if ( camera.type === 'perspective' ) {

				var aspectRatio = params.aspectRatio || 1;
				var xfov = params.yfov * aspectRatio;

				_camera = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspectRatio, params.znear || 1, params.zfar || 2e6 );

			} else if ( camera.type === 'orthographic' ) {

				_camera = new THREE.OrthographicCamera( params.xmag / -2, params.xmag / 2, params.ymag / 2, params.ymag / -2, params.znear, params.zfar );

			}

			if ( camera.name !== undefined ) _camera.name = camera.name;
			if ( camera.extras ) _camera.userData = camera.extras;

			return _camera;

		} );

	};

	GLTFParser.prototype.loadSkins = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors"

		] ).then( function ( dependencies ) {

			return _each( json.skins, function ( skin ) {

				var _skin = {
					joints: skin.joints,
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

					if ( sampler ) {

						var target = channel.target;
						var name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
						var input = animation.parameters !== undefined ? animation.parameters[ sampler.input ] : sampler.input;
						var output = animation.parameters !== undefined ? animation.parameters[ sampler.output ] : sampler.output;

						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];

						var node = dependencies.nodes[ name ];

						if ( node ) {

							node.updateMatrix();
							node.matrixAutoUpdate = true;

							var TypedKeyframeTrack;

							switch ( PATH_PROPERTIES[ target.path ] ) {

								case PATH_PROPERTIES.weights:

									TypedKeyframeTrack = THREE.NumberKeyframeTrack;
									break;

								case PATH_PROPERTIES.rotation:

									TypedKeyframeTrack = THREE.QuaternionKeyframeTrack;
									break;

								case PATH_PROPERTIES.position:
								case PATH_PROPERTIES.scale:
								default:

									TypedKeyframeTrack = THREE.VectorKeyframeTrack;
									break;

							}

							var targetName = node.name ? node.name : node.uuid;
							var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : THREE.InterpolateLinear;

							var targetNames = [];

							if ( PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.weights ) {

								// node should be THREE.Group here but
								// PATH_PROPERTIES.weights(morphTargetInfluences) should be
								// the property of a mesh object under node.
								// So finding targets here.

								node.traverse( function ( object ) {

									if ( object.isMesh === true && object.material.morphTargets === true ) {

										targetNames.push( object.name ? object.name : object.uuid );

									}

								} );

							} else {

								targetNames.push( targetName );

							}

							// KeyframeTrack.optimize() will modify given 'times' and 'values'
							// buffers before creating a truncated copy to keep. Because buffers may
							// be reused by other tracks, make copies here.
							for ( var i = 0, il = targetNames.length; i < il; i ++ ) {

								tracks.push( new TypedKeyframeTrack(
									targetNames[ i ] + '.' + PATH_PROPERTIES[ target.path ],
									THREE.AnimationUtils.arraySlice( inputAccessor.array, 0 ),
									THREE.AnimationUtils.arraySlice( outputAccessor.array, 0 ),
									interpolation
								) );

							}

						}

					}

				}

				var name = animation.name !== undefined ? animation.name : "animation_" + animationId;

				return new THREE.AnimationClip( name, undefined, tracks );

			} );

		} );

	};

	GLTFParser.prototype.loadNodes = function () {

		var json = this.json;
		var extensions = this.extensions;
		var scope = this;

		var nodes = json.nodes || [];
		var skins = json.skins || [];

		// Nothing in the node definition indicates whether it is a Bone or an
		// Object3D. Use the skins' joint references to mark bones.
		skins.forEach( function ( skin ) {

			skin.joints.forEach( function ( id ) {

				nodes[ id ].isBone = true;

			} );

		} );

		return _each( json.nodes, function ( node ) {

			var matrix = new THREE.Matrix4();

			var _node = node.isBone === true ? new THREE.Bone() : new THREE.Object3D();

			if ( node.name !== undefined ) {

				_node.name = THREE.PropertyBinding.sanitizeNodeName( node.name );

			}

			if ( node.extras ) _node.userData = node.extras;

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
				"cameras"

			] ).then( function ( dependencies ) {

				return _each( __nodes, function ( _node, nodeId ) {

					var node = json.nodes[ nodeId ];

					var meshes;

					if ( node.mesh !== undefined) {

						meshes = [ node.mesh ];

					} else if ( node.meshes !== undefined ) {

						console.warn( 'GLTF2Loader: Legacy glTF file detected. Nodes may have no more than 1 mesh.' );

						meshes = node.meshes;

					}

					if ( meshes !== undefined ) {

						for ( var meshId in meshes ) {

							var mesh = meshes[ meshId ];
							var group = dependencies.meshes[ mesh ];

							if ( group === undefined ) {

								console.warn( 'GLTF2Loader: Couldn\'t find node "' + mesh + '".' );
								continue;

							}

							for ( var childrenId in group.children ) {

								var child = group.children[ childrenId ];

								// clone Mesh to add to _node

								var originalMaterial = child.material;
								var originalGeometry = child.geometry;
								var originalUserData = child.userData;
								var originalName = child.name;

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

									case 'LineLoop':
										child = new THREE.LineLoop( originalGeometry, material );
										break;

									case 'Line':
										child = new THREE.Line( originalGeometry, material );
										break;

									default:
										child = new THREE.Mesh( originalGeometry, material );

								}

								child.castShadow = true;
								child.userData = originalUserData;
								child.name = originalName;

								var skinEntry;

								if ( node.skin !== undefined ) {

									skinEntry = dependencies.skins[ node.skin ];

								}

								// Replace Mesh with SkinnedMesh in library
								if ( skinEntry ) {

									var geometry = originalGeometry;
									material = originalMaterial;
									material.skinning = true;

									child = new THREE.SkinnedMesh( geometry, material );
									child.castShadow = true;
									child.userData = originalUserData;
									child.name = originalName;

									var bones = [];
									var boneInverses = [];

									for ( var i = 0, l = skinEntry.joints.length; i < l; i ++ ) {

										var jointId = skinEntry.joints[ i ];
										var jointNode = __nodes[ jointId ];

										if ( jointNode ) {

											bones.push( jointNode );

											var m = skinEntry.inverseBindMatrices.array;
											var mat = new THREE.Matrix4().fromArray( m, i * 16 );
											boneInverses.push( mat );

										} else {

											console.warn( "WARNING: joint: '" + jointId + "' could not be found" );

										}

									}

									child.bind( new THREE.Skeleton( bones, boneInverses ), child.matrixWorld );

								}

								_node.add( child );

							}

						}

					}

					if ( node.camera !== undefined ) {

						var camera = dependencies.cameras[ node.camera ];

						_node.add( camera );

					}

					if ( node.extensions
							 && node.extensions[ EXTENSIONS.KHR_LIGHTS ]
							 && node.extensions[ EXTENSIONS.KHR_LIGHTS ].light !== undefined ) {

						var lights = extensions[ EXTENSIONS.KHR_LIGHTS ].lights;
						_node.add( lights[ node.extensions[ EXTENSIONS.KHR_LIGHTS ].light ] );

					}

					return _node;

				} );

			} );

		} );

	};

	GLTFParser.prototype.loadScenes = function () {

		var json = this.json;
		var extensions = this.extensions;

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
				if ( scene.name !== undefined ) _scene.name = scene.name;

				if ( scene.extras ) _scene.userData = scene.extras;

				var nodes = scene.nodes || [];

				for ( var i = 0, l = nodes.length; i < l; i ++ ) {

					var nodeId = nodes[ i ];
					buildNodeHierachy( nodeId, _scene, dependencies.nodes );

				}

				_scene.traverse( function ( child ) {

					// Register raw material meshes with GLTF2Loader.Shaders
					if ( child.material && child.material.isRawShaderMaterial ) {

						child.gltfShader = new GLTFShader( child, dependencies.nodes );
						child.onBeforeRender = function(renderer, scene, camera){
							this.gltfShader.update(scene, camera);
						};

					}

					// for Specular-Glossiness.
					if ( child.material && child.material.type === 'ShaderMaterial' ) {

						child.onBeforeRender = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].refreshUniforms;

					}

				} );

				// Ambient lighting, if present, is always attached to the scene root.
				if ( scene.extensions
							 && scene.extensions[ EXTENSIONS.KHR_LIGHTS ]
							 && scene.extensions[ EXTENSIONS.KHR_LIGHTS ].light !== undefined ) {

					var lights = extensions[ EXTENSIONS.KHR_LIGHTS ].lights;
					_scene.add( lights[ scene.extensions[ EXTENSIONS.KHR_LIGHTS ].light ] );

				}

				return _scene;

			} );

		} );

	};

	return GLTF2Loader;

} )();
