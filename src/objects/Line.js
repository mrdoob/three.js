import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

const _start = new Vector3();
const _end = new Vector3();
const _inverseMatrix = new Matrix4();
const _ray = new Ray();
const _sphere = new Sphere();

function Line( geometry, material, mode ) {

	if ( mode === 1 ) {

		console.error( 'THREE.Line: parameter THREE.LinePieces no longer supported. Use THREE.LineSegments instead.' );

	}

	Object3D.call( this );

	this.type = 'Line';

	this.geometry = geometry !== undefined ? geometry : new BufferGeometry();
	this.material = material !== undefined ? material : new LineBasicMaterial();

	this.updateMorphTargets();

}

Line.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Line,

	isLine: true,

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.material = source.material;
		this.geometry = source.geometry;

		return this;

	},

	computeLineDistances: function () {

		const geometry = this.geometry;

		if ( geometry.isBufferGeometry ) {

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

		} else if ( geometry.isGeometry ) {

			const vertices = geometry.vertices;
			const lineDistances = geometry.lineDistances;

			lineDistances[ 0 ] = 0;

			for ( let i = 1, l = vertices.length; i < l; i ++ ) {

				lineDistances[ i ] = lineDistances[ i - 1 ];
				lineDistances[ i ] += vertices[ i - 1 ].distanceTo( vertices[ i ] );

			}

		}

		return this;

	},

	raycast: function ( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Line.threshold;

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

		if ( geometry.isBufferGeometry ) {

			const index = geometry.index;
			const attributes = geometry.attributes;
			const positionAttribute = attributes.position;

			if ( index !== null ) {

				const indices = index.array;

				for ( let i = 0, l = indices.length - 1; i < l; i += step ) {

					const a = indices[ i ];
					const b = indices[ i + 1 ];

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

				for ( let i = 0, l = positionAttribute.count - 1; i < l; i += step ) {

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

		} else if ( geometry.isGeometry ) {

			const vertices = geometry.vertices;
			const nbVertices = vertices.length;

			for ( let i = 0; i < nbVertices - 1; i += step ) {

				const distSq = _ray.distanceSqToSegment( vertices[ i ], vertices[ i + 1 ], interRay, interSegment );

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

	},

	updateMorphTargets: function () {

		const geometry = this.geometry;

		if ( geometry.isBufferGeometry ) {

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

		} else {

			const morphTargets = geometry.morphTargets;

			if ( morphTargets !== undefined && morphTargets.length > 0 ) {

				console.error( 'THREE.Line.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.' );

			}

		}

	}

} );


export { Line };
