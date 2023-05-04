
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
} from 'three';

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

			ShaderChunk.common,
			ShaderChunk.uv_pars_vertex,
			ShaderChunk.displacementmap_pars_vertex,
			ShaderChunk.envmap_pars_vertex,
			ShaderChunk.color_pars_vertex,
			ShaderChunk.fog_pars_vertex,
			ShaderChunk.normal_pars_vertex,
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

			`#ifdef USE_MAP
					#ifdef USE_PACKED_UV
						vMapUv = decodeUV(vMapUv);
					#endif
				#endif`,

			ShaderChunk.color_vertex,
			ShaderChunk.morphcolor_vertex,

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
			ShaderChunk.normal_vertex,

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
		this.fragmentShader = ShaderLib.phong.fragmentShader;

		this.setValues( parameters );

	}

}

export { PackedPhongMaterial };
