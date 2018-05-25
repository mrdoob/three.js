/**
 * @author guowei https://guoweish.github.io/
 *
 * Depth-of-field according to camera view range shader
 */

THREE.DepthRangeDofShader = {
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
  ].join( "\n" ),

  fragmentShader: [
    "varying vec2 vUv;",
    "uniform float nearZ;",
    "uniform float farZ;",
    "uniform float focusRange;",
    "uniform sampler2D blurTex;",
    "uniform sampler2D depthTex;",
    "uniform sampler2D normalTex;",
    
    "float calculateBlurRatio(float depth, float nearZ, float farZ) {",
      "float ratio = 1.0;",
      "float focusRange = (farZ - nearZ) / 5.0;",
  
      "if(depth <= nearZ) {",
        "if(depth > (nearZ - focusRange)) {",
          "ratio = (nearZ - depth) / focusRange;",
        "}",
      "}",
  
      "if(depth >= farZ) {",
        "if(depth < (farZ + focusRange)) {",
          "ratio = (depth - farZ) / focusRange;",
        "}",
      "}",
  
      "return ratio;",
    "}",
    
    "void main() {",
      "float depth = texture2D(depthTex,vUv).r;",
      "vec4 normalColor = texture2D(normalTex,vUv);",
      "vec4 blurColor = texture2D(blurTex,vUv);",
      "float ratio = 0.0;",
      "if(depth <= nearZ || depth >= farZ) {",
        "ratio = calculateBlurRatio(depth, nearZ, farZ);",
      "}",
      "gl_FragColor = mix(normalColor,blurColor,ratio);",
    "}"
  ].join( "\n" )
}