/**
 * @author Halocom / https://github.com/Halocom | https://www.halocom.fr
 *
 * Matcap Shader
 * Based on https://github.com/msfeldstein/three-matcap-material
 *
 * tMatCap: THREE.ImageUtils.loadTexture( '/textures/matcap.jpg' )
 */

THREE.MatcapShader = {

	uniforms: {
        "tMatCap": { 
              type: 't', 
              value: null
        },
	},

	vertexShader: [

		"varying vec2 vN;",

        "void main() {",
        
            "vec4 p = vec4( position, 1. );",
        
            "vec3 e = normalize( vec3( modelViewMatrix * p ) );",
            "vec3 n = normalize( normalMatrix * normal );",
        
            "vec3 r = reflect( e, n );",
            "float m = 2. * sqrt( ",
                "pow( r.x, 2. ) + ",
                "pow( r.y, 2. ) + ",
                "pow( r.z + 1., 2. ) ",
            ");",
            "vN = r.xy / m + .5;",
        
            "gl_Position = projectionMatrix * modelViewMatrix * p;",
        
        "}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tMatCap;",
        
        "varying vec2 vN;",
        
        "void main() {",
            
            "vec3 base = texture2D( tMatCap, vN ).rgb;",
            "gl_FragColor = vec4( base, 1. );",
        
        "}"

	].join( "\n" )
};