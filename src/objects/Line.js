import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

const _start = /*@__PURE__*/ new Vector3();
const _end = /*@__PURE__*/ new Vector3();
const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();

class Line extends Object3D {

	constructor( geometry = new BufferGeometry(), material = new LineBasicMaterial() ) {

		super();

		this.isLine = true;

		this.type = 'Line';

		this.geometry = geometry;
		this.material = material;

		this.updateMorphTargets();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.material = source.material;
		this.geometry = source.geometry;

		return this;

	}

	computeLineDistances() {

		const geometry = this.geometry;

		// we assume non-indexed geometry

		if ( geometry.index === null ) {

			const positionAttribute = geometry.attributes.position;
			const lineDistances = [ 0 ];

			for ( let i = 1, l = positionAttribute.count; i < l; i ++ ) {

				_start.fromBufferAttribute( positionAttribute, i - 1 );
				_end.fromBufferAttribute( positionAttribute, i );

				lineDistances[ i ] = lineDistances[ i - 1 ];
				lineDistances[ i ] += _start.distanceTo( _end );

			}

			geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

		} else {

			console.warn( 'THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

		}

		return this;

	}

	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Line.threshold;
		const drawRange = geometry.drawRange;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		_sphere.copy( geometry.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );
		_sphere.radius += threshold;

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		//

		_inverseMatrix.copy( matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		const localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		const localThresholdSq = localThreshold * localThreshold;

		const vStart = new Vector3();
		const vEnd = new Vector3();
		const interSegment = new Vector3();
		const interRay = new Vector3();
		const step = this.isLineSegments ? 2 : 1;

		const index = geometry.index;
		const attributes = geometry.attributes;
		const positionAttribute = attributes.position;

		if ( index !== null ) {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end - 1; i < l; i += step ) {

				const a = index.getX( i );
				const b = index.getX( i + 1 );

				vStart.fromBufferAttribute( positionAttribute, a );
				vEnd.fromBufferAttribute( positionAttribute, b );

				const distSq = _ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

				if ( distSq > localThresholdSq ) continue;

				interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

				const distance = raycaster.ray.origin.distanceTo( interRay );

				if ( distance < raycaster.near || distance > raycaster.far ) continue;

				intersects.push( {

					distance: distance,
					// What do we want? intersection point on the ray or on the segment??
					// point: raycaster.ray.at( distance ),
					point: interSegment.clone().applyMatrix4( this.matrixWorld ),
					index: i,
					face: null,
					faceIndex: null,
					object: this

				} );

			}

		} else {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end - 1; i < l; i += step ) {

				vStart.fromBufferAttribute( positionAttribute, i );
				vEnd.fromBufferAttribute( positionAttribute, i + 1 );

				const distSq = _ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

				if ( distSq > localThresholdSq ) continue;

				interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

				const distance = raycaster.ray.origin.distanceTo( interRay );

				if ( distance < raycaster.near || distance > raycaster.far ) continue;

				intersects.push( {

					distance: distance,
					// What do we want? intersection point on the ray or on the segment??
					// point: raycaster.ray.at( distance ),
					point: interSegment.clone().applyMatrix4( this.matrixWorld ),
					index: i,
					face: null,
					faceIndex: null,
					object: this

				} );

			}

		}

	}

	updateMorphTargets() {

		const geometry = this.geometry;

		const morphAttributes = geometry.morphAttributes;
		const keys = Object.keys( morphAttributes );

		if ( keys.length > 0 ) {

			const morphAttribute = morphAttributes[ keys[ 0 ] ];

			if ( morphAttribute !== undefined ) {

				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};

				for ( let m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

					const name = morphAttribute[ m ].name || String( m );

					this.morphTargetInfluences.push( 0 );
					this.morphTargetDictionary[ name ] = m;

				}

			}

		}

	}

}

export { Line };
