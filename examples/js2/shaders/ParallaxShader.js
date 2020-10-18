"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ParallaxShader = void 0;
var ParallaxShader = {
  modes: {
    none: "NO_PARALLAX",
    basic: "USE_BASIC_PARALLAX",
    steep: "USE_STEEP_PARALLAX",
    occlusion: "USE_OCLUSION_PARALLAX",
    relief: "USE_RELIEF_PARALLAX"
  },
  uniforms: {
    "bumpMap": {
      value: null
    },
    "map": {
      value: null
    },
    "parallaxScale": {
      value: null
    },
    "parallaxMinLayers": {
      value: null
    },
    "parallaxMaxLayers": {
      value: null
    }
  },
  vertexShader: ["varying vec2 vUv;", "varying vec3 vViewPosition;", "varying vec3 vNormal;", "void main() {", "	vUv = uv;", "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "	vViewPosition = -mvPosition.xyz;", "	vNormal = normalize( normalMatrix * normal );", "	gl_Position = projectionMatrix * mvPosition;", "}"].join("\n"),
  fragmentShader: ["uniform sampler2D bumpMap;", "uniform sampler2D map;", "uniform float parallaxScale;", "uniform float parallaxMinLayers;", "uniform float parallaxMaxLayers;", "varying vec2 vUv;", "varying vec3 vViewPosition;", "varying vec3 vNormal;", "#ifdef USE_BASIC_PARALLAX", "	vec2 parallaxMap( in vec3 V ) {", "		float initialHeight = texture2D( bumpMap, vUv ).r;", "		vec2 texCoordOffset = parallaxScale * V.xy * initialHeight;", "		return vUv - texCoordOffset;", "	}", "#else", "	vec2 parallaxMap( in vec3 V ) {", "		float numLayers = mix( parallaxMaxLayers, parallaxMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );", "		float layerHeight = 1.0 / numLayers;", "		float currentLayerHeight = 0.0;", "		vec2 dtex = parallaxScale * V.xy / V.z / numLayers;", "		vec2 currentTextureCoords = vUv;", "		float heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;", "		for ( int i = 0; i < 30; i += 1 ) {", "			if ( heightFromTexture <= currentLayerHeight ) {", "				break;", "			}", "			currentLayerHeight += layerHeight;", "			currentTextureCoords -= dtex;", "			heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;", "		}", "		#ifdef USE_STEEP_PARALLAX", "			return currentTextureCoords;", "		#elif defined( USE_RELIEF_PARALLAX )", "			vec2 deltaTexCoord = dtex / 2.0;", "			float deltaHeight = layerHeight / 2.0;", "			currentTextureCoords += deltaTexCoord;", "			currentLayerHeight -= deltaHeight;", "			const int numSearches = 5;", "			for ( int i = 0; i < numSearches; i += 1 ) {", "				deltaTexCoord /= 2.0;", "				deltaHeight /= 2.0;", "				heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;", "				if( heightFromTexture > currentLayerHeight ) {", "					currentTextureCoords -= deltaTexCoord;", "					currentLayerHeight += deltaHeight;", "				} else {", "					currentTextureCoords += deltaTexCoord;", "					currentLayerHeight -= deltaHeight;", "				}", "			}", "			return currentTextureCoords;", "		#elif defined( USE_OCLUSION_PARALLAX )", "			vec2 prevTCoords = currentTextureCoords + dtex;", "			float nextH = heightFromTexture - currentLayerHeight;", "			float prevH = texture2D( bumpMap, prevTCoords ).r - currentLayerHeight + layerHeight;", "			float weight = nextH / ( nextH - prevH );", "			return prevTCoords * weight + currentTextureCoords * ( 1.0 - weight );", "		#else", "			return vUv;", "		#endif", "	}", "#endif", "vec2 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {", "	vec2 texDx = dFdx( vUv );", "	vec2 texDy = dFdy( vUv );", "	vec3 vSigmaX = dFdx( surfPosition );", "	vec3 vSigmaY = dFdy( surfPosition );", "	vec3 vR1 = cross( vSigmaY, surfNormal );", "	vec3 vR2 = cross( surfNormal, vSigmaX );", "	float fDet = dot( vSigmaX, vR1 );", "	vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );", "	vec3 vProjVtex;", "	vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;", "	vProjVtex.z = dot( surfNormal, viewPosition );", "	return parallaxMap( vProjVtex );", "}", "void main() {", "	vec2 mapUv = perturbUv( -vViewPosition, normalize( vNormal ), normalize( vViewPosition ) );", "	gl_FragColor = texture2D( map, mapUv );", "}"].join("\n")
};
THREE.ParallaxShader = ParallaxShader;