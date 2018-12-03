/**
 * @author greggnab
 *
 * 3DLUT based on color-adjust from
 * https://webglsamples.org
 */

THREE.LUTShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"lutMap":  { value: null },
		"lutMapSize": { value: 1, },
		"lutAmount": { value: 1, },
	},

	vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}

	`,

	fragmentShader: `

		#include <common>

		uniform sampler2D tDiffuse;
		uniform sampler2D lutMap;
		uniform float lutMapSize;
		uniform float lutAmount;

		varying vec2 vUv;

		vec4 sampleAs3DTexture( sampler2D tex, vec3 texCoord, float size ) {
			float sliceSize = 1.0 / size;                  // space of 1 slice
			float slicePixelSize = sliceSize / size;       // space of 1 pixel
			float width = size - 1.0;
			float sliceInnerSize = slicePixelSize * width; // space of size pixels
			float zSlice0 = floor( texCoord.z * width );
			float zSlice1 = min( zSlice0 + 1.0, width );
			float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
			float s0 = xOffset + ( zSlice0 * sliceSize );
			float s1 = xOffset + ( zSlice1 * sliceSize );
			float yRange = (texCoord.y * width + 0.5) / size;
			vec4 slice0Color = texture2D( tex, vec2( s0, yRange ) );
			vec4 slice1Color = texture2D( tex, vec2( s1, yRange ) );
			float zOffset = mod( texCoord.z * width, 1.0 );
			return mix( slice0Color, slice1Color, zOffset );
		}


		void main() {

			vec4 originalColor = texture2D( tDiffuse, vUv );
			vec4 mappedColor = sampleAs3DTexture( lutMap, originalColor.xyz, lutMapSize );

			gl_FragColor = mix( originalColor, mappedColor, lutAmount );

		}

	`,

};
