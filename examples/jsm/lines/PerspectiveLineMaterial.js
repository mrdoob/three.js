/**
 * @author Nathaniel Tagg / http://github.com/nathanieltagg
 *
 * parameters = {
 *  color: <hex>,
 *  worldlinewidth: <float>,  // how fat is the line in 3d coordinates?
 *  minlinewidth: <float>,    // What is the miminum line width in pixels? (0 by default, set nonzero to keep line from vanishing no matter how far away)
 *  maxlinewidth: <float>,    // What is the maximum line width in pixels? (20 by default, keep the line from filling the screen)
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 * Much of the code below from excellent work by WestLangley / http://github.com/WestLangley
 */

import {
	ShaderLib,
	ShaderMaterial,
	UniformsLib,
	UniformsUtils,
	Vector2
} from "../../../build/three.module.js";

UniformsLib.perspectiveline = {

	worldlinewidth: { value: 0.3 },
	maxlinewidth: { value: 20 },
	minlinewidth: { value: 0 },
	resolution: { value: new Vector2( 1, 1 ) },
	dashScale: { value: 1 },
	dashSize: { value: 1 },
	gapSize: { value: 1 }
};

ShaderLib[ 'perspectiveline' ] = {

	uniforms: UniformsUtils.merge( [
		UniformsLib.common,
		UniformsLib.fog,
		UniformsLib.perspectiveline
	] ),

	vertexShader:
		`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float worldlinewidth;
		uniform float minlinewidth;
		uniform float maxlinewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

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

			#endif

      		float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

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
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
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

			// Adjust the line width according to how far this segment is away from us. I'm not 100% confident of my math here, but I believe that z/w is the
			// distance away from us this point is.  We muliply resolution.y/w to get to pixel space, which allows
			// us to apply the linewidth clamp, then move back.
      		float linewidth = abs(2.0*resolution.y*worldlinewidth*( (position.y<0.5)? (start.z/clipStart.w/clipStart.w) : (end.z/clipEnd.w/clipEnd.w) ));

    	 	linewidth = clamp(linewidth,minlinewidth,maxlinewidth);

			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
		`
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			vec4 diffuseColor = vec4( diffuse, opacity );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

			#include <premultiplied_alpha_fragment>
			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>

		}
		`
};

var PerspectiveLineMaterial = function ( parameters ) {

	ShaderMaterial.call( this, {

		type: 'PerspectiveLineMaterial',

		uniforms: UniformsUtils.clone( ShaderLib[ 'perspectiveline' ].uniforms ),

		vertexShader: ShaderLib[ 'perspectiveline' ].vertexShader,
		fragmentShader: ShaderLib[ 'perspectiveline' ].fragmentShader

	} );

	this.dashed = false;


	Object.defineProperties( this, {

		color: {

			enumerable: true,

			get: function () {

				return this.uniforms.diffuse.value;

			},

			set: function ( value ) {

				this.uniforms.diffuse.value = value;

			}

		},

		worldlinewidth: {

			enumerable: true,

			get: function () {

				return this.uniforms.worldlinewidth.value;

			},

			set: function ( value ) {

				this.uniforms.worldlinewidth.value = value;

			}

		},

		minlinewidth: {

			enumerable: true,

			get: function () {

				return this.uniforms.minlinewidth.value;

			},

			set: function ( value ) {

				this.uniforms.minlinewidth.value = value;

			}

		},


		maxlinewidth: {

			enumerable: true,

			get: function () {

				return this.uniforms.maxlinewidth.value;

			},

			set: function ( value ) {

				this.uniforms.maxlinewidth.value = value;

			}

		},

		dashScale: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashScale.value;

			},

			set: function ( value ) {

				this.uniforms.dashScale.value = value;

			}

		},

		dashSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashSize.value;

			},

			set: function ( value ) {

				this.uniforms.dashSize.value = value;

			}

		},

		gapSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.gapSize.value;

			},

			set: function ( value ) {

				this.uniforms.gapSize.value = value;

			}

		},

		resolution: {

			enumerable: true,

			get: function () {

				return this.uniforms.resolution.value;

			},

			set: function ( value ) {

				this.uniforms.resolution.value.copy( value );

			}

		}

	} );

	this.setValues( parameters );


};

PerspectiveLineMaterial.prototype = Object.create( ShaderMaterial.prototype );
PerspectiveLineMaterial.prototype.constructor = PerspectiveLineMaterial;

PerspectiveLineMaterial.prototype.isPerspectiveLineMaterial = true;

PerspectiveLineMaterial.prototype.copy = function ( source ) {

	ShaderMaterial.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.worldlinewidth = source.worldlinewidth;

	this.minlinewidth = source.minlinewidth;

	this.maxlinewidth = source.maxlinewidth;

	this.resolution = source.resolution;

	// todo

	return this;

};


export { PerspectiveLineMaterial };
