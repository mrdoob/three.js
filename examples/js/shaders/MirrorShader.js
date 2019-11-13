/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.MirrorShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"side": { value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform int side;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec2 p = vUv;",
		"	if (side == 0){",
		"		if (p.x > 0.5) p.x = 1.0 - p.x;",
		"	}else if (side == 1){",
		"		if (p.x < 0.5) p.x = 1.0 - p.x;",
		"	}else if (side == 2){",
		"		if (p.y < 0.5) p.y = 1.0 - p.y;",
		"	}else if (side == 3){",
		"		if (p.y > 0.5) p.y = 1.0 - p.y;",
		"	} ",
		"	vec4 color = texture2D(tDiffuse, p);",
		"	gl_FragColor = color;",

		"}"

	].join( "\n" )

};
