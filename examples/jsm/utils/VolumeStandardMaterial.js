import { MeshStandardMaterial, Vector3, BackSide } from 'three';

export class VolumeStandardMaterial extends MeshStandardMaterial {

	constructor( params ) {

		super( params );

		this.side = BackSide;

		this.uniforms = {
			sdfTex: { value: null },
			uvTex: { value: null },
			normalStep: { value: new Vector3() },
			boundsScale: { value: new Vector3( 1, 1, 1 ) },
			surface: { value: 0 },
			pixelScale: { value: 0 },
			pixelOffset: { value: 0 }
		};

		this.defines = {
			MAX_STEPS: 50,
			SURFACE_EPSILON: 0.0001
		};

		this.onBeforeCompile = ( shader ) => {

			// Add our custom uniforms
			shader.uniforms.sdfTex = this.uniforms.sdfTex;
			shader.uniforms.uvTex = this.uniforms.uvTex;
			shader.uniforms.normalStep = this.uniforms.normalStep;
			shader.uniforms.boundsScale = this.uniforms.boundsScale;
			shader.uniforms.surface = this.uniforms.surface;
			shader.uniforms.pixelScale = this.uniforms.pixelScale;
			shader.uniforms.pixelOffset = this.uniforms.pixelOffset;

			// Add our defines
			shader.defines = shader.defines || {};
			Object.assign( shader.defines, this.defines );

			// Modify vertex shader to compute ray in local space
			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`#include <common>
				varying vec3 vLocalPosition;
				varying vec3 vLocalRayOrigin;
				varying mat4 vInstanceMatrix;
				varying float vBoundsPerWorld;
				uniform vec3 boundsScale;`
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
				vLocalPosition = position;
				// Bounds units per world unit, to size the pixel footprint in the SDF
				vBoundsPerWorld = boundsScale.x / length( ( modelMatrix * vInstanceMatrix * vec4( 1.0, 0.0, 0.0, 0.0 ) ).xyz );`
			);

			// Add custom uniforms and functions to fragment shader
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <common>',
				`#include <common>

				uniform sampler3D sdfTex;
				uniform sampler3D uvTex;
				uniform vec3 normalStep;
				uniform vec3 boundsScale;
				uniform mat3 normalMatrix;
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				uniform float surface;
				uniform float pixelScale;
				uniform float pixelOffset;
				varying float vBoundsPerWorld;

				varying vec3 vLocalPosition;
				varying vec3 vLocalRayOrigin;
				varying mat4 vInstanceMatrix;

				// Same approach as perturbNormal2Arb(), using the UVs sampled from the volume
				vec3 perturbNormalSDF( vec3 eye_pos, vec3 surf_norm, vec3 mapN, vec2 uv ) {
					vec3 q0 = dFdx( eye_pos );
					vec3 q1 = dFdy( eye_pos );
					vec2 st0 = dFdx( uv );
					vec2 st1 = dFdy( uv );
					vec3 N = surf_norm;
					vec3 q1perp = cross( q1, N );
					vec3 q0perp = cross( N, q0 );
					vec3 T = q1perp * st0.x + q0perp * st1.x;
					vec3 B = q1perp * st0.y + q0perp * st1.y;
					float det = max( dot( T, T ), dot( B, B ) );
					float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
					return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
				}
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
				// Raymarch in bounds space (mesh units), where the SDF distances are measured.
				// The segment is built from the back face fragment so it stays precise for distant cameras.
				vec3 cameraPoint = vLocalRayOrigin * boundsScale;
				vec3 backPoint = vLocalPosition * boundsScale;
				vec3 rayDirection = normalize( backPoint - cameraPoint );

				// Distance from the back face to the entry face, or to the camera if it is inside the box
				float segment = rayBoxDist( - 0.5 * boundsScale, 0.5 * boundsScale, backPoint, - rayDirection ).y;
				segment = min( segment, length( backPoint - cameraPoint ) );

				// Rays that run out of steps within a voxel of the surface still count as hits
				float voxelSize = max( normalStep.x * boundsScale.x, max( normalStep.y * boundsScale.y, normalStep.z * boundsScale.z ) );

				// Pixel footprint at this distance, in bounds units: distant surfaces need less precision and a coarser mip
				float footprint = ( pixelScale * length( vViewPosition ) + pixelOffset ) * vBoundsPerWorld;
				float hitEpsilon = max( SURFACE_EPSILON, 0.5 * footprint );
				float lod = max( log2( footprint / voxelSize ), 0.0 );

				// Raymarch from the entry point to the back face to find the surface in the SDF
				bool intersectsSurface = false;
				vec3 point = backPoint - rayDirection * segment;
				float marchDist = 0.0;
				float distanceToSurface = 2.0 * voxelSize;

				for ( int i = 0; i < MAX_STEPS; i ++ ) {

					// Stop if we've reached the back face
					if ( marchDist >= segment ) {
						break;
					}

					vec3 sdfUV = clamp( point / boundsScale + vec3( 0.5 ), 0.0, 1.0 );
					distanceToSurface = textureLod( sdfTex, sdfUV, lod ).r - surface;
					if ( abs( distanceToSurface ) < hitEpsilon ) {
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

				// Surface attributes at the hit point
				vec3 sdfUV = clamp( localPoint + vec3( 0.5 ), 0.0, 1.0 );
				vec4 sdfData = textureLod( sdfTex, sdfUV, lod );

				// Surface UVs of the closest point, filtered linearly
				vec2 sdfTexUv = texture( uvTex, sdfUV ).rg;

				// Baked surface normal, converted from bounds space to local space (inverse transpose of the bounds scale)
				vec3 sdfNormalLocal = sdfData.gba * boundsScale;

				if ( dot( sdfNormalLocal, sdfNormalLocal ) < 0.01 ) {

					// Opposite normals cancelled out across a thin shell, fall back to the gradient
					float dx = texture( sdfTex, sdfUV + vec3( normalStep.x, 0.0, 0.0 ) ).r - texture( sdfTex, sdfUV - vec3( normalStep.x, 0.0, 0.0 ) ).r;
					float dy = texture( sdfTex, sdfUV + vec3( 0.0, normalStep.y, 0.0 ) ).r - texture( sdfTex, sdfUV - vec3( 0.0, normalStep.y, 0.0 ) ).r;
					float dz = texture( sdfTex, sdfUV + vec3( 0.0, 0.0, normalStep.z ) ).r - texture( sdfTex, sdfUV - vec3( 0.0, 0.0, normalStep.z ) ).r;
					sdfNormalLocal = vec3( dx, dy, dz );

				}

				sdfNormalLocal = normalize( sdfNormalLocal );

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

					// Tangent frame from screen-space derivatives of the raymarched position and UV
					normal = perturbNormalSDF( viewPos.xyz, normal, mapN, sdfTexUv );
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
