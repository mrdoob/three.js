
/**
 * `PackedPhongMaterial` inherited from THREE.MeshPhongMaterial
 *
 * @param {Object} parameters
 */
import {
	MeshPhongMaterial,
	ShaderChunk,
	ShaderLib,
	UniformsUtils,
} from '../../../build/three.module.js';

class PackedPhongMaterial extends MeshPhongMaterial {

	constructor( parameters ) {

		super();

		this.defines = {};
		this.type = 'PackedPhongMaterial';
		this.uniforms = UniformsUtils.merge( [

			ShaderLib.phong.uniforms,

			{
				quantizeMatPos: { value: null },
				quantizeMatUV: { value: null }
			}

		] );

		this.vertexShader = [
			'#define PHONG',

			'varying vec3 vViewPosition;',

			'#ifndef FLAT_SHADED',
			'varying vec3 vNormal;',
			'#endif',

			ShaderChunk.common,
			ShaderChunk.uv_pars_vertex,
			ShaderChunk.uv2_pars_vertex,
			ShaderChunk.displacementmap_pars_vertex,
			ShaderChunk.envmap_pars_vertex,
			ShaderChunk.color_pars_vertex,
			ShaderChunk.fog_pars_vertex,
			ShaderChunk.morphtarget_pars_vertex,
			ShaderChunk.skinning_pars_vertex,
			ShaderChunk.shadowmap_pars_vertex,
			ShaderChunk.logdepthbuf_pars_vertex,
			ShaderChunk.clipping_planes_pars_vertex,

			`#ifdef USE_PACKED_NORMAL
					#if USE_PACKED_NORMAL == 0
						vec3 decodeNormal(vec3 packedNormal)
						{
							float x = packedNormal.x * 2.0 - 1.0;
							float y = packedNormal.y * 2.0 - 1.0;
							vec2 scth = vec2(sin(x * PI), cos(x * PI));
							vec2 scphi = vec2(sqrt(1.0 - y * y), y);
							return normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );
						}
					#endif

					#if USE_PACKED_NORMAL == 1
						vec3 decodeNormal(vec3 packedNormal)
						{
							vec3 v = vec3(packedNormal.xy, 1.0 - abs(packedNormal.x) - abs(packedNormal.y));
							if (v.z < 0.0)
							{
								v.xy = (1.0 - abs(v.yx)) * vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
							}
							return normalize(v);
						}
					#endif

					#if USE_PACKED_NORMAL == 2
						vec3 decodeNormal(vec3 packedNormal)
						{
							vec3 v = (packedNormal * 2.0) - 1.0;
							return normalize(v);
						}
					#endif
				#endif`,

			`#ifdef USE_PACKED_POSITION
					#if USE_PACKED_POSITION == 0
						uniform mat4 quantizeMatPos;
					#endif
				#endif`,

			`#ifdef USE_PACKED_UV
					#if USE_PACKED_UV == 1
						uniform mat3 quantizeMatUV;
					#endif
				#endif`,

			`#ifdef USE_PACKED_UV
					#if USE_PACKED_UV == 0
						vec2 decodeUV(vec2 packedUV)
						{
							vec2 uv = (packedUV * 2.0) - 1.0;
							return uv;
						}
					#endif

					#if USE_PACKED_UV == 1
						vec2 decodeUV(vec2 packedUV)
						{
							vec2 uv = ( vec3(packedUV, 1.0) * quantizeMatUV ).xy;
							return uv;
						}
					#endif
				#endif`,

			'void main() {',

			ShaderChunk.uv_vertex,

			`#ifdef USE_UV
					#ifdef USE_PACKED_UV
						vUv = decodeUV(vUv);
					#endif
				#endif`,

			ShaderChunk.uv2_vertex,
			ShaderChunk.color_vertex,
			ShaderChunk.beginnormal_vertex,

			`#ifdef USE_PACKED_NORMAL
					objectNormal = decodeNormal(objectNormal);
				#endif

				#ifdef USE_TANGENT
					vec3 objectTangent = vec3( tangent.xyz );
				#endif
				`,

			ShaderChunk.morphnormal_vertex,
			ShaderChunk.skinbase_vertex,
			ShaderChunk.skinnormal_vertex,
			ShaderChunk.defaultnormal_vertex,

			'#ifndef FLAT_SHADED',
			'	vNormal = normalize( transformedNormal );',
			'#endif',

			ShaderChunk.begin_vertex,

			`#ifdef USE_PACKED_POSITION
					#if USE_PACKED_POSITION == 0
						transformed = ( vec4(transformed, 1.0) * quantizeMatPos ).xyz;
					#endif
				#endif`,

			ShaderChunk.morphtarget_vertex,
			ShaderChunk.skinning_vertex,
			ShaderChunk.displacementmap_vertex,
			ShaderChunk.project_vertex,
			ShaderChunk.logdepthbuf_vertex,
			ShaderChunk.clipping_planes_vertex,

			'vViewPosition = - mvPosition.xyz;',

			ShaderChunk.worldpos_vertex,
			ShaderChunk.envmap_vertex,
			ShaderChunk.shadowmap_vertex,
			ShaderChunk.fog_vertex,

			'}',
		].join( '\n' );

		// Use the original MeshPhongMaterial's fragmentShader.
		this.fragmentShader = [
			'#define PHONG',

			'uniform vec3 diffuse;',
			'uniform vec3 emissive;',
			'uniform vec3 specular;',
			'uniform float shininess;',
			'uniform float opacity;',

			ShaderChunk.common,
			ShaderChunk.packing,
			ShaderChunk.dithering_pars_fragment,
			ShaderChunk.color_pars_fragment,
			ShaderChunk.uv_pars_fragment,
			ShaderChunk.uv2_pars_fragment,
			ShaderChunk.map_pars_fragment,
			ShaderChunk.alphamap_pars_fragment,
			ShaderChunk.aomap_pars_fragment,
			ShaderChunk.lightmap_pars_fragment,
			ShaderChunk.emissivemap_pars_fragment,
			ShaderChunk.envmap_common_pars_fragment,
			ShaderChunk.envmap_pars_fragment,
			ShaderChunk.cube_uv_reflection_fragment,
			ShaderChunk.fog_pars_fragment,
			ShaderChunk.bsdfs,
			ShaderChunk.lights_pars_begin,
			ShaderChunk.lights_phong_pars_fragment,
			ShaderChunk.shadowmap_pars_fragment,
			ShaderChunk.bumpmap_pars_fragment,
			ShaderChunk.normalmap_pars_fragment,
			ShaderChunk.specularmap_pars_fragment,
			ShaderChunk.logdepthbuf_pars_fragment,
			ShaderChunk.clipping_planes_pars_fragment,

			'void main() {',

			ShaderChunk.clipping_planes_fragment,

			'vec4 diffuseColor = vec4( diffuse, opacity );',
			'ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );',
			'vec3 totalEmissiveRadiance = emissive;',

			ShaderChunk.logdepthbuf_fragment,
			ShaderChunk.map_fragment,
			ShaderChunk.color_fragment,
			ShaderChunk.alphamap_fragment,
			ShaderChunk.alphatest_fragment,
			ShaderChunk.specularmap_fragment,
			ShaderChunk.normal_fragment_begin,
			ShaderChunk.normal_fragment_maps,
			ShaderChunk.emissivemap_fragment,

			// accumulation
			ShaderChunk.lights_phong_fragment,
			ShaderChunk.lights_fragment_begin,
			ShaderChunk.lights_fragment_maps,
			ShaderChunk.lights_fragment_end,

			// modulation
			ShaderChunk.aomap_fragment,

			'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;',

			ShaderChunk.envmap_fragment,

			'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',

			ShaderChunk.tonemapping_fragment,
			ShaderChunk.encodings_fragment,
			ShaderChunk.fog_fragment,
			ShaderChunk.premultiplied_alpha_fragment,
			ShaderChunk.dithering_fragment,
			'}',
		].join( '\n' );

		this.setValues( parameters );

	}

}

export { PackedPhongMaterial };
