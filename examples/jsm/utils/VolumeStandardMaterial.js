import { MeshStandardMaterial, Vector3, BackSide } from 'three';

export class VolumeStandardMaterial extends MeshStandardMaterial {

	constructor( params ) {

		super( params );

		this.side = BackSide;

		this.uniforms = {
			sdfTex: { value: null },
			normalStep: { value: new Vector3() },
			boundsScale: { value: new Vector3( 1, 1, 1 ) },
			surface: { value: 0 }
		};

		this.defines = {
			MAX_STEPS: 50,
			SURFACE_EPSILON: 0.0001
		};

		this.onBeforeCompile = ( shader ) => {

			// Add our custom uniforms
			shader.uniforms.sdfTex = this.uniforms.sdfTex;
			shader.uniforms.normalStep = this.uniforms.normalStep;
			shader.uniforms.boundsScale = this.uniforms.boundsScale;
			shader.uniforms.surface = this.uniforms.surface;

			// Add our defines
			shader.defines = shader.defines || {};
			Object.assign( shader.defines, this.defines );

			// Modify vertex shader to compute ray in local space
			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`#include <common>
				varying vec3 vLocalPosition;
				varying vec3 vLocalRayOrigin;
				varying mat4 vInstanceMatrix;`
			);

			shader.vertexShader = shader.vertexShader.replace(
				'#include <worldpos_vertex>',
				`#include <worldpos_vertex>
				// Get the instance matrix (identity for non-instanced meshes)
				#ifdef USE_INSTANCING
					vInstanceMatrix = instanceMatrix;
				#else
					vInstanceMatrix = mat4( 1.0 );
				#endif
				// Transform camera position to local space (accounting for instance transform)
				vLocalRayOrigin = ( inverse( modelMatrix * vInstanceMatrix ) * vec4( cameraPosition, 1.0 ) ).xyz;
				// Vertex position is already in local space
				vLocalPosition = position;`
			);

			// Add custom uniforms and functions to fragment shader
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <common>',
				`#include <common>

				uniform sampler3D sdfTex;
				uniform vec3 normalStep;
				uniform vec3 boundsScale;
				uniform mat3 normalMatrix;
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				uniform float surface;

				varying vec3 vLocalPosition;
				varying vec3 vLocalRayOrigin;
				varying mat4 vInstanceMatrix;

				vec2 rayBoxDist( vec3 boundsMin, vec3 boundsMax, vec3 rayOrigin, vec3 rayDir ) {
					vec3 t0 = ( boundsMin - rayOrigin ) / rayDir;
					vec3 t1 = ( boundsMax - rayOrigin ) / rayDir;
					vec3 tmin = min( t0, t1 );
					vec3 tmax = max( t0, t1 );
					float distA = max( max( tmin.x, tmin.y ), tmin.z );
					float distB = min( tmax.x, min( tmax.y, tmax.z ) );
					float distToBox = max( 0.0, distA );
					float distInsideBox = max( 0.0, distB - distToBox );
					return vec2( distToBox, distInsideBox );
				}`
			);

			// Inject raymarching at the very start of main
			shader.fragmentShader = shader.fragmentShader.replace(
				'void main() {',
				`void main() {
				// Raymarch in bounds space (mesh units), where the SDF distances are measured
				vec3 rayOrigin = vLocalRayOrigin * boundsScale;
				vec3 rayDirection = normalize( ( vLocalPosition - vLocalRayOrigin ) * boundsScale );
				vec3 boundsMin = - 0.5 * boundsScale;
				vec3 boundsMax = 0.5 * boundsScale;

				// Find intersection with SDF bounds
				vec2 boxIntersectionInfo = rayBoxDist( boundsMin, boundsMax, rayOrigin, rayDirection );

				// Start from the entry point (or camera if inside)
				float distToBox = max( boxIntersectionInfo.x, 0.0 );

				// Compute distance to back face (current fragment position)
				float distToBackFace = length( vLocalPosition * boundsScale - rayOrigin );

				// Rays that run out of steps within a voxel of the surface still count as hits
				float voxelSize = max( normalStep.x * boundsScale.x, max( normalStep.y * boundsScale.y, normalStep.z * boundsScale.z ) );

				// Raymarch from entry to back face to find surface in SDF
				bool intersectsSurface = false;
				vec3 point = rayOrigin + rayDirection * distToBox;
				float marchDist = distToBox;
				float distanceToSurface = 2.0 * voxelSize;

				for ( int i = 0; i < MAX_STEPS; i ++ ) {

					// Stop if we've reached the back face
					if ( marchDist >= distToBackFace ) {
						break;
					}

					vec3 sdfUV = point / boundsScale + vec3( 0.5 );
					if ( sdfUV.x < 0.0 || sdfUV.x > 1.0 || sdfUV.y < 0.0 || sdfUV.y > 1.0 || sdfUV.z < 0.0 || sdfUV.z > 1.0 ) {
						break;
					}

					distanceToSurface = texture( sdfTex, sdfUV ).r - surface;
					if ( abs( distanceToSurface ) < SURFACE_EPSILON ) {
						intersectsSurface = true;
						break;
					}

					point += rayDirection * distanceToSurface;
					marchDist += distanceToSurface;
				}

				if ( ! intersectsSurface && abs( distanceToSurface ) > voxelSize ) {
					discard;
				}

				vec3 localPoint = point / boundsScale;

				// Write correct depth for the raymarched surface (accounting for instance transform)
				vec4 viewPos = modelViewMatrix * vInstanceMatrix * vec4( localPoint, 1.0 );
				vec4 clipPos = projectionMatrix * viewPos;
				float ndcDepth = clipPos.z / clipPos.w;
				gl_FragDepth = ndcDepth * 0.5 + 0.5;

				// Compute UV and normal from SDF
				vec3 sdfUV = localPoint + vec3( 0.5 );
				vec4 sdfData = texture( sdfTex, sdfUV );
				vec2 sdfTexUv = sdfData.gb;

				// Compute gradient in SDF local space
				float dx = texture( sdfTex, sdfUV + vec3( normalStep.x, 0.0, 0.0 ) ).r - texture( sdfTex, sdfUV - vec3( normalStep.x, 0.0, 0.0 ) ).r;
				float dy = texture( sdfTex, sdfUV + vec3( 0.0, normalStep.y, 0.0 ) ).r - texture( sdfTex, sdfUV - vec3( 0.0, normalStep.y, 0.0 ) ).r;
				float dz = texture( sdfTex, sdfUV + vec3( 0.0, 0.0, normalStep.z ) ).r - texture( sdfTex, sdfUV - vec3( 0.0, 0.0, normalStep.z ) ).r;
				vec3 sdfNormalLocal = normalize( vec3( dx, dy, dz ) );

				// Transform normal from SDF local space to view space (accounting for instance transform)
				mat3 instanceNormalMatrix = mat3( transpose( inverse( vInstanceMatrix ) ) );
				vec3 sdfNormal = normalize( normalMatrix * instanceNormalMatrix * sdfNormalLocal );
				`
			);

			// Replace UV sampling to use our computed UV
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <map_fragment>',
				`#ifdef USE_MAP
					vec4 sampledDiffuseColor = texture2D( map, sdfTexUv );
					#ifdef DECODE_VIDEO_TEXTURE
						sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
					#endif
					diffuseColor *= sampledDiffuseColor;
				#endif`
			);

			// Replace normal mapping to use our computed UV and base normal
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <normal_fragment_begin>',
				`// Use the SDF normal (already in view space)
				vec3 normal = sdfNormal;
				vec3 nonPerturbedNormal = normal;
				#ifdef FLAT_SHADED
					normal = normalize( cross( dFdx( vViewPosition ), dFdy( vViewPosition ) ) );
				#endif`
			);

			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <normal_fragment_maps>',
				`#ifdef USE_NORMALMAP
					// Sample the normal map
					vec3 mapN = texture2D( normalMap, sdfTexUv ).xyz * 2.0 - 1.0;
					mapN.xy *= normalScale;
					
					// Create a tangent space from the SDF normal
					// We need to construct tangent and bitangent vectors perpendicular to the normal
					vec3 N = normalize( normal );
					// Pick a reference axis that isn't parallel to the normal
					vec3 reference = abs( N.y ) < 0.9 ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
					vec3 T = normalize( cross( N, reference ) );
					vec3 B = normalize( cross( N, T ) );
					
					// Apply normal map in tangent space
					normal = normalize( T * mapN.x + B * mapN.y + N * mapN.z );
				#endif`
			);

			// Replace roughness/metalness sampling
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <roughnessmap_fragment>',
				`float roughnessFactor = roughness;
				#ifdef USE_ROUGHNESSMAP
					vec4 texelRoughness = texture2D( roughnessMap, sdfTexUv );
					roughnessFactor *= texelRoughness.g;
				#endif`
			);

			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <metalnessmap_fragment>',
				`float metalnessFactor = metalness;
				#ifdef USE_METALNESSMAP
					vec4 texelMetalness = texture2D( metalnessMap, sdfTexUv );
					metalnessFactor *= texelMetalness.b;
				#endif`
			);

			// Replace AO sampling
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <aomap_fragment>',
				`#ifdef USE_AOMAP
					float ambientOcclusion = ( texture2D( aoMap, sdfTexUv ).r - 1.0 ) * aoMapIntensity + 1.0;
					reflectedLight.indirectDiffuse *= ambientOcclusion;
					#if defined( USE_ENVMAP ) && defined( STANDARD )
						float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
						reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
					#endif
				#endif`
			);

		};

	}

}
