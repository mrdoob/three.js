import {
	Vector2,
	Vector3,
	Matrix4,
	Data3DTexture,
	RGBAFormat,
	FloatType,
	LinearFilter,
	ShaderMaterial,
	WebGLRenderTarget
} from 'three';
import { FullScreenQuad } from 'three/addons/utils/FullScreenQuad.js';

export class JumpFloodSDFGenerator {

	constructor( renderer ) {

		this.renderer = renderer;

		this.jumpFloodInitMaterial = new ShaderMaterial( {
			uniforms: {
				bvh: { value: null },
				matrix: { value: null },
				zValue: { value: 0 }
			},
			vertexShader: /* glsl */`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: /* glsl */`
				varying vec2 vUv;
				uniform BVH bvh;
				uniform mat4 matrix;
				uniform float zValue;

				void main() {
					// calculate the point in space for this pixel
					vec3 point = vec3( vUv.x - 0.5, vUv.y - 0.5, zValue - 0.5 );
					point = ( matrix * vec4( point, 1.0 ) ).xyz;

					// get the distance to the geometry
					uvec4 faceIndices = uvec4( 0u );
					vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
					vec3 barycoord = vec3( 0.0 );
					vec3 outPoint = vec3( 0.0 );
					bvhClosestPointToPoint(
						bvh, point.xyz, faceIndices, faceNormal, barycoord, outPoint
					);

					gl_FragColor = vec4( outPoint, 1.0 );
				}
			`
		} );

		this.jumpFloodMaterial = new ShaderMaterial( {
			uniforms: {
				map: { value: null },
				stepSize: { value: 0 }
			},
			vertexShader: /* glsl */`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: /* glsl */`
				varying vec2 vUv;
				uniform sampler2D map;
				uniform float stepSize;

				void main() {
					vec2 bestUv = vUv;
					float bestDist = distance( texture2D( map, vUv ).xyz, gl_FragCoord.xyz );

					for ( int i = -1; i <= 1; i ++ ) {
						for ( int j = -1; j <= 1; j ++ ) {
							if ( i == 0 && j == 0 ) continue;

							vec2 uv = vUv + vec2( float( i ), float( j ) ) * stepSize;
							float dist = distance( texture2D( map, uv ).xyz, gl_FragCoord.xyz );

							if ( dist < bestDist ) {
								bestDist = dist;
								bestUv = uv;
							}
						}
					}

					gl_FragColor = texture2D( map, bestUv );
				}
			`
		} );

		this.distanceMaterial = new ShaderMaterial( {
			uniforms: {
				map: { value: null },
				matrix: { value: null },
				zValue: { value: 0 }
			},
			vertexShader: /* glsl */`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: /* glsl */`
				varying vec2 vUv;
				uniform sampler2D map;
				uniform mat4 matrix;
				uniform float zValue;

				void main() {
					vec3 point = vec3( vUv.x - 0.5, vUv.y - 0.5, zValue - 0.5 );
					point = ( matrix * vec4( point, 1.0 ) ).xyz;

					vec3 closestPoint = texture2D( map, vUv ).xyz;
					float dist = distance( point, closestPoint );

					gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
				}
			`
		} );

	}

	generate( sourceMesh, resolution = 64 ) {

		const { renderer } = this;

		const dim = resolution;
		const geometry = sourceMesh.geometry;

		// Ensure BVH is computed
		if ( ! geometry.boundsTree ) {

			throw new Error( 'Source mesh geometry must have a BVH. Call geometry.computeBoundsTree() first.' );

		}

		const bvh = geometry.boundsTree;

		const matrix = new Matrix4();
		const center = new Vector3();
		const quat = new Quaternion();
		const scale = new Vector3();

		// Compute the bounding box of the geometry
		if ( ! geometry.boundingBox ) geometry.computeBoundingBox();

		geometry.boundingBox.getCenter( center );
		scale.subVectors( geometry.boundingBox.max, geometry.boundingBox.min );
		matrix.compose( center, quat, scale );

		// Create the render targets
		const rt1 = new WebGLRenderTarget( dim, dim, {
			format: RGBAFormat,
			type: FloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter
		} );

		const rt2 = new WebGLRenderTarget( dim, dim, {
			format: RGBAFormat,
			type: FloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter
		} );

		// Create the 3D texture
		const sdfTexture = new Data3DTexture( new Float32Array( dim * dim * dim * 4 ), dim, dim, dim );
		sdfTexture.format = RGBAFormat;
		sdfTexture.type = FloatType;
		sdfTexture.minFilter = LinearFilter;
		sdfTexture.magFilter = LinearFilter;

		const fsQuad = new FullScreenQuad();

		for ( let z = 0; z < dim; z ++ ) {

			// Initialization pass
			fsQuad.material = this.jumpFloodInitMaterial;
			this.jumpFloodInitMaterial.uniforms.bvh.value = bvh;
			this.jumpFloodInitMaterial.uniforms.matrix.value = matrix;
			this.jumpFloodInitMaterial.uniforms.zValue.value = z / dim;
			renderer.setRenderTarget( rt1 );
			fsQuad.render( renderer );

			// Jump flooding passes
			let stepSize = dim / 2;
			while ( stepSize >= 1 ) {

				fsQuad.material = this.jumpFloodMaterial;
				this.jumpFloodMaterial.uniforms.map.value = rt1.texture;
				this.jumpFloodMaterial.uniforms.stepSize.value = stepSize / dim;
				renderer.setRenderTarget( rt2 );
				fsQuad.render( renderer );

				// Swap render targets
				const temp = rt1;
				rt1 = rt2;
				rt2 = temp;

				stepSize /= 2;

			}

			// Distance calculation pass
			fsQuad.material = this.distanceMaterial;
			this.distanceMaterial.uniforms.map.value = rt1.texture;
			this.distanceMaterial.uniforms.matrix.value = matrix;
			this.distanceMaterial.uniforms.zValue.value = z / dim;
			renderer.setRenderTarget( rt2 );
			fsQuad.render( renderer );

			// Read the data from the render target
			const buffer = new Float32Array( dim * dim * 4 );
			renderer.readRenderTargetPixels( rt2, 0, 0, dim, dim, buffer );

			// Copy the data to the 3D texture
			const offset = z * dim * dim * 4;
			sdfTexture.image.data.set( buffer, offset );

		}

		fsQuad.dispose();
		rt1.dispose();
		rt2.dispose();

		return sdfTexture;

	}

}
