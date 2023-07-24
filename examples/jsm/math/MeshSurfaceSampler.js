import {
	Triangle,
	Vector2,
	Vector3
} from 'three';

/**
 * Utility class for sampling weighted random points on the surface of a mesh.
 *
 * Building the sampler is a one-time O(n) operation. Once built, any number of
 * random samples may be selected in O(logn) time. Memory usage is O(n).
 *
 * References:
 * - http://www.joesfer.com/?p=84
 * - https://stackoverflow.com/a/4322940/1314762
 */

const _face = new Triangle();
const _color = new Vector3();
const _uva = new Vector2(), _uvb = new Vector2(), _uvc = new Vector2();

class MeshSurfaceSampler {

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

	setWeightAttribute( name ) {

		this.weightAttribute = name ? this.geometry.getAttribute( name ) : null;

		return this;

	}

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

			_face.a.fromBufferAttribute( positionAttribute, i0 );
			_face.b.fromBufferAttribute( positionAttribute, i1 );
			_face.c.fromBufferAttribute( positionAttribute, i2 );
			faceWeight *= _face.getArea();

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

	setRandomGenerator( randomFunction ) {

		this.randomFunction = randomFunction;
		return this;

	}

	sample( targetPosition, targetNormal, targetColor, targetUV ) {

		const faceIndex = this.sampleFaceIndex();
		return this.sampleFace( faceIndex, targetPosition, targetNormal, targetColor, targetUV );

	}

	sampleFaceIndex() {

		const cumulativeTotal = this.distribution[ this.distribution.length - 1 ];
		return this.binarySearch( this.randomFunction() * cumulativeTotal );

	}

	binarySearch( x ) {

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

	sampleFace( faceIndex, targetPosition, targetNormal, targetColor, targetUV ) {

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

		_face.a.fromBufferAttribute( this.positionAttribute, i0 );
		_face.b.fromBufferAttribute( this.positionAttribute, i1 );
		_face.c.fromBufferAttribute( this.positionAttribute, i2 );

		targetPosition
			.set( 0, 0, 0 )
			.addScaledVector( _face.a, u )
			.addScaledVector( _face.b, v )
			.addScaledVector( _face.c, 1 - ( u + v ) );

		if ( targetNormal !== undefined ) {

			if ( this.normalAttribute !== undefined ) {

				_face.a.fromBufferAttribute( this.normalAttribute, i0 );
				_face.b.fromBufferAttribute( this.normalAttribute, i1 );
				_face.c.fromBufferAttribute( this.normalAttribute, i2 );
				targetNormal.set( 0, 0, 0 ).addScaledVector( _face.a, u ).addScaledVector( _face.b, v ).addScaledVector( _face.c, 1 - ( u + v ) ).normalize();

			} else {

				_face.getNormal( targetNormal );

			}

		}

		if ( targetColor !== undefined && this.colorAttribute !== undefined ) {

			_face.a.fromBufferAttribute( this.colorAttribute, i0 );
			_face.b.fromBufferAttribute( this.colorAttribute, i1 );
			_face.c.fromBufferAttribute( this.colorAttribute, i2 );

			_color
				.set( 0, 0, 0 )
				.addScaledVector( _face.a, u )
				.addScaledVector( _face.b, v )
				.addScaledVector( _face.c, 1 - ( u + v ) );

			targetColor.r = _color.x;
			targetColor.g = _color.y;
			targetColor.b = _color.z;

		}

		if ( targetUV !== undefined && this.uvAttribute !== undefined ) {

			_uva.fromBufferAttribute( this.uvAttribute, i0 );
			_uvb.fromBufferAttribute( this.uvAttribute, i1 );
			_uvc.fromBufferAttribute( this.uvAttribute, i2 );
			targetUV.set( 0, 0 ).addScaledVector( _uva, u ).addScaledVector( _uvb, v ).addScaledVector( _uvc, 1 - ( u + v ) );

		}

		return this;

	}

}

export { MeshSurfaceSampler };
