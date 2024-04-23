import {
	UniformsLib,
	UniformsUtils,
	Matrix4
} from 'three';

/**
 * Mesh Velocity Shader @bhouston
 */

const VelocityShader = {

	name: 'VelocityShader',

	uniforms: UniformsUtils.merge( [
		UniformsLib.common,
		UniformsLib.displacementmap,
		{
			modelMatrixPrev: { value: new Matrix4() },
			currentProjectionViewMatrix: { value: new Matrix4() },
			previousProjectionViewMatrix: { value: new Matrix4() }
		}
	] ),

	vertexShader: /* glsl */`
#define NORMAL

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	varying vec3 vViewPosition;

#endif

#include <common>
#include <packing>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform mat4 previousProjectionViewMatrix;
uniform mat4 currentProjectionViewMatrix;

uniform mat4 modelMatrixPrev;

varying vec4 clipPositionCurrent;
varying vec4 clipPositionPrevious;

void main() {


	#include <uv_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <displacementmap_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>

#ifdef USE_SKINNING

	vec4 mvPosition = modelViewMatrix * skinned;
	clipPositionCurrent  = currentProjectionViewMatrix * modelMatrix * skinned;
	clipPositionPrevious = previousProjectionViewMatrix * modelMatrixPrev * skinned;

#else

	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
	clipPositionCurrent  = currentProjectionViewMatrix * modelMatrix * vec4( transformed, 1.0 );
	clipPositionPrevious = previousProjectionViewMatrix * modelMatrixPrev * vec4( transformed, 1.0 );

#endif

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
}
`,
	fragmentShader: /* glsl */`
#define NORMAL

uniform float opacity;

#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec4 clipPositionCurrent;
varying vec4 clipPositionPrevious;

void main() {

	vec4 diffuseColor = vec4( 1.0 );
	diffuseColor.a = opacity;

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	vec2 ndcPositionCurrent  = clipPositionCurrent.xy/clipPositionCurrent.w;
	vec2 ndcPositionPrevious = clipPositionPrevious.xy/clipPositionPrevious.w;
	vec2 vel = ( ndcPositionCurrent - ndcPositionPrevious ) * 0.5;
	vel = vel * 0.5 + 0.5;
	vec2 v1 = packDepthToRG(vel.x);
	vec2 v2 = packDepthToRG(vel.y);
	gl_FragColor = vec4(v1.x, v1.y, v2.x, v2.y);

	#include <logdepthbuf_fragment>

}

`
};

export { VelocityShader };
