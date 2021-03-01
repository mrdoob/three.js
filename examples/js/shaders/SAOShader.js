/**
 * TODO
 */

THREE.SAOShader = {
	defines: {
		'NUM_SAMPLES': 7,
		'NUM_RINGS': 4,
		'NORMAL_TEXTURE': 0,
		'DIFFUSE_TEXTURE': 0,
		'DEPTH_PACKING': 1,
		'PERSPECTIVE_CAMERA': 1
	},
	uniforms: {

		'tDepth': { value: null },
		'tDiffuse': { value: null },
		'tNormal': { value: null },
		'size': { value: new THREE.Vector2( 512, 512 ) },

		'cameraNear': { value: 1 },
		'cameraFar': { value: 100 },
		'cameraProjectionMatrix': { value: new THREE.Matrix4() },
		'cameraInverseProjectionMatrix': { value: new THREE.Matrix4() },

		'scale': { value: 1.0 },
		'intensity': { value: 0.1 },
		'bias': { value: 0.5 },

		'minResolution': { value: 0.0 },
		'kernelRadius': { value: 100.0 },
		'randomSeed': { value: 0.0 }
	},
	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',
		'	vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'

	].join( '\n' ),
	fragmentShader: [
		'#include <common>',

		'varying vec2 vUv;',

		'#if DIFFUSE_TEXTURE == 1',
		'uniform sampler2D tDiffuse;',
		'#endif',

		'uniform sampler2D tDepth;',

		'#if NORMAL_TEXTURE == 1',
		'uniform sampler2D tNormal;',
		'#endif',

		'uniform float cameraNear;',
		'uniform float cameraFar;',
		'uniform mat4 cameraProjectionMatrix;',
		'uniform mat4 cameraInverseProjectionMatrix;',

		'uniform float scale;',
		'uniform float intensity;',
		'uniform float bias;',
		'uniform float kernelRadius;',
		'uniform float minResolution;',
		'uniform vec2 size;',
		'uniform float randomSeed;',

		'// RGBA depth',

		'#include <packing>',

		'vec4 getDefaultColor( const in vec2 screenPosition ) {',
		'	#if DIFFUSE_TEXTURE == 1',
		'	return texture2D( tDiffuse, vUv );',
		'	#else',
		'	return vec4( 1.0 );',
		'	#endif',
		'}',

		'float getDepth( const in vec2 screenPosition ) {',
		'	#if DEPTH_PACKING == 1',
		'	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );',
		'	#else',
		'	return texture2D( tDepth, screenPosition ).x;',
		'	#endif',
		'}',

		'float getViewZ( const in float depth ) {',
		'	#if PERSPECTIVE_CAMERA == 1',
		'	return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );',
		'	#else',
		'	return orthographicDepthToViewZ( depth, cameraNear, cameraFar );',
		'	#endif',
		'}',

		'vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {',
		'	float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];',
		'	vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );',
		'	clipPosition *= clipW; // unprojection.',

		'	return ( cameraInverseProjectionMatrix * clipPosition ).xyz;',
		'}',

		'vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {',
		'	#if NORMAL_TEXTURE == 1',
		'	return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );',
		'	#else',
		'	return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );',
		'	#endif',
		'}',

		'float scaleDividedByCameraFar;',
		'float minResolutionMultipliedByCameraFar;',

		'float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {',
		'	vec3 viewDelta = sampleViewPosition - centerViewPosition;',
		'	float viewDistance = length( viewDelta );',
		'	float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;',

		'	return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );',
		'}',

		'// moving costly divides into consts',
		'const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );',
		'const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );',

		'float getAmbientOcclusion( const in vec3 centerViewPosition ) {',
		'	// precompute some variables require in getOcclusion.',
		'	scaleDividedByCameraFar = scale / cameraFar;',
		'	minResolutionMultipliedByCameraFar = minResolution * cameraFar;',
		'	vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );',

		'	// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/',
		'	float angle = rand( vUv + randomSeed ) * PI2;',
		'	vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;',
		'	vec2 radiusStep = radius;',

		'	float occlusionSum = 0.0;',
		'	float weightSum = 0.0;',

		'	for( int i = 0; i < NUM_SAMPLES; i ++ ) {',
		'		vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;',
		'		radius += radiusStep;',
		'		angle += ANGLE_STEP;',

		'		float sampleDepth = getDepth( sampleUv );',
		'		if( sampleDepth >= ( 1.0 - EPSILON ) ) {',
		'			continue;',
		'		}',

		'		float sampleViewZ = getViewZ( sampleDepth );',
		'		vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );',
		'		occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );',
		'		weightSum += 1.0;',
		'	}',

		'	if( weightSum == 0.0 ) discard;',

		'	return occlusionSum * ( intensity / weightSum );',
		'}',


		'void main() {',
		'	float centerDepth = getDepth( vUv );',
		'	if( centerDepth >= ( 1.0 - EPSILON ) ) {',
		'		discard;',
		'	}',

		'	float centerViewZ = getViewZ( centerDepth );',
		'	vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );',

		'	float ambientOcclusion = getAmbientOcclusion( viewPosition );',

		'	gl_FragColor = getDefaultColor( vUv );',
		'	gl_FragColor.xyz *=  1.0 - ambientOcclusion;',
		'}'
	].join( '\n' )
};
