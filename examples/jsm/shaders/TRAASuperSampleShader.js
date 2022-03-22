import {
	Color,
	Vector3
} from 'three';

/**
 * Currently contains:
 *
 *	toon1
 *	toon2
 *	hatching
 *	dotted
 */

const TRAASuperSampleShader = {

	defines: {
		DEPTH_PACKING: 1,
		PERSPECTIVE_CAMERA: 1,
	},

	uniforms: {
		jitterOffset: { value: new THREE.Vector2(0, 0) },
		currentBeauty: { value: null },
		previousBeauty: { value: null },
		tDepth: { value: null },
		tVelocity: { value: null },
		minSampleWeight: { value: 1.0 / 16.0 },
		mode: { value: 0 },
		cameraNearFar: { value: new THREE.Vector2() },
		textureSize: { value: new THREE.Vector2() },
		cameraProjectionMatrix: { value: new THREE.Matrix4() },
		cameraInverseProjectionMatrix: { value: new THREE.Matrix4() },
		cameraInverseViewMatrix: { value: new THREE.Matrix4() },
	},

	depthWrite: false,

	vertexShader:
		"varying vec2 vUv;\
void main() {\
  vUv = uv;\
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
}",

	fragmentShader: [
		"#include <common>",
		"varying vec2 vUv;",
		"uniform sampler2D currentBeauty;",
		"uniform sampler2D previousBeauty;",
		"uniform sampler2D tDepth;",
		"uniform sampler2D tVelocity;",
		"uniform vec2 textureSize;",
		"uniform mat4 prevProjectionViewMatrix;",
		"uniform mat4 currentProjectionViewMatrix;",
		"uniform mat4 cameraProjectionMatrix;",
		"uniform mat4 cameraInverseProjectionMatrix;",
		"uniform mat4 cameraInverseViewMatrix;",
		"uniform vec2 cameraNearFar;",
		"uniform float minSampleWeight;",
		"uniform int mode;",

		"#define MODE_MOVING 0",
		"#define MODE_STATIC 1",

		"#include <packing>",

		"float getDepth( const in vec2 screenPosition ) {",
		"	#if DEPTH_PACKING == 1",
		"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
		"	#else",
		"	return texture2D( tDepth, screenPosition ).x;",
		"	#endif",
		"}",

		"vec3 find_closest_fragment_9tap(const in vec2 uv) { ",
		"const vec3 offset = vec3(1.0, -1.0, 0.0);",
		"vec2 texelSize = 1.0/textureSize; ",

		"vec3 dtl = vec3(-1, 1, getDepth( uv + offset.yx * texelSize) ); ",
		"vec3 dtc = vec3( 0, 1, getDepth( uv + offset.zx * texelSize) );",
		"vec3 dtr = vec3( 1, 1, getDepth( uv + offset.xx * texelSize) );",

		"vec3 dml = vec3(-1, 0, getDepth( uv + offset.yz * texelSize) );",
		"vec3 dmc = vec3( 0, 0, getDepth( uv ) );",
		"vec3 dmr = vec3( 1, 0, getDepth( uv + offset.xz * texelSize) );",

		"vec3 dbl = vec3(-1, -1, getDepth( uv + offset.yy * texelSize) );",
		"vec3 dbc = vec3( 0, -1, getDepth( uv + offset.zy * texelSize) );",
		"vec3 dbr = vec3( 1, -1, getDepth( uv + offset.xy * texelSize) );",

		"vec3 dmin = dtl;",
		"if ( dmin.z > dtc.z ) dmin = dtc;",
		"if ( dmin.z > dtr.z ) dmin = dtr;",

		"if ( dmin.z > dml.z ) dmin = dml;",
		"if ( dmin.z > dmc.z ) dmin = dmc;",
		"if ( dmin.z > dmr.z ) dmin = dmr;",

		"if ( dmin.z > dbl.z ) dmin = dbl;",
		"if ( dmin.z > dbc.z ) dmin = dbc;",
		"if ( dmin.z > dbr.z ) dmin = dbr;",

		"return vec3(uv + texelSize.xy * dmin.xy, dmin.z);",
		"}",

		"vec3 find_closest_fragment_5tap(const in vec2 uv) ",
		"{ ",
		"vec2 offset = vec2(1.0, -1.0);",
		"vec2 texelSize = 1.0/textureSize; ",

		"vec3 dtl = vec3(-1, 1, getDepth( uv + offset.yx * texelSize ) ); ",
		"vec3 dtr = vec3( 1, 1, getDepth( uv + offset.xx * texelSize ) );",

		"vec3 dmc = vec3( 0, 0, getDepth( uv) );",

		"vec3 dbl = vec3(-1, -1, getDepth( uv + offset.yy * texelSize ) );",
		"vec3 dbr = vec3( 1, -1, getDepth( uv + offset.xy * texelSize ) );",

		"vec3 dmin = dtl;",
		"if ( dmin.z > dtr.z ) dmin = dtr;",
		"if ( dmin.z > dmc.z ) dmin = dmc;",

		"if ( dmin.z > dbl.z ) dmin = dbl;",
		"if ( dmin.z > dbr.z ) dmin = dbr;",

		"return vec3(uv + texelSize * dmin.xy, dmin.z);",
		"}",

		"vec4 clip_aabb(const in vec4 aabb_min, const in vec4 aabb_max, vec4 p )",
		"{ ",
		"const float FLT_EPS = 1e-8;",
		"vec4 p_clip = 0.5 * (aabb_max + aabb_min); ",
		"vec4 e_clip = 0.5 * (aabb_max - aabb_min) + FLT_EPS; ",

		"vec4 v_clip = p - p_clip;",
		"vec4 v_unit = abs(v_clip / e_clip);",
		"float mv_unit = max(v_unit.x, max(v_unit.y, v_unit.z));",

		"if (mv_unit > 1.0) ",
		"return p_clip + v_clip / mv_unit;",
		"else ",
		"return p;",
		"}",

		"vec2 getScreenSpaceVelocity( vec2 uv ) {",
		"vec4 value = texture2D(tVelocity, uv);",
		"if( value.x == 0.0 && value.y == 0.0 && value.z == 0.0 && value.w == 0.0 ) {",
		"return vec2( 0.0, 0.0 );",
		"}",
		"float vx = unpackRGToDepth(value.xy);",
		"float vy = unpackRGToDepth(value.zw);",
		"return vec2(2.*vx - 1., 2.*vy - 1.);",
		"}",

		"vec4 calculateTAA(const in vec2 uv, const in vec2 screenSpaceVelocity) {",
		"float _FeedbackMin = 1.0 - 2.0 * minSampleWeight;",
		"float _FeedbackMax = 1.0 - minSampleWeight;",
		"vec4 currentColor = texture2D(currentBeauty, uv);",
		"vec2 lookBackUV = uv - screenSpaceVelocity;",
		"vec4 previousColor = texture2D(previousBeauty, lookBackUV);",
		"const vec3 offset = vec3(1., -1., 0.);",
		"vec2 texelSize = 1./textureSize;",

		"vec4 ctl = texture2D(currentBeauty, uv + offset.yx * texelSize);",
		"vec4 ctc = texture2D(currentBeauty, uv + offset.zx * texelSize);",
		"vec4 ctr = texture2D(currentBeauty, uv + offset.xx * texelSize);",
		"vec4 cml = texture2D(currentBeauty, uv + offset.yz * texelSize);",
		"vec4 cmc = currentColor;//texture2D(currentBeauty, uv);",
		"vec4 cmr = texture2D(currentBeauty, uv + offset.xz * texelSize);",
		"vec4 cbl = texture2D(currentBeauty, uv + offset.yy * texelSize);",
		"vec4 cbc = texture2D(currentBeauty, uv + offset.zy * texelSize);",
		"vec4 cbr = texture2D(currentBeauty, uv + offset.xy * texelSize);",

		"vec4 cmin = min(ctl, min(ctc, min(ctr, min(cml, min(cmc, min(cmr, min(cbl, min(cbc, cbr))))))));",
		"vec4 cmax = max(ctl, max(ctc, max(ctr, max(cml, max(cmc, max(cmr, max(cbl, max(cbc, cbr))))))));",

		"vec4 cavg = (ctl + ctc + ctr + cml + cmc + cmr + cbl + cbc + cbr) / 9.0;",

		"vec4 cmin5 = min(ctc, min(cml, min(cmc, min(cmr, cbc))));",
		"vec4 cmax5 = max(ctc, max(cml, max(cmc, max(cmr, cbc))));",
		"vec4 cavg5 = (ctc + cml + cmc + cmr + cbc) / 5.0;",
		"cmin = 0.5 * (cmin + cmin5);",
		"cmax = 0.5 * (cmax + cmax5);",
		"cavg = 0.5 * (cavg + cavg5);",
		"vec4 clampedPreviousColor =clip_aabb(cmin, cmax, previousColor);",

		"float lum0 = linearToRelativeLuminance(currentColor.rgb);",
		"float lum1 = linearToRelativeLuminance(clampedPreviousColor.rgb);",
		"float unbiased_diff = abs(lum0 - lum1) / max(lum0, max(lum1, 0.2));",
		"float unbiased_weight = 1.0 - unbiased_diff;",
		"float unbiased_weight_sqr = unbiased_weight * unbiased_weight;",
		"float k_feedback = mix(_FeedbackMin, _FeedbackMax, unbiased_weight_sqr);",

		"vec2 previousVelocity = getScreenSpaceVelocity(lookBackUV);",

		// velocity field over 10 pixels.
		"k_feedback *= 1.0 - saturate( length( ( screenSpaceVelocity - previousVelocity ) / texelSize ) / 10.0 );",

		// deals with mirror and other transparent surfaces
		"k_feedback *= min( currentColor.a, clampedPreviousColor.a );",

		"if( mode == MODE_MOVING ) {",
		"return mix(currentColor, clampedPreviousColor, k_feedback);",
		"}",
		"else if( mode == MODE_STATIC ) {",
		"return mix(currentColor, mix( clampedPreviousColor, previousColor, pow2( previousColor.a ) ), 1.0 - pow( minSampleWeight, 0.75 ) );",
		"}",
		"else { // mode == MODE_RESET",
		"return currentColor;",
		"}",

		"}",

		"void main() {",

		"vec3 c_frag = find_closest_fragment_9tap(vUv);",

		"if( c_frag.z >= 1. ) {",

		"gl_FragColor = texture2D(currentBeauty, vUv);",

		"}",
		"else {",

		"vec2 screenSpaceVelocity = getScreenSpaceVelocity( vUv );",
		"gl_FragColor = calculateTAA(vUv, screenSpaceVelocity);",

		"}",
		"}",
	].join("\n"),
}
