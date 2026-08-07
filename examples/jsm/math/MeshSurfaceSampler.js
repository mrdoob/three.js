import {
	triangleCreate,
	triangleGetArea,
	triangleGetNormal,
	vec2AddScaledVector,
	vec2Create,
	vec2FromBufferAttribute,
	vec2Set,
	vec3AddScaledVector,
	vec3Create,
	vec3FromBufferAttribute,
	vec3Normalize,
	vec3Set
} from 'three';

const _face = /*@__PURE__*/ triangleCreate();
const _color = /*@__PURE__*/ vec3Create();
const _uva = /*@__PURE__*/ vec2Create(), _uvb = /*@__PURE__*/ vec2Create(), _uvc = /*@__PURE__*/ vec2Create();

/**
 * Utility class for sampling weighted random points on the surface of a mesh.
 *
 * Building the sampler is a one-time O(n) operation. Once built, any number of
 * random samples may be selected in O(logn) time. Memory usage is O(n).
 *
 * References:
 * - {@link http://www.joesfer.com/?p=84}
 * - {@link https://stackoverflow.com/a/4322940/1314762}
 *
 * ```js
 * const sampler = new MeshSurfaceSampler( surfaceMesh )
 * 	.setWeightAttribute( 'color' )
 * 	.build();
 *
 * const mesh = new THREE.InstancedMesh( sampleGeometry, sampleMaterial, 100 );
 *
 * const position = new THREE.Vector3();
 * const matrix = new THREE.Matrix4();
 *
 * // Sample randomly from the surface, creating an instance of the sample geometry at each sample point.
 *
 * for ( let i = 0; i < 100; i ++ ) {
 *
 * 	sampler.sample( position );
 * 	matrix.makeTranslation( position.x, position.y, position.z );
 * 	mesh.setMatrixAt( i, matrix );
 *
 * }
 *
 * scene.add( mesh );
 * ```
 *
 * @three_import import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
 */
class MeshSurfaceSampler {

	/**
	 * Constructs a mesh surface sampler.
	 *
	 * @param {Mesh} mesh - Surface mesh from which to sample.
	 */
	constructor( mesh ) {

		this.geometry = mesh.geometry;
		this.randomFunction = Math.random;

		this.indexAttribute = this.geometry.index;
		this.positionAttribute = this.geometry.getAttribute( 'position' );
		this.normalAttribute = this.geometry.getAttribute( 'normal' );
		this.colorAttribute = this.geometry.getAttribute( 'color' );
		this.uvAttribute = this.geometry.getAttribute( 'uv' );
		this.weightAttribute = null;

		this.distribution = null;

	}

	/**
	 * Specifies a vertex attribute to be used as a weight when sampling from the surface.
	 * Faces with higher weights are more likely to be sampled, and those with weights of
	 * zero will not be sampled at all. For vector attributes, only .x is used in sampling.
	 *
	 * If no weight attribute is selected, sampling is randomly distributed by area.
	 *
	 * @param {string} name - The attribute name.
	 * @return {MeshSurfaceSampler} A reference to this sampler.
	 */
	setWeightAttribute( name ) {

		this.weightAttribute = name ? this.geometry.getAttribute( name ) : null;

		return this;

	}

	/**
	 * Processes the input geometry and prepares to return samples. Any configuration of the
	 * geometry or sampler must occur before this method is called. Time complexity is O(n)
	 * for a surface with n faces.
	 *
	 * @return {MeshSurfaceSampler} A reference to this sampler.
	 */
	build() {

		const indexAttribute = this.indexAttribute;
		const positionAttribute = this.positionAttribute;
		const weightAttribute = this.weightAttribute;

		const totalFaces = indexAttribute ? ( indexAttribute.count / 3 ) : ( positionAttribute.count / 3 );
		const faceWeights = new Float32Array( totalFaces );

		// Accumulate weights for each mesh face.

		for ( let i = 0; i < totalFaces; i ++ ) {

			let faceWeight = 1;

			let i0 = 3 * i;
			let i1 = 3 * i + 1;
			let i2 = 3 * i + 2;

			if ( indexAttribute ) {

				i0 = indexAttribute.getX( i0 );
				i1 = indexAttribute.getX( i1 );
				i2 = indexAttribute.getX( i2 );

			}

			if ( weightAttribute ) {

				faceWeight = weightAttribute.getX( i0 )
					+ weightAttribute.getX( i1 )
					+ weightAttribute.getX( i2 );

			}

			vec3FromBufferAttribute( positionAttribute, i0, _face.a );
			vec3FromBufferAttribute( positionAttribute, i1, _face.b );
			vec3FromBufferAttribute( positionAttribute, i2, _face.c );
			faceWeight *= triangleGetArea( _face );

			faceWeights[ i ] = faceWeight;

		}

		// Store cumulative total face weights in an array, where weight index
		// corresponds to face index.

		const distribution = new Float32Array( totalFaces );
		let cumulativeTotal = 0;

		for ( let i = 0; i < totalFaces; i ++ ) {

			cumulativeTotal += faceWeights[ i ];
			distribution[ i ] = cumulativeTotal;

		}

		this.distribution = distribution;
		return this;

	}

	/**
	 * Allows to set a custom random number generator. Default is `Math.random()`.
	 *
	 * @param {Function} randomFunction - A random number generator.
	 * @return {MeshSurfaceSampler} A reference to this sampler.
	 */
	setRandomGenerator( randomFunction ) {

		this.randomFunction = randomFunction;
		return this;

	}

	/**
	 * Selects a random point on the surface of the input geometry, returning the
	 * position and optionally the normal vector, color and UV Coordinate at that point.
	 * Time complexity is O(log n) for a surface with n faces.
	 *
	 * @param {Vector3} targetPosition - The target object holding the sampled position.
	 * @param {Vector3} targetNormal - The target object holding the sampled normal.
	 * @param {Color} targetColor - The target object holding the sampled color.
	 * @param {Vector2} targetUV -  The target object holding the sampled uv coordinates.
	 * @return {MeshSurfaceSampler} A reference to this sampler.
	 */
	sample( targetPosition, targetNormal, targetColor, targetUV ) {

		const faceIndex = this._sampleFaceIndex();
		return this._sampleFace( faceIndex, targetPosition, targetNormal, targetColor, targetUV );

	}

	// private

	_sampleFaceIndex() {

		const cumulativeTotal = this.distribution[ this.distribution.length - 1 ];
		return this._binarySearch( this.randomFunction() * cumulativeTotal );

	}

	_binarySearch( x ) {

		const dist = this.distribution;
		let start = 0;
		let end = dist.length - 1;

		let index = - 1;

		while ( start <= end ) {

			const mid = Math.ceil( ( start + end ) / 2 );

			if ( mid === 0 || dist[ mid - 1 ] <= x && dist[ mid ] > x ) {

				index = mid;

				break;

			} else if ( x < dist[ mid ] ) {

				end = mid - 1;

			} else {

				start = mid + 1;

			}

		}

		return index;

	}

	_sampleFace( faceIndex, targetPosition, targetNormal, targetColor, targetUV ) {

		let u = this.randomFunction();
		let v = this.randomFunction();

		if ( u + v > 1 ) {

			u = 1 - u;
			v = 1 - v;

		}

		// get the vertex attribute indices
		const indexAttribute = this.indexAttribute;
		let i0 = faceIndex * 3;
		let i1 = faceIndex * 3 + 1;
		let i2 = faceIndex * 3 + 2;
		if ( indexAttribute ) {

			i0 = indexAttribute.getX( i0 );
			i1 = indexAttribute.getX( i1 );
			i2 = indexAttribute.getX( i2 );

		}

		vec3FromBufferAttribute( this.positionAttribute, i0, _face.a );
		vec3FromBufferAttribute( this.positionAttribute, i1, _face.b );
		vec3FromBufferAttribute( this.positionAttribute, i2, _face.c );

		vec3Set( targetPosition, 0, 0, 0 );
		vec3AddScaledVector( targetPosition, _face.a, u, targetPosition );
		vec3AddScaledVector( targetPosition, _face.b, v, targetPosition );
		vec3AddScaledVector( targetPosition, _face.c, 1 - ( u + v ), targetPosition );

		if ( targetNormal !== undefined ) {

			if ( this.normalAttribute !== undefined ) {

				vec3FromBufferAttribute( this.normalAttribute, i0, _face.a );
				vec3FromBufferAttribute( this.normalAttribute, i1, _face.b );
				vec3FromBufferAttribute( this.normalAttribute, i2, _face.c );
				vec3Set( targetNormal, 0, 0, 0 );
				vec3AddScaledVector( targetNormal, _face.a, u, targetNormal );
				vec3AddScaledVector( targetNormal, _face.b, v, targetNormal );
				vec3AddScaledVector( targetNormal, _face.c, 1 - ( u + v ), targetNormal );
				vec3Normalize( targetNormal, targetNormal );

			} else {

				triangleGetNormal( _face.a, _face.b, _face.c, targetNormal );

			}

		}

		if ( targetColor !== undefined && this.colorAttribute !== undefined ) {

			vec3FromBufferAttribute( this.colorAttribute, i0, _face.a );
			vec3FromBufferAttribute( this.colorAttribute, i1, _face.b );
			vec3FromBufferAttribute( this.colorAttribute, i2, _face.c );

			vec3Set( _color, 0, 0, 0 );
			vec3AddScaledVector( _color, _face.a, u, _color );
			vec3AddScaledVector( _color, _face.b, v, _color );
			vec3AddScaledVector( _color, _face.c, 1 - ( u + v ), _color );

			targetColor.r = _color.x;
			targetColor.g = _color.y;
			targetColor.b = _color.z;

		}

		if ( targetUV !== undefined && this.uvAttribute !== undefined ) {

			vec2FromBufferAttribute( this.uvAttribute, i0, _uva );
			vec2FromBufferAttribute( this.uvAttribute, i1, _uvb );
			vec2FromBufferAttribute( this.uvAttribute, i2, _uvc );
			vec2Set( 0, 0, targetUV );
			vec2AddScaledVector( targetUV, _uva, u, targetUV );
			vec2AddScaledVector( targetUV, _uvb, v, targetUV );
			vec2AddScaledVector( targetUV, _uvc, 1 - ( u + v ), targetUV );

		}

		return this;

	}

}

export { MeshSurfaceSampler };
