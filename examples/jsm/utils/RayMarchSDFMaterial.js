import { MeshStandardMaterial, Matrix4, Vector3 } from 'three';

export class RayMarchSDFMaterial extends MeshStandardMaterial {

	constructor( params ) {

		super( params );

		this.uniforms = {
			sdfTex: { value: null },
			normalStep: { value: new Vector3() },
			sdfNormalMatrix: { value: new Matrix4() },
			surface: { value: 0 }
		};

		this.defines = {
			MAX_STEPS: 500,
			SURFACE_EPSILON: 0.001
		};

		this.onBeforeCompile = ( shader ) => {

		// Add our custom uniforms
		shader.uniforms.sdfTex = this.uniforms.sdfTex;
		shader.uniforms.normalStep = this.uniforms.normalStep;
		shader.uniforms.sdfNormalMatrix = this.uniforms.sdfNormalMatrix;
		shader.uniforms.surface = this.uniforms.surface;			// Add our defines
			shader.defines = shader.defines || {};
			Object.assign( shader.defines, this.defines );

		// Modify vertex shader to compute ray in local space
		shader.vertexShader = shader.vertexShader.replace(
			'#include <common>',
			`#include <common>
			varying vec3 vLocalPosition;
			varying vec3 vLocalRayOrigin;`
		);

		shader.vertexShader = shader.vertexShader.replace(
			'#include <worldpos_vertex>',
			`#include <worldpos_vertex>
			// Transform camera position to local space
			vLocalRayOrigin = ( inverse( modelMatrix ) * vec4( cameraPosition, 1.0 ) ).xyz;
			// Vertex position is already in local space
			vLocalPosition = position;`
		);			// Add custom uniforms and functions to fragment shader
		shader.fragmentShader = shader.fragmentShader.replace(
			'#include <common>',
			`#include <common>
			
			uniform sampler3D sdfTex;
			uniform vec3 normalStep;
			uniform mat4 sdfNormalMatrix;
			uniform float surface;
			
			varying vec3 vLocalPosition;
			varying vec3 vLocalRayOrigin;

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
		);			// Inject raymarching at the very start of main
			shader.fragmentShader = shader.fragmentShader.replace(
				'void main() {',
				`void main() {
				// Raymarch from camera through the box in local space
				vec3 rayOrigin = vLocalRayOrigin;
				vec3 rayDirection = normalize( vLocalPosition - vLocalRayOrigin );
				
				// Find intersection with SDF bounds [-0.5, 0.5]
				vec2 boxIntersectionInfo = rayBoxDist( vec3( - 0.5 ), vec3( 0.5 ), rayOrigin, rayDirection );
				float distToBox = boxIntersectionInfo.x;
				float distInsideBox = boxIntersectionInfo.y;
				bool intersectsBox = distInsideBox > 0.0;
				
				if ( !intersectsBox ) {
					discard;
				}
				
				// Raymarch to find surface in SDF local space
				bool intersectsSurface = false;
				vec3 localPoint = rayOrigin + rayDirection * ( distToBox + 1e-5 );
				
				for ( int i = 0; i < MAX_STEPS; i ++ ) {
					vec3 sdfUV = localPoint + vec3( 0.5 );
					if ( sdfUV.x < 0.0 || sdfUV.x > 1.0 || sdfUV.y < 0.0 || sdfUV.y > 1.0 || sdfUV.z < 0.0 || sdfUV.z > 1.0 ) {
						break;
					}
					float distanceToSurface = texture( sdfTex, sdfUV ).r - surface;
					if ( abs( distanceToSurface ) < SURFACE_EPSILON ) {
						intersectsSurface = true;
						break;
					}
					localPoint += rayDirection * distanceToSurface * 0.5;
				}					if ( !intersectsSurface ) {
						discard;
					}
					
					// Compute UV and normal from SDF
					vec3 sdfUV = localPoint + vec3( 0.5 );
					vec4 sdfData = texture( sdfTex, sdfUV );
					vec2 sdfTexUv = sdfData.gb;
					
					// Compute gradient in SDF local space
					float dx = texture( sdfTex, sdfUV + vec3( normalStep.x, 0.0, 0.0 ) ).r - texture( sdfTex, sdfUV - vec3( normalStep.x, 0.0, 0.0 ) ).r;
					float dy = texture( sdfTex, sdfUV + vec3( 0.0, normalStep.y, 0.0 ) ).r - texture( sdfTex, sdfUV - vec3( 0.0, normalStep.y, 0.0 ) ).r;
					float dz = texture( sdfTex, sdfUV + vec3( 0.0, 0.0, normalStep.z ) ).r - texture( sdfTex, sdfUV - vec3( 0.0, 0.0, normalStep.z ) ).r;
					vec3 sdfNormalLocal = normalize( vec3( dx, dy, dz ) );
					
					// Transform normal from SDF local space to view space
					vec3 sdfNormal = normalize( ( sdfNormalMatrix * vec4( sdfNormalLocal, 0.0 ) ).xyz );
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
					vec3 T = normalize( cross( N, vec3( 0.0, 1.0, 0.0 ) ) );
					// If normal is too close to (0,1,0), use a different reference
					if ( length( T ) < 0.1 ) {
						T = normalize( cross( N, vec3( 1.0, 0.0, 0.0 ) ) );
					}
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

			// Debug output
			console.log( 'Shader compiled with defines:', shader.defines );

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


