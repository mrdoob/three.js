/**
 * @author @mattdesl / Matt DesLauriers
 *
 * Lookup-table based transforms.
 * http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter24.html
 * 
 * NOTE: This shader requires RawShaderMaterial.
 */

THREE.CubeLUTShader = {

  uniforms: {

    "lutSize": { type: "f", value: 32 },
    "tLookup": { type: "t", value: null },
    "tDiffuse": { type: "t", value: null },
    "enabled": { type: "i", value: true }

  },

  vertexShader: [

    "#version 300 es",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 modelViewMatrix;",
    "in vec4 position;",
    "in vec2 uv;",
    "out vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * position;",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "#version 300 es",
    "precision mediump float;",
    "precision highp sampler3D;",
    
    "uniform float lutSize;",
    "uniform sampler2D tDiffuse;",
    "uniform sampler3D tLookup;",
    "uniform bool enabled;",

    "in vec2 vUv;",
    "out vec4 fragColor;",

    "void main() {",

      "vec4 rawColor = texture(tDiffuse, vUv);",
      "if ( enabled ) {",
        "vec3 scale = vec3((lutSize - 1.0) / lutSize);",
        "vec3 offset = vec3(1.0 / (2.0 * lutSize));",
        "fragColor.rgb = texture(tLookup, scale * rawColor.rgb + offset).rgb;",
        "fragColor.a = rawColor.a;",
      "} else {",
        "fragColor = rawColor;",
      "}",

    "}"

  ].join( "\n" )

};
