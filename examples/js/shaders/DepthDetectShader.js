/**
 * @author guowei https://guoweish.github.io/
 *
 * Depth-of-field according to camera view range shader
 */

THREE.DepthDetectShader = {
  vertexShader: [
		"void main() {",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
  ].join( "\n" ),

  fragmentShader: [
    "void main() {",
      "gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0,1.0);",
    "}"
  ].join( "\n" )
}