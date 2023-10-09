/**
 * parameters = {
 *  color: <hex>,
 *  pointWidth: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

import {
	ShaderLib,
	ShaderMaterial,
	UniformsLib,
	UniformsUtils,
	Vector2
} from 'three';


UniformsLib.fatPoints = {

	pointWidth: { value: 1 },
	resolution: { value: new Vector2( 1, 1 ) }

};

ShaderLib[ 'fatPoints' ] = {

	uniforms: UniformsUtils.merge( [
		UniformsLib.common,
		UniformsLib.fog,
		UniformsLib.fatPoints
	] ),

	vertexShader:
	/* glsl */`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float pointWidth;
		uniform vec2 resolution;

		attribute vec3 instancePosition;
		attribute vec3 instanceColor;

		varying vec2 vUv;

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = instanceColor;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 mvPos = modelViewMatrix * vec4( instancePosition, 1.0 );

			vUv = uv;

			// clip space
			vec4 clipPos = projectionMatrix * mvPos;

			// offset in ndc space
			vec2 offset = position.xy * pointWidth / resolution.x; // maybe resolution should be based on viewport ...
			offset.y *= aspect;

			// back to clip space
			offset *= clipPos.w;

			clipPos.xy += offset;

			gl_Position = clipPos;

			vec4 mvPosition = mvPos;

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
	/* glsl */`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float pointWidth;

		varying vec2 vUv;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		void main() {

			#include <clipping_planes_fragment>

			float alpha = opacity;

			float len2 = dot( vUv, vUv );

			#ifdef USE_ALPHA_TO_COVERAGE

				// artifacts appear on some hardware if a derivative is taken within a conditional

				float dlen = fwidth( len2 );

				alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

			#else

				if ( len2 > 1.0 ) discard;

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
};

class FatPointsMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( {

			type: 'FatPointsMaterial',

			uniforms: UniformsUtils.clone( ShaderLib[ 'fatPoints' ].uniforms ),

			vertexShader: ShaderLib[ 'fatPoints' ].vertexShader,
			fragmentShader: ShaderLib[ 'fatPoints' ].fragmentShader,

			clipping: true // required for clipping support

		} );

		this.isFatPointsMaterial = true;

		this.setValues( parameters );

	}

	get color() {

		return this.uniforms.diffuse.value;

	}

	set color( value ) {

		this.uniforms.diffuse.value = value;

	}

	get pointWidth() {

		return this.uniforms.pointWidth.value;

	}

	set pointWidth( value ) {

		if ( ! this.uniforms.pointWidth ) return;
		this.uniforms.pointWidth.value = value;

	}

	get opacity() {

		return this.uniforms.opacity.value;

	}

	set opacity( value ) {

		if ( ! this.uniforms ) return;
		this.uniforms.opacity.value = value;

	}

	get resolution() {

		return this.uniforms.resolution.value;

	}

	set resolution( value ) {

		this.uniforms.resolution.value.copy( value );

	}

	get alphaToCoverage() {

		return 'USE_ALPHA_TO_COVERAGE' in this.defines;

	}

	set alphaToCoverage( value ) {

		if ( ! this.defines ) return;

		if ( ( value === true ) !== this.alphaToCoverage ) {

			this.needsUpdate = true;

		}

		if ( value === true ) {

			this.defines.USE_ALPHA_TO_COVERAGE = '';
			this.extensions.derivatives = true;

		} else {

			delete this.defines.USE_ALPHA_TO_COVERAGE;
			this.extensions.derivatives = false;

		}

	}

}

export { FatPointsMaterial };
