/**
 * @author daoshengmu / http://dsmu.me/
 *
 * ------------------------------------------------------------------------------------------
 * Subsurface Scattering shader
 * Base on GDC 2011 – Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look
 * https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/
 *------------------------------------------------------------------------------------------
 */

THREE.TranslucentShader = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ "common" ],
		THREE.UniformsLib[ "lights" ],
		{
			"color": { value: new THREE.Color( 0xffffff ) },
			"diffuse": { value: new THREE.Color( 0xffffff ) },
			"specular": { value: new THREE.Color( 0xffffff ) },
			"emissive": { value: new THREE.Color( 0x000000 ) },
			"opacity": { value: 1 },
			"shininess": { value: 1 },

			"thicknessMap": { value: null },
			"thicknessColor": { value: new THREE.Color( 0xffffff ) },
			"thicknessDistortion": { value: 0.1 },
			"thicknessAmbient": { value: 0.0 },
			"thicknessAttenuation": { value: 0.1 },
			"thicknessPower": { value: 2.0 },
			"thicknessScale": { value: 10.0 }
		}

	] ),

	vertexShader: [

		"varying vec3 vNormal;",
		"varying vec2 vUv;",

		"varying vec3 vViewPosition;",

		THREE.ShaderChunk[ "common" ],

		"void main() {",

		"	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

		"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

		"	vViewPosition = -mvPosition.xyz;",

		"	vNormal = normalize( normalMatrix * normal );",

		"	vUv = uv;",

		"	gl_Position = projectionMatrix * mvPosition;",

		"}",

	].join( "\n" ),

	fragmentShader: [
		"#define USE_UV",
		"#define PHONG",
		"#define TRANSLUCENT",
		"#include <common>",
		"#include <bsdfs>",
		"#include <uv_pars_fragment>",
		"#include <map_pars_fragment>",
		"#include <lights_phong_pars_fragment>",

		"varying vec3 vColor;",

		"uniform vec3 diffuse;",
		"uniform vec3 specular;",
		"uniform vec3 emissive;",
		"uniform float opacity;",
		"uniform float shininess;",

		// Translucency
		"uniform sampler2D thicknessMap;",
		"uniform float thicknessPower;",
		"uniform float thicknessScale;",
		"uniform float thicknessDistortion;",
		"uniform float thicknessAmbient;",
		"uniform float thicknessAttenuation;",
		"uniform vec3 thicknessColor;",

		THREE.ShaderChunk[ "lights_pars_begin" ],

		"void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {",
		"	vec3 thickness = thicknessColor * texture2D(thicknessMap, uv).r;",
		"	vec3 scatteringHalf = normalize(directLight.direction + (geometry.normal * thicknessDistortion));",
		"	float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;",
		"	vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;",
		"	reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;",
		"}",

		"void main() {",

		"	vec3 normal = normalize( vNormal );",

		"	vec3 viewerDirection = normalize( vViewPosition );",

		"	vec4 diffuseColor = vec4( diffuse, opacity );",
		"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",

		THREE.ShaderChunk[ "map_fragment" ],
		THREE.ShaderChunk[ "color_fragment" ],
		THREE.ShaderChunk[ "specularmap_fragment" ],

		"	vec3 totalEmissiveRadiance = emissive;",

		THREE.ShaderChunk[ "lights_phong_fragment" ],

		// Doing lights fragment begin.
		"	GeometricContext geometry;",
		"	geometry.position = - vViewPosition;",
		"	geometry.normal = normal;",
		"	geometry.viewDir = normalize( vViewPosition );",

		"	IncidentLight directLight;",

		"	#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )",

		"		PointLight pointLight;",

		"		#pragma unroll_loop",
		"		for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {",
		"		 	pointLight = pointLights[ i ];",
		"		 	getPointDirectLightIrradiance( pointLight, geometry, directLight );",

		"			#ifdef USE_SHADOWMAP",
		"			directLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;",
		"			#endif",

		"			RE_Direct( directLight, geometry, material, reflectedLight );",

		"			#if defined( TRANSLUCENT ) && defined( USE_UV )",
		"			RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);",
		"			#endif",
		"		}",

		"		#endif",

		"	#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )",

		"		DirectionalLight directionalLight;",

		"		#pragma unroll_loop",
		"		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {",
		"			directionalLight = directionalLights[ i ];",
		"			getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );",

		"			#ifdef USE_SHADOWMAP",
		"			directLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;",
		"			#endif",

		"			RE_Direct( directLight, geometry, material, reflectedLight );",

		"			#if defined( TRANSLUCENT ) && defined( USE_UV )",
		"			RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);",
		"			#endif",
		"		}",

		"	#endif",

		"	#if defined( RE_IndirectDiffuse )",

		"		vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );",

		"		#if ( NUM_HEMI_LIGHTS > 0 )",

		"			#pragma unroll_loop",
		"			for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {",

		"				irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );",

		"			}",

		"		#endif",

		"	#endif",

		"	#if defined( RE_IndirectSpecular )",

		"		vec3 radiance = vec3( 0.0 );",
		"		vec3 clearCoatRadiance = vec3( 0.0 );",

		"	#endif",
		THREE.ShaderChunk[ "lights_fragment_end" ],

		"	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",
		"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",	// TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects

		THREE.ShaderChunk[ "encodings_fragment" ],

		"}"

	].join( "\n" ),

};
