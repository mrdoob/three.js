/**
 * @author robertcasanova / http://www.robertcasanova.it
 *
 * Create a "Low pixel" effect
 */

THREE.PixelateShader = {

    uniforms: {
        "tDiffuse": { value: null },
        "intensity": {value:1.0}
    },

    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [
        "varying vec2 vUv;",
        "uniform sampler2D tDiffuse;",
        "uniform vec2 u_resolution;",
        "uniform float intensity;",
        "vec3 bg(vec2 uv) {",
        "   return texture2D(tDiffuse, uv).rgb;",
        "}",
        "vec3 effect(vec2 uv, vec3 col) {",
        "   float granularity = floor(intensity*20.+10.);",
        "   if(mod(granularity,2.) > 0.) {",
        "       granularity += 1.0;",
        "   };",
        "   if(granularity > 10.0) {",
        "       float dx = granularity / u_resolution.x;",
        "       float dy = granularity / u_resolution.y;",
        "       uv = vec2(dx*(floor(uv.x/dx) + 0.5),dy*(floor(uv.y/dy) + 0.5));",
        "       return bg(uv);",
        "   };",
        "   return col;",
        "}",
        "void main() {",
        "   vec3 tex = bg(vUv);",
        "   vec3 col = effect(vUv,tex);",
        "   gl_FragColor = vec4( col, 1. );",
        "}"

    ].join( "\n" )

};
