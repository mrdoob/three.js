( function () {

	/**
 * MeshGouraudMaterial
 *
 * Lambert illumination model with Gouraud (per-vertex) shading
 *
 */
	const GouraudShader = {
		uniforms: THREE.UniformsUtils.merge( [ THREE.UniformsLib.common, THREE.UniformsLib.specularmap, THREE.UniformsLib.envmap, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.emissivemap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
			emissive: {
				value: new THREE.Color( 0x000000 )
			}
		} ] ),
		vertexShader: /* glsl */`

		#define GOURAUD

		varying vec3 vLightFront;
		varying vec3 vIndirectFront;

		#ifdef DOUBLE_SIDED
			varying vec3 vLightBack;
			varying vec3 vIndirectBack;
		#endif

		#include <common>
		#include <uv_pars_vertex>
		#include <uv2_pars_vertex>
		#include <envmap_pars_vertex>
		#include <bsdfs>
		#include <lights_pars_begin>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <morphtarget_pars_vertex>
		#include <skinning_pars_vertex>
		#include <shadowmap_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		void main() {

			#include <uv_vertex>
			#include <uv2_vertex>
			#include <color_vertex>
			#include <morphcolor_vertex>

			#include <beginnormal_vertex>
			#include <morphnormal_vertex>
			#include <skinbase_vertex>
			#include <skinnormal_vertex>
			#include <defaultnormal_vertex>

			#include <begin_vertex>
			#include <morphtarget_vertex>
			#include <skinning_vertex>
			#include <project_vertex>
			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>

			#include <worldpos_vertex>
			#include <envmap_vertex>

			// inlining legacy <lights_lambert_vertex>

			vec3 diffuse = vec3( 1.0 );

			GeometricContext geometry;
			geometry.position = mvPosition.xyz;
			geometry.normal = normalize( transformedNormal );
			geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( -mvPosition.xyz );

			GeometricContext backGeometry;
			backGeometry.position = geometry.position;
			backGeometry.normal = -geometry.normal;
			backGeometry.viewDir = geometry.viewDir;

			vLightFront = vec3( 0.0 );
			vIndirectFront = vec3( 0.0 );
			#ifdef DOUBLE_SIDED
				vLightBack = vec3( 0.0 );
				vIndirectBack = vec3( 0.0 );
			#endif

			IncidentLight directLight;
			float dotNL;
			vec3 directLightColor_Diffuse;

			vIndirectFront += getAmbientLightIrradiance( ambientLightColor );

			vIndirectFront += getLightProbeIrradiance( lightProbe, geometry.normal );

			#ifdef DOUBLE_SIDED

				vIndirectBack += getAmbientLightIrradiance( ambientLightColor );

				vIndirectBack += getLightProbeIrradiance( lightProbe, backGeometry.normal );

			#endif

			#if NUM_POINT_LIGHTS > 0

				#pragma unroll_loop_start
				for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

					getPointLightInfo( pointLights[ i ], geometry, directLight );

					dotNL = dot( geometry.normal, directLight.direction );
					directLightColor_Diffuse = directLight.color;

					vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

					#ifdef DOUBLE_SIDED

						vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;

					#endif

				}
				#pragma unroll_loop_end

			#endif

			#if NUM_SPOT_LIGHTS > 0

				#pragma unroll_loop_start
				for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

					getSpotLightInfo( spotLights[ i ], geometry, directLight );

					dotNL = dot( geometry.normal, directLight.direction );
					directLightColor_Diffuse = directLight.color;

					vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

					#ifdef DOUBLE_SIDED

						vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;

					#endif
				}
				#pragma unroll_loop_end

			#endif

			#if NUM_DIR_LIGHTS > 0

				#pragma unroll_loop_start
				for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

					getDirectionalLightInfo( directionalLights[ i ], geometry, directLight );

					dotNL = dot( geometry.normal, directLight.direction );
					directLightColor_Diffuse = directLight.color;

					vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

					#ifdef DOUBLE_SIDED

						vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;

					#endif

				}
				#pragma unroll_loop_end

			#endif

			#if NUM_HEMI_LIGHTS > 0

				#pragma unroll_loop_start
				for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

					vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );

					#ifdef DOUBLE_SIDED

						vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry.normal );

					#endif

				}
				#pragma unroll_loop_end

			#endif

			#include <shadowmap_vertex>
			#include <fog_vertex>

		}`,
		fragmentShader: /* glsl */`

		#define GOURAUD

		uniform vec3 diffuse;
		uniform vec3 emissive;
		uniform float opacity;

		varying vec3 vLightFront;
		varying vec3 vIndirectFront;

		#ifdef DOUBLE_SIDED
			varying vec3 vLightBack;
			varying vec3 vIndirectBack;
		#endif

		#include <common>
		#include <packing>
		#include <dithering_pars_fragment>
		#include <color_pars_fragment>
		#include <uv_pars_fragment>
		#include <uv2_pars_fragment>
		#include <map_pars_fragment>
		#include <alphamap_pars_fragment>
		#include <alphatest_pars_fragment>
		#include <aomap_pars_fragment>
		#include <lightmap_pars_fragment>
		#include <emissivemap_pars_fragment>
		#include <envmap_common_pars_fragment>
		#include <envmap_pars_fragment>
		#include <bsdfs>
		#include <lights_pars_begin>
		#include <fog_pars_fragment>
		#include <shadowmap_pars_fragment>
		#include <shadowmask_pars_fragment>
		#include <specularmap_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		void main() {

			#include <clipping_planes_fragment>

			vec4 diffuseColor = vec4( diffuse, opacity );
			ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
			vec3 totalEmissiveRadiance = emissive;

			#include <logdepthbuf_fragment>
			#include <map_fragment>
			#include <color_fragment>
			#include <alphamap_fragment>
			#include <alphatest_fragment>
			#include <specularmap_fragment>
			#include <emissivemap_fragment>

			// accumulation

			#ifdef DOUBLE_SIDED

				reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;

			#else

				reflectedLight.indirectDiffuse += vIndirectFront;

			#endif

			#include <lightmap_fragment>

			reflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );

			#ifdef DOUBLE_SIDED

				reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

			#else

				reflectedLight.directDiffuse = vLightFront;

			#endif

			reflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb ) * getShadowMask();

			// modulation

			#include <aomap_fragment>

			vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

			#include <envmap_fragment>

			#include <output_fragment>
			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>
			#include <dithering_fragment>

		}`
	};

	//

	class MeshGouraudMaterial extends THREE.ShaderMaterial {

		constructor( parameters ) {

			super();
			this.isMeshGouraudMaterial = true;
			this.type = 'MeshGouraudMaterial';

			//this.color = new THREE.Color( 0xffffff ); // diffuse

			//this.map = null;

			//this.lightMap = null;
			//this.lightMapIntensity = 1.0;

			//this.aoMap = null;
			//this.aoMapIntensity = 1.0;

			//this.emissive = new THREE.Color( 0x000000 );
			//this.emissiveIntensity = 1.0;
			//this.emissiveMap = null;

			//this.specularMap = null;

			//this.alphaMap = null;

			//this.envMap = null;
			this.combine = THREE.MultiplyOperation; // combine has no uniform
			//this.reflectivity = 1;
			//this.refractionRatio = 0.98;

			this.fog = false; // set to use scene fog
			this.lights = true; // set to use scene lights
			this.clipping = false; // set to use user-defined clipping planes

			const shader = GouraudShader;
			this.defines = Object.assign( {}, shader.defines );
			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			this.vertexShader = shader.vertexShader;
			this.fragmentShader = shader.fragmentShader;
			const exposePropertyNames = [ 'map', 'lightMap', 'lightMapIntensity', 'aoMap', 'aoMapIntensity', 'emissive', 'emissiveIntensity', 'emissiveMap', 'specularMap', 'alphaMap', 'envMap', 'reflectivity', 'refractionRatio', 'opacity', 'diffuse' ];
			for ( const propertyName of exposePropertyNames ) {

				Object.defineProperty( this, propertyName, {
					get: function () {

						return this.uniforms[ propertyName ].value;

					},
					set: function ( value ) {

						this.uniforms[ propertyName ].value = value;

					}
				} );

			}

			Object.defineProperty( this, 'color', Object.getOwnPropertyDescriptor( this, 'diffuse' ) );
			this.setValues( parameters );

		}
		copy( source ) {

			super.copy( source );
			this.color.copy( source.color );
			this.map = source.map;
			this.lightMap = source.lightMap;
			this.lightMapIntensity = source.lightMapIntensity;
			this.aoMap = source.aoMap;
			this.aoMapIntensity = source.aoMapIntensity;
			this.emissive.copy( source.emissive );
			this.emissiveMap = source.emissiveMap;
			this.emissiveIntensity = source.emissiveIntensity;
			this.specularMap = source.specularMap;
			this.alphaMap = source.alphaMap;
			this.envMap = source.envMap;
			this.combine = source.combine;
			this.reflectivity = source.reflectivity;
			this.refractionRatio = source.refractionRatio;
			this.wireframe = source.wireframe;
			this.wireframeLinewidth = source.wireframeLinewidth;
			this.wireframeLinecap = source.wireframeLinecap;
			this.wireframeLinejoin = source.wireframeLinejoin;
			this.fog = source.fog;
			return this;

		}

	}

	THREE.MeshGouraudMaterial = MeshGouraudMaterial;

} )();
