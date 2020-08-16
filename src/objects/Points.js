import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { PointsMaterial } from '../materials/PointsMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

const _inverseMatrix = new Matrix4();
const _ray = new Ray();
const _sphere = new Sphere();
const _position = new Vector3();

function Points( geometry, material ) {

	Object3D.call( this );

	this.type = 'Points';

	this.geometry = geometry !== undefined ? geometry : new BufferGeometry();
	this.material = material !== undefined ? material : new PointsMaterial();

	this.updateMorphTargets();

}

Points.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Points,

	isPoints: true,

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.material = source.material;
		this.geometry = source.geometry;

		return this;

	},

	raycast: function ( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Points.threshold;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		_sphere.copy( geometry.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );
		_sphere.radius += threshold;

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		//

		_inverseMatrix.getInverse( matrixWorld );
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		const localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		const localThresholdSq = localThreshold * localThreshold;

		if ( geometry.isBufferGeometry ) {

			const index = geometry.index;
			const attributes = geometry.attributes;
			const positions = attributes.position.array;

			if ( index !== null ) {

				const indices = index.array;

				for ( let i = 0, il = indices.length; i < il; i ++ ) {

					const a = indices[ i ];

					_position.fromArray( positions, a * 3 );

					testPoint( _position, a, localThresholdSq, matrixWorld, raycaster, intersects, this );

				}

			} else {

				for ( let i = 0, l = positions.length / 3; i < l; i ++ ) {

					_position.fromArray( positions, i * 3 );

					testPoint( _position, i, localThresholdSq, matrixWorld, raycaster, intersects, this );

				}

			}

		} else {

			const vertices = geometry.vertices;

			for ( let i = 0, l = vertices.length; i < l; i ++ ) {

				testPoint( vertices[ i ], i, localThresholdSq, matrixWorld, raycaster, intersects, this );

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

				console.error( 'THREE.Points.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.' );

			}

		}

	}

} );

function testPoint( point, index, localThresholdSq, matrixWorld, raycaster, intersects, object ) {

	const rayPointDistanceSq = _ray.distanceSqToPoint( point );

	if ( rayPointDistanceSq < localThresholdSq ) {

		const intersectPoint = new Vector3();

		_ray.closestPointToPoint( point, intersectPoint );
		intersectPoint.applyMatrix4( matrixWorld );

		const distance = raycaster.ray.origin.distanceTo( intersectPoint );

		if ( distance < raycaster.near || distance > raycaster.far ) return;

		intersects.push( {

			distance: distance,
			distanceToRay: Math.sqrt( rayPointDistanceSq ),
			point: intersectPoint,
			index: index,
			face: null,
			object: object

		} );

	}

}

export { Points };
