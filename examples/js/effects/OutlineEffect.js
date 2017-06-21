/**
 * @author takahirox / http://github.com/takahirox/
 *
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * // How to set default outline parameters
 * new THREE.OutlineEffect( renderer, {
 * 	defaultThickNess: 0.01,
 * 	defaultColor: new THREE.Color( 0x888888 ),
 * 	defaultAlpha: 0.8,
 * 	defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
 * } );
 *
 * // How to set outline parameters for each material
 * material.outlineParameters = {
 * 	thickNess: 0.01,
 * 	color: new THREE.Color( 0x888888 ),
 * 	alpha: 0.8,
 * 	visible: true,
 * 	keepAlive: true
 * };
 *
 * TODO
 *  - support shader material without objectNormal in its vertexShader
 */

THREE.OutlineEffect = function ( renderer, parameters ) {

	parameters = parameters || {};

	this.enabled = true;

	var defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
	var defaultColor = parameters.defaultColor !== undefined ? parameters.defaultColor : new THREE.Color( 0x000000 );
	var defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;
	var defaultKeepAlive = parameters.defaultKeepAlive !== undefined ? parameters.defaultKeepAlive : false;

	// object.material.uuid -> outlineMaterial or
	// object.material[ n ].uuid -> outlineMaterial
	// save at the outline material creation and release
	// if it's unused removeThresholdCount frames
	// unless keepAlive is true.
	var cache = {};

	var removeThresholdCount = 60;

	// outlineMaterial.uuid -> object.material or
	// outlineMaterial.uuid -> object.material[ n ]
	// save before render and release after render.
	var originalMaterials = {};

	// object.uuid -> originalOnBeforeRender
	// save before render and release after render.
	var originalOnBeforeRenders = {};

	//this.cache = cache;  // for debug

	// copied from WebGLPrograms and removed some materials
	var shaderIDs = {
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		MeshToonMaterial: 'phong',
		MeshStandardMaterial: 'physical',
		MeshPhysicalMaterial: 'physical'
	};

	var uniformsChunk = {
		outlineThickness: { type: "f", value: defaultThickness },
		outlineColor: { type: "c", value: defaultColor },
		outlineAlpha: { type: "f", value: defaultAlpha }
	};

	var vertexShaderChunk = [

		"#include <fog_pars_vertex>",

		"uniform float outlineThickness;",

		"vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {",

		"	float thickness = outlineThickness;",
		"	const float ratio = 1.0;", // TODO: support outline thickness ratio for each vertex
		"	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );",
		// NOTE: subtract pos2 from pos because BackSide objectNormal is negative
		"	vec4 norm = normalize( pos - pos2 );",
		"	return pos + norm * thickness * pos.w * ratio;",

		"}"

	].join( "\n" );

	var vertexShaderChunk2 = [

		"#if ! defined( LAMBERT ) && ! defined( PHONG ) && ! defined( TOON ) && ! defined( PHYSICAL )",

		"	#ifndef USE_ENVMAP",
		"		vec3 transformedNormal = normalize( normal );",

		"		#ifdef FLIP_SIDED",
		"			transformedNormal = -transformedNormal;",
		"		#endif",

		"	#endif",

		"#endif",

		"#ifdef DECLARE_TRANSFORMED",
		"	vec3 transformed = vec3( position );",
		"#endif",

		"gl_Position = calculateOutline( gl_Position, transformedNormal, vec4( transformed, 1.0 ) );",

		"#include <fog_vertex>"

	].join( "\n" );

	var fragmentShader = [

		"#include <common>",
		"#include <fog_pars_fragment>",

		"uniform vec3 outlineColor;",
		"uniform float outlineAlpha;",

		"void main() {",

		"	gl_FragColor = vec4( outlineColor, outlineAlpha );",

		"	#include <fog_fragment>",

		"}"

	].join( "\n" );

	function createInvisibleMaterial() {

		return new THREE.ShaderMaterial( { name: 'invisible', visible: false } );

	}

	function createMaterial( originalMaterial ) {

		var shaderID = shaderIDs[ originalMaterial.type ];
		var originalUniforms, originalVertexShader;
		var outlineParameters = originalMaterial.outlineParameters;

		if ( shaderID !== undefined ) {

			var shader = THREE.ShaderLib[ shaderID ];
			originalUniforms = shader.uniforms;
			originalVertexShader = shader.vertexShader;

		} else if ( originalMaterial.isRawShaderMaterial === true ) {

			originalUniforms = originalMaterial.uniforms;
			originalVertexShader = originalMaterial.vertexShader;

			if ( ! /attribute\s+vec3\s+position\s*;/.test( originalVertexShader ) ||
			     ! /attribute\s+vec3\s+normal\s*;/.test( originalVertexShader ) ) {

				console.warn( 'THREE.OutlineEffect requires both vec3 position and normal attributes in vertex shader, ' +
				              'does not draw outline for ' + originalMaterial.name + '(uuid:' + originalMaterial.uuid + ') material.' );

				return createInvisibleMaterial();

			}

		} else if ( originalMaterial.isShaderMaterial === true ) {

			originalUniforms = originalMaterial.uniforms;
			originalVertexShader = originalMaterial.vertexShader;

		} else {

			return createInvisibleMaterial();

		}

		var uniforms = Object.assign( {}, originalUniforms, uniformsChunk );

		var vertexShader = originalVertexShader
					// put vertexShaderChunk right before "void main() {...}"
					.replace( /void\s+main\s*\(\s*\)/, vertexShaderChunk + '\nvoid main()' )
					// put vertexShaderChunk2 the end of "void main() {...}"
					// Note: here assums originalVertexShader ends with "}" of "void main() {...}"
					.replace( /\}\s*$/, vertexShaderChunk2 + '\n}' )
					// remove any light related lines
					// Note: here is very sensitive to originalVertexShader
					// TODO: consider safer way
					.replace( /#include\s+<[\w_]*light[\w_]*>/g, '' );

		var defines = {};

		if ( ! /vec3\s+transformed\s*=/.test( originalVertexShader ) &&
		     ! /#include\s+<begin_vertex>/.test( originalVertexShader ) ) defines.DECLARE_TRANSFORMED = true;

		return new THREE.ShaderMaterial( {
			defines: defines,
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.BackSide,
			//wireframe: true,
			skinning: false,
			morphTargets: false,
			morphNormals: false,
			fog: false
		} );

	}

	function getOutlineMaterialFromCache( originalMaterial ) {

		var data = cache[ originalMaterial.uuid ];

		if ( data === undefined ) {

			data = {
				material: createMaterial( originalMaterial ),
				used: true,
				keepAlive: defaultKeepAlive,
				count: 0
			};

			cache[ originalMaterial.uuid ] = data;

		}

		data.used = true;

		return data.material;

	}

	function getOutlineMaterial( originalMaterial ) {

		var outlineMaterial = getOutlineMaterialFromCache( originalMaterial );

		originalMaterials[ outlineMaterial.uuid ] = originalMaterial;

		updateOutlineMaterial( outlineMaterial, originalMaterial );

		return outlineMaterial;

	}

	function setOutlineMaterial( object ) {

		if ( object.material === undefined ) return;

		if ( Array.isArray( object.material ) ) {

			for ( var i = 0, il = object.material.length; i < il; i ++ ) {

				object.material[ i ] = getOutlineMaterial( object.material[ i ] );

			}

		} else {

			object.material = getOutlineMaterial( object.material );

		}

		originalOnBeforeRenders[ object.uuid ] = object.onBeforeRender;
		object.onBeforeRender = onBeforeRender;

	}

	function restoreOriginalMaterial( object ) {

		if ( object.material === undefined ) return;

		if ( Array.isArray( object.material ) ) {

			for ( var i = 0, il = object.material.length; i < il; i ++ ) {

				object.material[ i ] = originalMaterials[ object.material[ i ].uuid ];

			}

		} else {

			object.material = originalMaterials[ object.material.uuid ];

		}

		object.onBeforeRender = originalOnBeforeRenders[ object.uuid ];

	}

	function onBeforeRender( renderer, scene, camera, geometry, material, group ) {

		var originalMaterial = originalMaterials[ material.uuid ];

		// just in case
		if ( originalMaterial === undefined ) return;

		updateUniforms( material, originalMaterial );

	}

	function updateUniforms( material, originalMaterial ) {

		var outlineParameters = originalMaterial.outlineParameters;

		material.uniforms.outlineAlpha.value = originalMaterial.opacity;

		if ( outlineParameters !== undefined ) {

			if ( outlineParameters.thickness !== undefined ) material.uniforms.outlineThickness.value = outlineParameters.thickness;
			if ( outlineParameters.color !== undefined ) material.uniforms.outlineColor.value.copy( outlineParameters.color );
			if ( outlineParameters.alpha !== undefined ) material.uniforms.outlineAlpha.value = outlineParameters.alpha;

		}

	}

	function updateOutlineMaterial( material, originalMaterial ) {

		if ( material.name === 'invisible' ) return;

		var outlineParameters = originalMaterial.outlineParameters;

		material.skinning = originalMaterial.skinning;
		material.morphTargets = originalMaterial.morphTargets;
		material.morphNormals = originalMaterial.morphNormals;
		material.fog = originalMaterial.fog;

		if ( outlineParameters !== undefined ) {

			if ( originalMaterial.visible === false ) {

				material.visible = false;

			} else {

				material.visible = ( outlineParameters.visible !== undefined ) ? outlineParameters.visible : true;

			}

			material.transparent = ( outlineParameters.alpha !== undefined && outlineParameters.alpha < 1.0 ) ? true : originalMaterial.transparent;

			if ( outlineParameters.keepAlive !== undefined ) cache[ originalMaterial.uuid ].keepAlive = outlineParameters.keepAlive;

		} else {

			material.transparent = originalMaterial.transparent;
			material.visible = originalMaterial.visible;

		}

		if ( originalMaterial.wireframe === true || originalMaterial.depthTest === false ) material.visible = false;

	}

	function cleanupCache() {

		var keys;

		// clear originialMaterials
		keys = Object.keys( originalMaterials );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			originalMaterials[ keys[ i ] ] = undefined;

		}

		// clear originalOnBeforeRenders
		keys = Object.keys( originalOnBeforeRenders );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			originalOnBeforeRenders[ keys[ i ] ] = undefined;

		}

		// remove unused outlineMaterial from cache
		keys = Object.keys( cache );

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			var key = keys[ i ];

			if ( cache[ key ].used === false ) {

				cache[ key ].count++;

				if ( cache[ key ].keepAlive === false && cache[ key ].count > removeThresholdCount ) {

					delete cache[ key ];

				}

			} else {

				cache[ key ].used = false;
				cache[ key ].count = 0;

			}

		}

	}

	this.render = function ( scene, camera, renderTarget, forceClear ) {

		if ( this.enabled === false ) {

			renderer.render( scene, camera, renderTarget, forceClear );
			return;

		}

		var currentAutoClear = renderer.autoClear;
		renderer.autoClear = this.autoClear;

		// 1. render normally
		renderer.render( scene, camera, renderTarget, forceClear );

		// 2. render outline
		var currentSceneAutoUpdate = scene.autoUpdate;
		var currentSceneBackground = scene.background;
		var currentShadowMapEnabled = renderer.shadowMap.enabled;

		scene.autoUpdate = false;
		scene.background = null;
		renderer.autoClear = false;
		renderer.shadowMap.enabled = false;

		scene.traverse( setOutlineMaterial );

		renderer.render( scene, camera, renderTarget );

		scene.traverse( restoreOriginalMaterial );

		cleanupCache();

		scene.autoUpdate = currentSceneAutoUpdate;
		scene.background = currentSceneBackground;
		renderer.autoClear = currentAutoClear;
		renderer.shadowMap.enabled = currentShadowMapEnabled;

	};

	/*
	 * See #9918
	 *
	 * The following property copies and wrapper methods enable
	 * THREE.OutlineEffect to be called from other *Effect, like
	 *
	 * effect = new THREE.VREffect( new THREE.OutlineEffect( renderer ) );
	 *
	 * function render () {
	 *
 	 * 	effect.render( scene, camera );
	 *
	 * }
	 */
	this.autoClear = renderer.autoClear;
	this.domElement = renderer.domElement;
	this.shadowMap = renderer.shadowMap;

	this.clear = function ( color, depth, stencil ) {

		renderer.clear( color, depth, stencil );

	};

	this.getPixelRatio = function () {

		return renderer.getPixelRatio();

	};

	this.setPixelRatio = function ( value ) {

		renderer.setPixelRatio( value );

	};

	this.getSize = function () {

		return renderer.getSize();

	};

	this.setSize = function ( width, height, updateStyle ) {

		renderer.setSize( width, height, updateStyle );

	};

	this.setViewport = function ( x, y, width, height ) {

		renderer.setViewport( x, y, width, height );

	};

	this.setScissor = function ( x, y, width, height ) {

		renderer.setScissor( x, y, width, height );

	};

	this.setScissorTest = function ( boolean ) {

		renderer.setScissorTest( boolean );

	};

	this.setRenderTarget = function ( renderTarget ) {

		renderer.setRenderTarget( renderTarget );

	};

};
