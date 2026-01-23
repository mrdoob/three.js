import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../constants.js';
import { Vector2 } from './Vector2.js';
import { Vector3 } from './Vector3.js';
import { Sphere } from './Sphere.js';
import { Plane } from './Plane.js';

const _sphere = /*@__PURE__*/ new Sphere();
const _defaultSpriteCenter = /*@__PURE__*/ new Vector2( 0.5, 0.5 );
const _vector = /*@__PURE__*/ new Vector3();

/**
 * Frustums are used to determine what is inside the camera's field of view.
 * They help speed up the rendering process - objects which lie outside a camera's
 * frustum can safely be excluded from rendering.
 *
 * This class is mainly intended for use internally by a renderer.
 */
class Frustum {

	/**
	 * Constructs a new frustum.
	 *
	 * @param {Plane} [p0] - The first plane that encloses the frustum.
	 * @param {Plane} [p1] - The second plane that encloses the frustum.
	 * @param {Plane} [p2] - The third plane that encloses the frustum.
	 * @param {Plane} [p3] - The fourth plane that encloses the frustum.
	 * @param {Plane} [p4] - The fifth plane that encloses the frustum.
	 * @param {Plane} [p5] - The sixth plane that encloses the frustum.
	 */
	constructor( p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane() ) {

		/**
		 * This array holds the planes that enclose the frustum.
		 *
		 * @type {Array<Plane>}
		 */
		this.planes = [ p0, p1, p2, p3, p4, p5 ];

	}

	/**
	 * Sets the frustum planes by copying the given planes.
	 *
	 * @param {Plane} [p0] - The first plane that encloses the frustum.
	 * @param {Plane} [p1] - The second plane that encloses the frustum.
	 * @param {Plane} [p2] - The third plane that encloses the frustum.
	 * @param {Plane} [p3] - The fourth plane that encloses the frustum.
	 * @param {Plane} [p4] - The fifth plane that encloses the frustum.
	 * @param {Plane} [p5] - The sixth plane that encloses the frustum.
	 * @return {Frustum} A reference to this frustum.
	 */
	set( p0, p1, p2, p3, p4, p5 ) {

		const planes = this.planes;

		planes[ 0 ].copy( p0 );
		planes[ 1 ].copy( p1 );
		planes[ 2 ].copy( p2 );
		planes[ 3 ].copy( p3 );
		planes[ 4 ].copy( p4 );
		planes[ 5 ].copy( p5 );

		return this;

	}

	/**
	 * Copies the values of the given frustum to this instance.
	 *
	 * @param {Frustum} frustum - The frustum to copy.
	 * @return {Frustum} A reference to this frustum.
	 */
	copy( frustum ) {

		const planes = this.planes;

		for ( let i = 0; i < 6; i ++ ) {

			planes[ i ].copy( frustum.planes[ i ] );

		}

		return this;

	}

	/**
	 * Sets the frustum planes from the given projection matrix.
	 *
	 * @param {Matrix4} m - The projection matrix.
	 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} coordinateSystem - The coordinate system.
	 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
	 * @return {Frustum} A reference to this frustum.
	 */
	setFromProjectionMatrix( m, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false ) {

		const planes = this.planes;
		const me = m.elements;
		const me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
		const me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
		const me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
		const me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

		planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
		planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
		planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
		planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();

		if ( reversedDepth ) {

			planes[ 4 ].setComponents( me2, me6, me10, me14 ).normalize(); // far
			planes[ 5 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize(); // near

		} else {

			planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize(); // far

			if ( coordinateSystem === WebGLCoordinateSystem ) {

				planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize(); // near

			} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

				planes[ 5 ].setComponents( me2, me6, me10, me14 ).normalize(); // near

			} else {

				throw new Error( 'THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: ' + coordinateSystem );

			}

		}

		return this;

	}

	/**
	 * Returns `true` if the 3D object's bounding sphere is intersecting this frustum.
	 *
	 * Note that the 3D object must have a geometry so that the bounding sphere can be calculated.
	 *
	 * @param {Object3D} object - The 3D object to test.
	 * @return {boolean} Whether the 3D object's bounding sphere is intersecting this frustum or not.
	 */
	intersectsObject( object ) {

		if ( object.boundingSphere !== undefined ) {

			if ( object.boundingSphere === null ) object.computeBoundingSphere();

			_sphere.copy( object.boundingSphere ).applyMatrix4( object.matrixWorld );

		} else {

			const geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			_sphere.copy( geometry.boundingSphere ).applyMatrix4( object.matrixWorld );

		}

		return this.intersectsSphere( _sphere );

	}

	/**
	 * Returns `true` if the given sprite is intersecting this frustum.
	 *
	 * @param {Sprite} sprite - The sprite to test.
	 * @return {boolean} Whether the sprite is intersecting this frustum or not.
	 */
	intersectsSprite( sprite ) {

		_sphere.center.set( 0, 0, 0 );

		const offset = _defaultSpriteCenter.distanceTo( sprite.center );

		_sphere.radius = 0.7071067811865476 + offset;
		_sphere.applyMatrix4( sprite.matrixWorld );

		return this.intersectsSphere( _sphere );

	}

	/**
	 * Returns `true` if the given bounding sphere is intersecting this frustum.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @return {boolean} Whether the bounding sphere is intersecting this frustum or not.
	 */
	intersectsSphere( sphere ) {

		const planes = this.planes;
		const center = sphere.center;
		const negRadius = - sphere.radius;

		for ( let i = 0; i < 6; i ++ ) {

			const distance = planes[ i ].distanceToPoint( center );

			if ( distance < negRadius ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Returns `true` if the given bounding box is intersecting this frustum.
	 *
	 * @param {Box3} box - The bounding box to test.
	 * @return {boolean} Whether the bounding box is intersecting this frustum or not.
	 */
	intersectsBox( box ) {

		const planes = this.planes;

		for ( let i = 0; i < 6; i ++ ) {

			const plane = planes[ i ];

			// corner at max distance

			_vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
			_vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
			_vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;

			if ( plane.distanceToPoint( _vector ) < 0 ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Returns `true` if the given point lies within the frustum.
	 *
	 * @param {Vector3} point - The point to test.
	 * @return {boolean} Whether the point lies within this frustum or not.
	 */
	containsPoint( point ) {

		const planes = this.planes;

		for ( let i = 0; i < 6; i ++ ) {

			if ( planes[ i ].distanceToPoint( point ) < 0 ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Returns a new frustum with copied values from this instance.
	 *
	 * @return {Frustum} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}


export { Frustum };
