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

const ToonShader1 = {

	uniforms: {

		'uDirLightPos': { value: new Vector3() },
		'uDirLightColor': { value: new Color( 0xeeeeee ) },

		'uAmbientLightColor': { value: new Color( 0x050505 ) },

		'uBaseColor': { value: new Color( 0xffffff ) }

	},

	vertexShader: /* glsl */`

		varying vec3 vNormal;
		varying vec3 vRefract;

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			vec3 worldNormal = normalize ( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

			vNormal = normalize( normalMatrix * normal );

			vec3 I = worldPosition.xyz - cameraPosition;
			vRefract = refract( normalize( I ), worldNormal, 1.02 );

			gl_Position = projectionMatrix * mvPosition;

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 uBaseColor;

		uniform vec3 uDirLightPos;
		uniform vec3 uDirLightColor;

		uniform vec3 uAmbientLightColor;

		varying vec3 vNormal;

		varying vec3 vRefract;

		void main() {

			float directionalLightWeighting = max( dot( normalize( vNormal ), uDirLightPos ), 0.0);
			vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;

			float intensity = smoothstep( - 0.5, 1.0, pow( length(lightWeighting), 20.0 ) );
			intensity += length(lightWeighting) * 0.2;

			float cameraWeighting = dot( normalize( vNormal ), vRefract );
			intensity += pow( 1.0 - length( cameraWeighting ), 6.0 );
			intensity = intensity * 0.2 + 0.3;

			if ( intensity < 0.50 ) {

				gl_FragColor = vec4( 2.0 * intensity * uBaseColor, 1.0 );

			} else {

				gl_FragColor = vec4( 1.0 - 2.0 * ( 1.0 - intensity ) * ( 1.0 - uBaseColor ), 1.0 );

			}

			#include <colorspace_fragment>

		}`

};

const ToonShader2 = {

	uniforms: {

		'uDirLightPos': { value: new Vector3() },
		'uDirLightColor': { value: new Color( 0xeeeeee ) },

		'uAmbientLightColor': { value: new Color( 0x050505 ) },

		'uBaseColor': { value: new Color( 0xeeeeee ) },
		'uLineColor1': { value: new Color( 0x808080 ) },
		'uLineColor2': { value: new Color( 0x000000 ) },
		'uLineColor3': { value: new Color( 0x000000 ) },
		'uLineColor4': { value: new Color( 0x000000 ) }

	},

	vertexShader: /* glsl */`

		varying vec3 vNormal;

		void main() {

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			vNormal = normalize( normalMatrix * normal );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 uBaseColor;
		uniform vec3 uLineColor1;
		uniform vec3 uLineColor2;
		uniform vec3 uLineColor3;
		uniform vec3 uLineColor4;

		uniform vec3 uDirLightPos;
		uniform vec3 uDirLightColor;

		uniform vec3 uAmbientLightColor;

		varying vec3 vNormal;

		void main() {

			float camera = max( dot( normalize( vNormal ), vec3( 0.0, 0.0, 1.0 ) ), 0.4);
			float light = max( dot( normalize( vNormal ), uDirLightPos ), 0.0);

			gl_FragColor = vec4( uBaseColor, 1.0 );

			if ( length(uAmbientLightColor + uDirLightColor * light) < 1.00 ) {

				gl_FragColor *= vec4( uLineColor1, 1.0 );

			}

			if ( length(uAmbientLightColor + uDirLightColor * camera) < 0.50 ) {

				gl_FragColor *= vec4( uLineColor2, 1.0 );

			}

			#include <colorspace_fragment>

		}`

};

const ToonShaderHatching = {

	uniforms: {

		'uDirLightPos':	{ value: new Vector3() },
		'uDirLightColor': { value: new Color( 0xeeeeee ) },

		'uAmbientLightColor': { value: new Color( 0x050505 ) },

		'uBaseColor': { value: new Color( 0xffffff ) },
		'uLineColor1': { value: new Color( 0x000000 ) },
		'uLineColor2': { value: new Color( 0x000000 ) },
		'uLineColor3': { value: new Color( 0x000000 ) },
		'uLineColor4': { value: new Color( 0x000000 ) }

	},

	vertexShader: /* glsl */`

		varying vec3 vNormal;

		void main() {

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			vNormal = normalize( normalMatrix * normal );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 uBaseColor;
		uniform vec3 uLineColor1;
		uniform vec3 uLineColor2;
		uniform vec3 uLineColor3;
		uniform vec3 uLineColor4;

		uniform vec3 uDirLightPos;
		uniform vec3 uDirLightColor;

		uniform vec3 uAmbientLightColor;

		varying vec3 vNormal;

		void main() {

			float directionalLightWeighting = max( dot( normalize(vNormal), uDirLightPos ), 0.0);
			vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;

			gl_FragColor = vec4( uBaseColor, 1.0 );

			if ( length(lightWeighting) < 1.00 ) {

				if ( mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {

					gl_FragColor = vec4( uLineColor1, 1.0 );

				}

			}

			if ( length(lightWeighting) < 0.75 ) {

				if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {

					gl_FragColor = vec4( uLineColor2, 1.0 );

				}

			}

			if ( length(lightWeighting) < 0.50 ) {

				if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {

					gl_FragColor = vec4( uLineColor3, 1.0 );

				}

			}

			if ( length(lightWeighting) < 0.3465 ) {

				if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {

					gl_FragColor = vec4( uLineColor4, 1.0 );

			}

			}

			#include <colorspace_fragment>

		}`

};

const ToonShaderDotted = {

	uniforms: {

		'uDirLightPos':	{ value: new Vector3() },
		'uDirLightColor': { value: new Color( 0xeeeeee ) },

		'uAmbientLightColor': { value: new Color( 0x050505 ) },

		'uBaseColor': { value: new Color( 0xffffff ) },
		'uLineColor1': { value: new Color( 0x000000 ) }

	},

	vertexShader: /* glsl */`

		varying vec3 vNormal;

		void main() {

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			vNormal = normalize( normalMatrix * normal );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 uBaseColor;
		uniform vec3 uLineColor1;
		uniform vec3 uLineColor2;
		uniform vec3 uLineColor3;
		uniform vec3 uLineColor4;

		uniform vec3 uDirLightPos;
		uniform vec3 uDirLightColor;

		uniform vec3 uAmbientLightColor;

		varying vec3 vNormal;

		void main() {

			float directionalLightWeighting = max( dot( normalize(vNormal), uDirLightPos ), 0.0);
			vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;

			gl_FragColor = vec4( uBaseColor, 1.0 );

			if ( length(lightWeighting) < 1.00 ) {

				if ( ( mod(gl_FragCoord.x, 4.001) + mod(gl_FragCoord.y, 4.0) ) > 6.00 ) {

					gl_FragColor = vec4( uLineColor1, 1.0 );

				}

			}

			if ( length(lightWeighting) < 0.50 ) {

				if ( ( mod(gl_FragCoord.x + 2.0, 4.001) + mod(gl_FragCoord.y + 2.0, 4.0) ) > 6.00 ) {

					gl_FragColor = vec4( uLineColor1, 1.0 );

				}

			}

			#include <colorspace_fragment>

		}`

};

export { ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted };
