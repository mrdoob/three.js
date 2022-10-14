( function () {

	/**
 * `PackedPhongMaterial` inherited from THREE.MeshPhongMaterial
 *
 * @param {Object} parameters
 */
	class PackedPhongMaterial extends THREE.MeshPhongMaterial {

		constructor( parameters ) {

			super();
			this.defines = {};
			this.type = 'PackedPhongMaterial';
			this.uniforms = THREE.UniformsUtils.merge( [ THREE.ShaderLib.phong.uniforms, {
				quantizeMatPos: {
					value: null
				},
				quantizeMatUV: {
					value: null
				}
			} ] );
			this.vertexShader = [ '#define PHONG', 'varying vec3 vViewPosition;', THREE.ShaderChunk.common, THREE.ShaderChunk.uv_pars_vertex, THREE.ShaderChunk.uv2_pars_vertex, THREE.ShaderChunk.displacementmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.fog_pars_vertex, THREE.ShaderChunk.normal_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, THREE.ShaderChunk.clipping_planes_pars_vertex, `#ifdef USE_PACKED_NORMAL
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
				#endif`, `#ifdef USE_PACKED_POSITION
					#if USE_PACKED_POSITION == 0
						uniform mat4 quantizeMatPos;
					#endif
				#endif`, `#ifdef USE_PACKED_UV
					#if USE_PACKED_UV == 1
						uniform mat3 quantizeMatUV;
					#endif
				#endif`, `#ifdef USE_PACKED_UV
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
				#endif`, 'void main() {', THREE.ShaderChunk.uv_vertex, `#ifdef USE_UV
					#ifdef USE_PACKED_UV
						vUv = decodeUV(vUv);
					#endif
				#endif`, THREE.ShaderChunk.uv2_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.beginnormal_vertex, `#ifdef USE_PACKED_NORMAL
					objectNormal = decodeNormal(objectNormal);
				#endif

				#ifdef USE_TANGENT
					vec3 objectTangent = vec3( tangent.xyz );
				#endif
				`, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, THREE.ShaderChunk.normal_vertex, THREE.ShaderChunk.begin_vertex, `#ifdef USE_PACKED_POSITION
					#if USE_PACKED_POSITION == 0
						transformed = ( vec4(transformed, 1.0) * quantizeMatPos ).xyz;
					#endif
				#endif`, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.displacementmap_vertex, THREE.ShaderChunk.project_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.clipping_planes_vertex, 'vViewPosition = - mvPosition.xyz;', THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.shadowmap_vertex, THREE.ShaderChunk.fog_vertex, '}' ].join( '\n' );

			// Use the original THREE.MeshPhongMaterial's fragmentShader.
			this.fragmentShader = [ '#define PHONG', 'uniform vec3 diffuse;', 'uniform vec3 emissive;', 'uniform vec3 specular;', 'uniform float shininess;', 'uniform float opacity;', THREE.ShaderChunk.common, THREE.ShaderChunk.packing, THREE.ShaderChunk.dithering_pars_fragment, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.uv_pars_fragment, THREE.ShaderChunk.uv2_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.aomap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.emissivemap_pars_fragment, THREE.ShaderChunk.envmap_common_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.bsdfs, THREE.ShaderChunk.lights_pars_begin, THREE.ShaderChunk.normal_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.bumpmap_pars_fragment, THREE.ShaderChunk.normalmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, THREE.ShaderChunk.clipping_planes_pars_fragment, 'void main() {', THREE.ShaderChunk.clipping_planes_fragment, 'vec4 diffuseColor = vec4( diffuse, opacity );', 'ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );', 'vec3 totalEmissiveRadiance = emissive;', THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.normal_fragment_begin, THREE.ShaderChunk.normal_fragment_maps, THREE.ShaderChunk.emissivemap_fragment,
				// accumulation
				THREE.ShaderChunk.lights_phong_fragment, THREE.ShaderChunk.lights_fragment_begin, THREE.ShaderChunk.lights_fragment_maps, THREE.ShaderChunk.lights_fragment_end,
				// modulation
				THREE.ShaderChunk.aomap_fragment, 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;', THREE.ShaderChunk.envmap_fragment, 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );', THREE.ShaderChunk.tonemapping_fragment, THREE.ShaderChunk.encodings_fragment, THREE.ShaderChunk.fog_fragment, THREE.ShaderChunk.premultiplied_alpha_fragment, THREE.ShaderChunk.dithering_fragment, '}' ].join( '\n' );
			this.setValues( parameters );

		}

	}

	THREE.PackedPhongMaterial = PackedPhongMaterial;

} )();
