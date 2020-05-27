console.warn( "THREE.OutlineEffect: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author takahirox / http://github.com/takahirox/
 *
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * API
 *
 * 1. Traditional
 *
 * var effect = new THREE.OutlineEffect( renderer );
 *
 * function render() {
 *
 * 	effect.render( scene, camera );
 *
 * }
 *
 * 2. VR compatible
 *
 * var effect = new THREE.OutlineEffect( renderer );
 * var renderingOutline = false;
 *
 * scene.onAfterRender = function () {
 *
 * 	if ( renderingOutline ) return;
 *
 * 	renderingOutline = true;
 *
 * 	effect.renderOutline( scene, camera );
 *
 * 	renderingOutline = false;
 *
 * };
 *
 * function render() {
 *
 * 	renderer.render( scene, camera );
 *
 * }
 *
 * // How to set default outline parameters
 * new THREE.OutlineEffect( renderer, {
 * 	defaultThickness: 0.01,
 * 	defaultColor: [ 0, 0, 0 ],
 * 	defaultAlpha: 0.8,
 * 	defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
 * } );
 *
 * // How to set outline parameters for each material
 * material.userData.outlineParameters = {
 * 	thickness: 0.01,
 * 	color: [ 0, 0, 0 ]
 * 	alpha: 0.8,
 * 	visible: true,
 * 	keepAlive: true
 * };
 */

THREE.OutlineEffect = function ( renderer, parameters ) {

	parameters = parameters || {};

	this.enabled = true;

	var defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
	var defaultColor = new THREE.Color().fromArray( parameters.defaultColor !== undefined ? parameters.defaultColor : [ 0, 0, 0 ] );
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

	var uniformsOutline = {
		outlineThickness: { value: defaultThickness },
		outlineColor: { value: defaultColor },
		outlineAlpha: { value: defaultAlpha }
	};

	var vertexShader = [
		"#include <common>",
		"#include <uv_pars_vertex>",
		"#include <displacementmap_pars_vertex>",
		"#include <fog_pars_vertex>",
		"#include <morphtarget_pars_vertex>",
		"#include <skinning_pars_vertex>",
		"#include <logdepthbuf_pars_vertex>",
		"#include <clipping_planes_pars_vertex>",

		"uniform float outlineThickness;",

		"vec4 calculateOutline( vec4 pos, vec3 normal, vec4 skinned ) {",
		"	float thickness = outlineThickness;",
		"	const float ratio = 1.0;", // TODO: support outline thickness ratio for each vertex
		"	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + normal, 1.0 );",
		// NOTE: subtract pos2 from pos because BackSide objectNormal is negative
		"	vec4 norm = normalize( pos - pos2 );",
		"	return pos + norm * thickness * pos.w * ratio;",
		"}",

		"void main() {",

		"	#include <uv_vertex>",

		"	#include <beginnormal_vertex>",
		"	#include <morphnormal_vertex>",
		"	#include <skinbase_vertex>",
		"	#include <skinnormal_vertex>",

		"	#include <begin_vertex>",
		"	#include <morphtarget_vertex>",
		"	#include <skinning_vertex>",
		"	#include <displacementmap_vertex>",
		"	#include <project_vertex>",

		"	vec3 outlineNormal = - objectNormal;", // the outline material is always rendered with THREE.BackSide

		"	gl_Position = calculateOutline( gl_Position, outlineNormal, vec4( transformed, 1.0 ) );",

		"	#include <logdepthbuf_vertex>",
		"	#include <clipping_planes_vertex>",
		"	#include <fog_vertex>",

		"}",

	].join( "\n" );

	var fragmentShader = [

		"#include <common>",
		"#include <fog_pars_fragment>",
		"#include <logdepthbuf_pars_fragment>",
		"#include <clipping_planes_pars_fragment>",

		"uniform vec3 outlineColor;",
		"uniform float outlineAlpha;",

		"void main() {",

		"	#include <clipping_planes_fragment>",
		"	#include <logdepthbuf_fragment>",

		"	gl_FragColor = vec4( outlineColor, outlineAlpha );",

		"	#include <tonemapping_fragment>",
		"	#include <encodings_fragment>",
		"	#include <fog_fragment>",
		"	#include <premultiplied_alpha_fragment>",

		"}"

	].join( "\n" );

	function createMaterial() {

		return new THREE.ShaderMaterial( {
			type: 'OutlineEffect',
			uniforms: THREE.UniformsUtils.merge( [
				THREE.UniformsLib[ 'fog' ],
				THREE.UniformsLib[ 'displacementmap' ],
				uniformsOutline
			] ),
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.BackSide
		} );

	}

	function getOutlineMaterialFromCache( originalMaterial ) {

		var data = cache[ originalMaterial.uuid ];

		if ( data === undefined ) {

			data = {
				material: createMaterial(),
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

	function isCompatible( object ) {

		var geometry = object.geometry;
		var hasNormals = false;

		if ( object.geometry !== undefined ) {

			if ( geometry.isBufferGeometry ) {

				hasNormals = geometry.attributes.normal !== undefined;

			} else {

				hasNormals = true; // the renderer always produces a normal attribute for Geometry

			}

		}

		return ( object.isMesh === true && object.material !== undefined && hasNormals === true );

	}

	function setOutlineMaterial( object ) {

		if ( isCompatible( object ) === false ) return;

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

		if ( isCompatible( object ) === false ) return;

		if ( Array.isArray( object.material ) ) {

			for ( var i = 0, il = object.material.length; i < il; i ++ ) {

				object.material[ i ] = originalMaterials[ object.material[ i ].uuid ];

			}

		} else {

			object.material = originalMaterials[ object.material.uuid ];

		}

		object.onBeforeRender = originalOnBeforeRenders[ object.uuid ];

	}

	function onBeforeRender( renderer, scene, camera, geometry, material ) {

		var originalMaterial = originalMaterials[ material.uuid ];

		// just in case
		if ( originalMaterial === undefined ) return;

		updateUniforms( material, originalMaterial );

	}

	function updateUniforms( material, originalMaterial ) {

		var outlineParameters = originalMaterial.userData.outlineParameters;

		material.uniforms.outlineAlpha.value = originalMaterial.opacity;

		if ( outlineParameters !== undefined ) {

			if ( outlineParameters.thickness !== undefined ) material.uniforms.outlineThickness.value = outlineParameters.thickness;
			if ( outlineParameters.color !== undefined ) material.uniforms.outlineColor.value.fromArray( outlineParameters.color );
			if ( outlineParameters.alpha !== undefined ) material.uniforms.outlineAlpha.value = outlineParameters.alpha;

		}

		if ( originalMaterial.displacementMap ) {

			material.uniforms.displacementMap.value = originalMaterial.displacementMap;
			material.uniforms.displacementScale.value = originalMaterial.displacementScale;
			material.uniforms.displacementBias.value = originalMaterial.displacementBias;

		}

	}

	function updateOutlineMaterial( material, originalMaterial ) {

		if ( material.name === 'invisible' ) return;

		var outlineParameters = originalMaterial.userData.outlineParameters;

		material.skinning = originalMaterial.skinning;
		material.morphTargets = originalMaterial.morphTargets;
		material.morphNormals = originalMaterial.morphNormals;
		material.fog = originalMaterial.fog;
		material.toneMapped = originalMaterial.toneMapped;
		material.premultipliedAlpha = originalMaterial.premultipliedAlpha;
		material.displacementMap = originalMaterial.displacementMap;

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

		if ( originalMaterial.clippingPlanes ) {

			material.clipping = true;

			material.clippingPlanes = originalMaterial.clippingPlanes;
			material.clipIntersection = originalMaterial.clipIntersection;
			material.clipShadows = originalMaterial.clipShadows;

		}

		material.version = originalMaterial.version; // update outline material if necessary

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

				cache[ key ].count ++;

				if ( cache[ key ].keepAlive === false && cache[ key ].count > removeThresholdCount ) {

					delete cache[ key ];

				}

			} else {

				cache[ key ].used = false;
				cache[ key ].count = 0;

			}

		}

	}

	this.render = function ( scene, camera ) {

		var renderTarget;
		var forceClear = false;

		if ( arguments[ 2 ] !== undefined ) {

			console.warn( 'THREE.OutlineEffect.render(): the renderTarget argument has been removed. Use .setRenderTarget() instead.' );
			renderTarget = arguments[ 2 ];

		}

		if ( arguments[ 3 ] !== undefined ) {

			console.warn( 'THREE.OutlineEffect.render(): the forceClear argument has been removed. Use .clear() instead.' );
			forceClear = arguments[ 3 ];

		}

		if ( renderTarget !== undefined ) renderer.setRenderTarget( renderTarget );

		if ( forceClear ) renderer.clear();

		if ( this.enabled === false ) {

			renderer.render( scene, camera );
			return;

		}

		var currentAutoClear = renderer.autoClear;
		renderer.autoClear = this.autoClear;

		renderer.render( scene, camera );

		renderer.autoClear = currentAutoClear;

		this.renderOutline( scene, camera );

	};

	this.renderOutline = function ( scene, camera ) {

		var currentAutoClear = renderer.autoClear;
		var currentSceneAutoUpdate = scene.autoUpdate;
		var currentSceneBackground = scene.background;
		var currentShadowMapEnabled = renderer.shadowMap.enabled;

		scene.autoUpdate = false;
		scene.background = null;
		renderer.autoClear = false;
		renderer.shadowMap.enabled = false;

		scene.traverse( setOutlineMaterial );

		renderer.render( scene, camera );

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
	 * effect = new THREE.StereoEffect( new THREE.OutlineEffect( renderer ) );
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

	this.getSize = function ( target ) {

		return renderer.getSize( target );

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
