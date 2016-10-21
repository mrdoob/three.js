/**
 * @author takahirox / http://github.com/takahirox/
 *
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * // How to set default outline parameters
 * new THREE.OutlineEffect( renderer, {
 * 	defaultThickNess: 0.01,
 * 	defaultColor: new THREE.Color( 0x888888 ),
 * 	defaultAlpha: 0.8
 * } );
 *
 * // How to set outline parameters for each material
 * material.outlineParameters = {
 * 	thickNess: 0.01,
 * 	color: new THREE.Color( 0x888888 ),
 * 	alpha: 0.8,
 * 	visible: true
 * };
 *
 * TODO
 *  - shared material
 *  - support shader material without objectNormal in its vertexShader
 */

THREE.OutlineEffect = function ( renderer, parameters ) {

	var _this = this;

	parameters = parameters || {};

	this.autoClear = parameters.autoClear !== undefined ? parameters.autoClear : true;

	var defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
	var defaultColor = parameters.defaultColor !== undefined ? parameters.defaultColor : new THREE.Color( 0x000000 );
	var defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;

	var invisibleMaterial = new THREE.ShaderMaterial( { visible: false } );

	// copied from WebGLPrograms and removed some materials
	var shaderIDs = {
		MeshBasicMaterial: 'basic',
		MeshLambertMaterial: 'lambert',
		MeshPhongMaterial: 'phong',
		MeshStandardMaterial: 'physical',
		MeshPhysicalMaterial: 'physical'
	};

	var uniformsChunk = {
		outlineThickness: { type: "f", value: defaultThickness },
		outlineColor: { type: "c", value: defaultColor },
		outlineAlpha: { type: "f", value: defaultAlpha }
	};

	var vertexShaderChunk = [

		"uniform float outlineThickness;",

		"vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {",

		"	float thickness = outlineThickness;",
		"	float ratio = 1.0;", // TODO: support outline thickness ratio for each vertex
		"	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );",
		// NOTE: subtract pos2 from pos because BackSide objectNormal is negative
		"	vec4 norm = normalize( pos - pos2 );",
		"	return pos + norm * thickness * pos.w * ratio;",

		"}",

	].join( "\n" );

	var vertexShaderChunk2 = [

		"#if ! defined( LAMBERT ) && ! defined( PHONG ) && ! defined( PHYSICAL )",

		"	#ifndef USE_ENVMAP",
		"		vec3 objectNormal = normalize( normal );",

		"		#ifdef FLIP_SIDED",
		"			objectNormal = -objectNormal;",
		"		#endif",

		"	#endif",

		"#endif",

		"#ifdef USE_SKINNING",
		"	gl_Position = calculateOutline( gl_Position, objectNormal, skinned );",
		"#else",
		"	gl_Position = calculateOutline( gl_Position, objectNormal, vec4( transformed, 1.0 ) );",
		"#endif",

	].join( "\n" );

	var fragmentShader = [

		"#include <common>",
		"#include <fog_pars_fragment>",

		"uniform vec3 outlineColor;",
		"uniform float outlineAlpha;",

		"void main() {",

		"	gl_FragColor = vec4( outlineColor, outlineAlpha );",

		"	#include <fog_fragment>",

		"}",

	].join( "\n" );

	function createMaterial ( originalMaterial ) {

		var shaderID = shaderIDs[ originalMaterial.type ];
		var originalUniforms, originalVertexShader;
		var outlineParameters = originalMaterial.outlineParameters;

		if ( shaderID !== undefined ) {

			var shader = THREE.ShaderLib[ shaderID ];
			originalUniforms = shader.uniforms;
			originalVertexShader = shader.vertexShader;

		} else if ( originalMaterial.isShaderMaterial === true ) {

			originalUniforms = originalMaterial.uniforms;
			originalVertexShader = originalMaterial.vertexShader;

		} else {

			return invisibleMaterial;

		}

		var uniforms = THREE.UniformsUtils.merge( [
			originalUniforms,
			uniformsChunk
		] );

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

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( uniforms ),
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.BackSide,
			//wireframe: true,
			skinning: false,
			morphTargets: false,
			morphNormals: false,
			fog: false
		} );

		return material;

	}

	function createMultiMaterial ( originalMaterial ) {

		var materials = [];

		for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

			materials.push( createMaterial( originalMaterial.materials[ i ] ) );

		}

		return new THREE.MultiMaterial( materials );

	}

	function setOutlineMaterial ( object ) {

		if ( object.material === undefined ) return;

		object.userData.originalMaterial = object.material;

		if ( object.userData.outlineMaterial === undefined ) {

			object.userData.outlineMaterial = object.material.type === 'MultiMaterial' ? createMultiMaterial( object.material ) : createMaterial( object.material );

		}

		if ( object.userData.outlineMaterial.type === 'MultiMaterial' ) {

			updateOutlineMultiMaterial( object.userData.outlineMaterial, object.userData.originalMaterial );

		} else {

			updateOutlineMaterial( object.userData.outlineMaterial, object.userData.originalMaterial );

		}

		object.material = object.userData.outlineMaterial;

	}

	function updateOutlineMaterial ( material, originalMaterial ) {

		if ( material === invisibleMaterial ) return;

		var outlineParameters = originalMaterial.outlineParameters;

		material.skinning = originalMaterial.skinning;
		material.morphTargets = originalMaterial.morphTargets;
		material.morphNormals = originalMaterial.morphNormals;
		material.fog = originalMaterial.fog;
		material.visible = originalMaterial.visible;
		material.uniforms.outlineAlpha.value = originalMaterial.opacity;

		if ( outlineParameters !== undefined ) {

			if ( outlineParameters.thickness !== undefined ) material.uniforms.outlineThickness.value = outlineParameters.thickness;
			if ( outlineParameters.color !== undefined ) material.uniforms.outlineColor.value.copy( outlineParameters.color );
			if ( outlineParameters.alpha !== undefined ) material.uniforms.outlineAlpha.value = outlineParameters.alpha;
			if ( outlineParameters.visible !== undefined ) material.visible = outlineParameters.visible;

		}

		if ( material.uniforms.outlineAlpha.value < 1.0 ) material.transparent = true;

	}

	function updateOutlineMultiMaterial ( material, originalMaterial ) {

		var outlineParameters = originalMaterial.outlineParameters;

		material.visible = originalMaterial.visible;

		if ( outlineParameters !== undefined ) {

			if ( outlineParameters.visible !== undefined ) material.visible = outlineParameters.visible;

		}

		for ( var i = 0, il = material.materials.length; i < il; i ++ ) {

			updateOutlineMaterial( material.materials[ i ], originalMaterial.materials[ i ] );

		}

	}

	function restoreOriginalMaterial ( object ) {

		if ( object.userData.originalMaterial !== undefined ) object.material = object.userData.originalMaterial;

	}

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera, renderTarget, forceClear ) {

		var currentAutoClear = renderer.autoClear;
		renderer.autoClear = this.autoClear;

		// 1. render normally
		renderer.render( scene, camera, renderTarget, forceClear );

		// 2. render outline
		var currentSceneAutoUpdate = scene.autoUpdate;
		var currentShadowMapEnabled = renderer.shadowMap.enabled;

		scene.autoUpdate = false;
		renderer.autoClear = false;
		renderer.shadowMap.enabled = false;

		scene.traverse( setOutlineMaterial );

		renderer.render( scene, camera, renderTarget );

		scene.traverse( restoreOriginalMaterial );

		scene.autoUpdate = currentSceneAutoUpdate;
		renderer.autoClear = currentAutoClear;
		renderer.shadowMap.enabled = currentShadowMapEnabled;

	};

};
