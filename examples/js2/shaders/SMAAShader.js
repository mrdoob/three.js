"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SMAABlendShader = THREE.SMAAWeightsShader = THREE.SMAAEdgesShader = void 0;
var SMAAEdgesShader = {
  defines: {
    "SMAA_THRESHOLD": "0.1"
  },
  uniforms: {
    "tDiffuse": {
      value: null
    },
    "resolution": {
      value: new THREE.Vector2(1 / 1024, 1 / 512)
    }
  },
  vertexShader: ["uniform vec2 resolution;", "varying vec2 vUv;", "varying vec4 vOffset[ 3 ];", "void SMAAEdgeDetectionVS( vec2 texcoord ) {", "	vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 );", "	vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 );", "	vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 );", "}", "void main() {", "	vUv = uv;", "	SMAAEdgeDetectionVS( vUv );", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "varying vec4 vOffset[ 3 ];", "vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {", "	vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );", "	vec4 delta;", "	vec3 C = texture2D( colorTex, texcoord ).rgb;", "	vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;", "	vec3 t = abs( C - Cleft );", "	delta.x = max( max( t.r, t.g ), t.b );", "	vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;", "	t = abs( C - Ctop );", "	delta.y = max( max( t.r, t.g ), t.b );", "	vec2 edges = step( threshold, delta.xy );", "	if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )", "		discard;", "	vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;", "	t = abs( C - Cright );", "	delta.z = max( max( t.r, t.g ), t.b );", "	vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;", "	t = abs( C - Cbottom );", "	delta.w = max( max( t.r, t.g ), t.b );", "	float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );", "	vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;", "	t = abs( C - Cleftleft );", "	delta.z = max( max( t.r, t.g ), t.b );", "	vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;", "	t = abs( C - Ctoptop );", "	delta.w = max( max( t.r, t.g ), t.b );", "	maxDelta = max( max( maxDelta, delta.z ), delta.w );", "	edges.xy *= step( 0.5 * maxDelta, delta.xy );", "	return vec4( edges, 0.0, 0.0 );", "}", "void main() {", "	gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );", "}"].join("\n")
};
THREE.SMAAEdgesShader = SMAAEdgesShader;
var SMAAWeightsShader = {
  defines: {
    "SMAA_MAX_SEARCH_STEPS": "8",
    "SMAA_AREATEX_MAX_DISTANCE": "16",
    "SMAA_AREATEX_PIXEL_SIZE": "( 1.0 / vec2( 160.0, 560.0 ) )",
    "SMAA_AREATEX_SUBTEX_SIZE": "( 1.0 / 7.0 )"
  },
  uniforms: {
    "tDiffuse": {
      value: null
    },
    "tArea": {
      value: null
    },
    "tSearch": {
      value: null
    },
    "resolution": {
      value: new Vector2(1 / 1024, 1 / 512)
    }
  },
  vertexShader: ["uniform vec2 resolution;", "varying vec2 vUv;", "varying vec4 vOffset[ 3 ];", "varying vec2 vPixcoord;", "void SMAABlendingWeightCalculationVS( vec2 texcoord ) {", "	vPixcoord = texcoord / resolution;", "	vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 );", "	vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 );", "	vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );", "}", "void main() {", "	vUv = uv;", "	SMAABlendingWeightCalculationVS( vUv );", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )", "uniform sampler2D tDiffuse;", "uniform sampler2D tArea;", "uniform sampler2D tSearch;", "uniform vec2 resolution;", "varying vec2 vUv;", "varying vec4 vOffset[3];", "varying vec2 vPixcoord;", "#if __VERSION__ == 100", "vec2 round( vec2 x ) {", "	return sign( x ) * floor( abs( x ) + 0.5 );", "}", "#endif", "float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {", "	e.r = bias + e.r * scale;", "	return 255.0 * texture2D( searchTex, e, 0.0 ).r;", "}", "float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {", "	vec2 e = vec2( 0.0, 1.0 );", "	for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", "		e = texture2D( edgesTex, texcoord, 0.0 ).rg;", "		texcoord -= vec2( 2.0, 0.0 ) * resolution;", "		if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;", "	}", "	texcoord.x += 0.25 * resolution.x;", "	texcoord.x += resolution.x;", "	texcoord.x += 2.0 * resolution.x;", "	texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);", "	return texcoord.x;", "}", "float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {", "	vec2 e = vec2( 0.0, 1.0 );", "	for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", "		e = texture2D( edgesTex, texcoord, 0.0 ).rg;", "		texcoord += vec2( 2.0, 0.0 ) * resolution;", "		if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;", "	}", "	texcoord.x -= 0.25 * resolution.x;", "	texcoord.x -= resolution.x;", "	texcoord.x -= 2.0 * resolution.x;", "	texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );", "	return texcoord.x;", "}", "float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {", "	vec2 e = vec2( 1.0, 0.0 );", "	for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", "		e = texture2D( edgesTex, texcoord, 0.0 ).rg;", "		texcoord += vec2( 0.0, 2.0 ) * resolution;", "		if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;", "	}", "	texcoord.y -= 0.25 * resolution.y;", "	texcoord.y -= resolution.y;", "	texcoord.y -= 2.0 * resolution.y;", "	texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 );", "	return texcoord.y;", "}", "float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {", "	vec2 e = vec2( 1.0, 0.0 );", "	for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", "		e = texture2D( edgesTex, texcoord, 0.0 ).rg;", "		texcoord -= vec2( 0.0, 2.0 ) * resolution;", "		if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;", "	}", "	texcoord.y += 0.25 * resolution.y;", "	texcoord.y += resolution.y;", "	texcoord.y += 2.0 * resolution.y;", "	texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 );", "	return texcoord.y;", "}", "vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {", "	vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;", "	texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );", "	texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;", "	return texture2D( areaTex, texcoord, 0.0 ).rg;", "}", "vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {", "	vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );", "	vec2 e = texture2D( edgesTex, texcoord ).rg;", "	if ( e.g > 0.0 ) {", "		vec2 d;", "		vec2 coords;", "		coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );", "		coords.y = offset[ 1 ].y;", "		d.x = coords.x;", "		float e1 = texture2D( edgesTex, coords, 0.0 ).r;", "		coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );", "		d.y = coords.x;", "		d = d / resolution.x - pixcoord.x;", "		vec2 sqrt_d = sqrt( abs( d ) );", "		coords.y -= 1.0 * resolution.y;", "		float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;", "		weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );", "	}", "	if ( e.r > 0.0 ) {", "		vec2 d;", "		vec2 coords;", "		coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );", "		coords.x = offset[ 0 ].x;", "		d.x = coords.y;", "		float e1 = texture2D( edgesTex, coords, 0.0 ).g;", "		coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );", "		d.y = coords.y;", "		d = d / resolution.y - pixcoord.y;", "		vec2 sqrt_d = sqrt( abs( d ) );", "		coords.y -= 1.0 * resolution.y;", "		float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;", "		weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );", "	}", "	return weights;", "}", "void main() {", "	gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );", "}"].join("\n")
};
THREE.SMAAWeightsShader = SMAAWeightsShader;
var SMAABlendShader = {
  uniforms: {
    "tDiffuse": {
      value: null
    },
    "tColor": {
      value: null
    },
    "resolution": {
      value: new Vector2(1 / 1024, 1 / 512)
    }
  },
  vertexShader: ["uniform vec2 resolution;", "varying vec2 vUv;", "varying vec4 vOffset[ 2 ];", "void SMAANeighborhoodBlendingVS( vec2 texcoord ) {", "	vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 );", "	vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 );", "}", "void main() {", "	vUv = uv;", "	SMAANeighborhoodBlendingVS( vUv );", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["uniform sampler2D tDiffuse;", "uniform sampler2D tColor;", "uniform vec2 resolution;", "varying vec2 vUv;", "varying vec4 vOffset[ 2 ];", "vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {", "	vec4 a;", "	a.xz = texture2D( blendTex, texcoord ).xz;", "	a.y = texture2D( blendTex, offset[ 1 ].zw ).g;", "	a.w = texture2D( blendTex, offset[ 1 ].xy ).a;", "	if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {", "		return texture2D( colorTex, texcoord, 0.0 );", "	} else {", "		vec2 offset;", "		offset.x = a.a > a.b ? a.a : -a.b;", "		offset.y = a.g > a.r ? -a.g : a.r;", "		if ( abs( offset.x ) > abs( offset.y )) {", "			offset.y = 0.0;", "		} else {", "			offset.x = 0.0;", "		}", "		vec4 C = texture2D( colorTex, texcoord, 0.0 );", "		texcoord += sign( offset ) * resolution;", "		vec4 Cop = texture2D( colorTex, texcoord, 0.0 );", "		float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );", "		C.xyz = pow(C.xyz, vec3(2.2));", "		Cop.xyz = pow(Cop.xyz, vec3(2.2));", "		vec4 mixed = mix(C, Cop, s);", "		mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));", "		return mixed;", "	}", "}", "void main() {", "	gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );", "}"].join("\n")
};
THREE.SMAABlendShader = SMAABlendShader;