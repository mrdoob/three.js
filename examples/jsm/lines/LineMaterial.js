/**
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  dashOffset: <float>,
 *  gapSize: <float>,
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


UniformsLib.line = {

	worldUnits: { value: 1 },
	linewidth: { value: 1 },
	resolution: { value: new Vector2( 1, 1 ) },
	dashOffset: { value: 0 },
	dashScale: { value: 1 },
	dashSize: { value: 1 },
	gapSize: { value: 1 } // todo FIX - maybe change to totalSize

};

ShaderLib[ 'line' ] = {

	uniforms: UniformsUtils.merge( [
		UniformsLib.common,
		UniformsLib.fog,
		UniformsLib.line
	] ),

	vertexShader:
	/* glsl */`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
	/* glsl */`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		// https://iquilezles.org/articles/intersectors
		// https://www.shadertoy.com/view/Xt3SzX
		float capIntersect( in vec3 ro, in vec3 rd, in vec3 pa, in vec3 pb, in float ra ) {

			vec3  ba = pb - pa;
			vec3  oa = ro - pa;
			float baba = dot( ba, ba );
			float bard = dot( ba, rd );
			float baoa = dot( ba, oa );
			float rdoa = dot( rd, oa );
			float oaoa = dot( oa, oa );
			float a = baba        - bard * bard;
			float b = baba * rdoa - baoa * bard;
			float c = baba * oaoa - baoa * baoa - ra * ra * baba;
			float h = b * b - a * c;

			if( h >= 0.0 ) {

				float t = ( - b - sqrt( h ) ) / a;
				float y = baoa + t * bard;

				// body
				if( y > 0.0 && y < baba ) return t;

				// caps
				vec3 oc = y <= 0.0 ? oa : ro - pb;
				b = dot( rd, oc );
				c = dot( oc, oc ) - ra * ra;
				h = b * b - c;
				if( h > 0.0 ) return - b - sqrt(h);

			}

			return - 1.0;

		}

		// compute normal
		vec3 capNormal( in vec3 pos, in vec3 a, in vec3 b, in float r ) {

			vec3  ba = b - a;
			vec3  pa = pos - a;
			float h = clamp( dot( pa, ba ) / dot( ba, ba ), 0.0, 1.0 );
			return ( pa - h * ba ) / r;

		}

		// https://stackoverflow.com/questions/10264949/glsl-gl-fragcoord-z-calculation-and-setting-gl-fragdepth
		uniform mat4 projectionMatrix;
		float zToFragDepth( vec3 eye_space_pos ) {

			float far = gl_DepthRange.far;
			float near = gl_DepthRange.near;
			vec4 clip_space_pos = projectionMatrix * vec4( eye_space_pos, 1.0 );

			float ndc_depth = clip_space_pos.z / clip_space_pos.w;

			float depth = ( ( ( far - near ) * ndc_depth ) + near + far ) / 2.0;
			return depth;

		}


		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				#if defined( WRITE_WORLD_UNIT_DEPTH ) && ! defined( USE_DASH )

					// Find the closest points on the view ray and the line segment
					vec3 rayEnd = normalize( worldPos.xyz );
					float dist = capIntersect( vec3( 0, 0, 0 ), rayEnd, worldStart, worldEnd, linewidth * 0.5 );
					vec3 pos = rayEnd * dist;

					if ( dist < 0.0 ) {

						discard;

					}

					gl_FragDepth = zToFragDepth( pos );

				#else

					// Find the closest points on the view ray and the line segment
					vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
					vec3 lineDir = worldEnd - worldStart;
					vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

					vec3 p1 = worldStart + lineDir * params.x;
					vec3 p2 = rayEnd * params.y;
					vec3 delta = p1 - p2;
					float len = length( delta );
					float norm = len / linewidth;

					#ifndef USE_DASH

						#ifdef USE_ALPHA_TO_COVERAGE

							float dnorm = fwidth( norm );
							alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

						#else

							if ( norm > 0.5 ) {

								discard;

							}

						#endif

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

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

class LineMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( {

			type: 'LineMaterial',

			uniforms: UniformsUtils.clone( ShaderLib[ 'line' ].uniforms ),

			vertexShader: ShaderLib[ 'line' ].vertexShader,
			fragmentShader: ShaderLib[ 'line' ].fragmentShader,

			clipping: true // required for clipping support

		} );

		this.isLineMaterial = true;

		this.setValues( parameters );

	}

	get color() {

		return this.uniforms.diffuse.value;

	}

	set color( value ) {

		this.uniforms.diffuse.value = value;

	}

	get worldUnits() {

		return 'WORLD_UNITS' in this.defines;

	}

	set worldUnits( value ) {

		if ( value === true ) {

			this.defines.WORLD_UNITS = '';

		} else {

			delete this.defines.WORLD_UNITS;

		}

	}

	get adjustDepth() {

		return 'WRITE_WORLD_UNIT_DEPTH' in this.defines;

	}

	set adjustDepth( value ) {

		if ( value === true ) {

			this.defines.WRITE_WORLD_UNIT_DEPTH = '';

		} else {

			delete this.defines.WRITE_WORLD_UNIT_DEPTH;

		}

	}

	get linewidth() {

		return this.uniforms.linewidth.value;

	}

	set linewidth( value ) {

		if ( ! this.uniforms.linewidth ) return;
		this.uniforms.linewidth.value = value;

	}

	get dashed() {

		return 'USE_DASH' in this.defines;

	}

	set dashed( value ) {

		if ( ( value === true ) !== this.dashed ) {

			this.needsUpdate = true;

		}

		if ( value === true ) {

			this.defines.USE_DASH = '';

		} else {

			delete this.defines.USE_DASH;

		}

	}

	get dashScale() {

		return this.uniforms.dashScale.value;

	}

	set dashScale( value ) {

		this.uniforms.dashScale.value = value;

	}

	get dashSize() {

		return this.uniforms.dashSize.value;

	}

	set dashSize( value ) {

		this.uniforms.dashSize.value = value;

	}

	get dashOffset() {

		return this.uniforms.dashOffset.value;

	}

	set dashOffset( value ) {

		this.uniforms.dashOffset.value = value;

	}

	get gapSize() {

		return this.uniforms.gapSize.value;

	}

	set gapSize( value ) {

		this.uniforms.gapSize.value = value;

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

		} else {

			delete this.defines.USE_ALPHA_TO_COVERAGE;

		}

	}

}

export { LineMaterial };
