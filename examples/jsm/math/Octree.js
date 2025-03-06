import {
	Box3,
	Line3,
	Plane,
	Sphere,
	Triangle,
	Vector3,
	Layers
} from 'three';
import { Capsule } from '../math/Capsule.js';


const _v1 = new Vector3();
const _v2 = new Vector3();
const _point1 = new Vector3();
const _point2 = new Vector3();
const _plane = new Plane();
const _line1 = new Line3();
const _line2 = new Line3();
const _sphere = new Sphere();
const _capsule = new Capsule();

const _temp1 = new Vector3();
const _temp2 = new Vector3();
const _temp3 = new Vector3();
const EPS = 1e-10;

function lineToLineClosestPoints( line1, line2, target1 = null, target2 = null ) {

	const r = _temp1.copy( line1.end ).sub( line1.start );
	const s = _temp2.copy( line2.end ).sub( line2.start );
	const w = _temp3.copy( line2.start ).sub( line1.start );

	const a = r.dot( s ),
		b = r.dot( r ),
		c = s.dot( s ),
		d = s.dot( w ),
		e = r.dot( w );

	let t1, t2;
	const divisor = b * c - a * a;

	if ( Math.abs( divisor ) < EPS ) {

		const d1 = - d / c;
		const d2 = ( a - d ) / c;

		if ( Math.abs( d1 - 0.5 ) < Math.abs( d2 - 0.5 ) ) {

			t1 = 0;
			t2 = d1;

		} else {

			t1 = 1;
			t2 = d2;

		}

	} else {

		t1 = ( d * a + e * c ) / divisor;
		t2 = ( t1 * a - d ) / c;

	}

	t2 = Math.max( 0, Math.min( 1, t2 ) );
	t1 = Math.max( 0, Math.min( 1, t1 ) );

	if ( target1 ) {

		target1.copy( r ).multiplyScalar( t1 ).add( line1.start );

	}

	if ( target2 ) {

		target2.copy( s ).multiplyScalar( t2 ).add( line2.start );

	}

}

/**
 * An octree is a hierarchical tree data structure used to partition a three-dimensional
 * space by recursively subdividing it into eight octants.
 *
 * This particular implementation can have up to sixteen levels and stores up to eight triangles
 * in leaf nodes.
 *
 * `Octree` can be used in games to compute collision between the game world and colliders from
 * the player or other dynamic 3D objects.
 *
 *
 * ```js
 * const octree = new Octree().fromGraphNode( scene );
 * const result = octree.capsuleIntersect( playerCollider ); // collision detection
 * ```
 */
class Octree {

	/**
	 * Constructs a new Octree.
	 *
	 * @param {Box3} [box] - The base box with enclose the entire Octree.
	 */
	constructor( box ) {

		/**
		 * The base box with enclose the entire Octree.
		 *
		 * @type {Box3}
		 */
		this.box = box;

		/**
		 * The bounds of the Octree. Compared to {@link Octree#box}, no
		 * margin is applied.
		 *
		 * @type {Box3}
		 */
		this.bounds = new Box3();

		/**
		 * Can by used for layers configuration for refine testing.
		 *
		 * @type {Layers}
		 */
		this.layers = new Layers();

		// private

		this.subTrees = [];
		this.triangles = [];

	}

	/**
	 * Adds the given triangle to the Octree. The triangle vertices are clamped if they exceed
	 * the bounds of the Octree.
	 *
	 * @param {Triangle} triangle - The triangle to add.
	 * @return {Octree} A reference to this Octree.
	 */
	addTriangle( triangle ) {

		this.bounds.min.x = Math.min( this.bounds.min.x, triangle.a.x, triangle.b.x, triangle.c.x );
		this.bounds.min.y = Math.min( this.bounds.min.y, triangle.a.y, triangle.b.y, triangle.c.y );
		this.bounds.min.z = Math.min( this.bounds.min.z, triangle.a.z, triangle.b.z, triangle.c.z );
		this.bounds.max.x = Math.max( this.bounds.max.x, triangle.a.x, triangle.b.x, triangle.c.x );
		this.bounds.max.y = Math.max( this.bounds.max.y, triangle.a.y, triangle.b.y, triangle.c.y );
		this.bounds.max.z = Math.max( this.bounds.max.z, triangle.a.z, triangle.b.z, triangle.c.z );

		this.triangles.push( triangle );

		return this;

	}

	/**
	 * Prepares {@link Octree#box} for the build.
	 *
	 * @return {Octree} A reference to this Octree.
	 */
	calcBox() {

		this.box = this.bounds.clone();

		// offset small amount to account for regular grid
		this.box.min.x -= 0.01;
		this.box.min.y -= 0.01;
		this.box.min.z -= 0.01;

		return this;

	}

	/**
	 * Splits the Octree. This method is used recursively when
	 * building the Octree.
	 *
	 * @param {number} level - The current level.
	 * @return {Octree} A reference to this Octree.
	 */
	split( level ) {

		if ( ! this.box ) return;

		const subTrees = [];
		const halfsize = _v2.copy( this.box.max ).sub( this.box.min ).multiplyScalar( 0.5 );

		for ( let x = 0; x < 2; x ++ ) {

			for ( let y = 0; y < 2; y ++ ) {

				for ( let z = 0; z < 2; z ++ ) {

					const box = new Box3();
					const v = _v1.set( x, y, z );

					box.min.copy( this.box.min ).add( v.multiply( halfsize ) );
					box.max.copy( box.min ).add( halfsize );

					subTrees.push( new Octree( box ) );

				}

			}

		}

		let triangle;

		while ( triangle = this.triangles.pop() ) {

			for ( let i = 0; i < subTrees.length; i ++ ) {

				if ( subTrees[ i ].box.intersectsTriangle( triangle ) ) {

					subTrees[ i ].triangles.push( triangle );

				}

			}

		}

		for ( let i = 0; i < subTrees.length; i ++ ) {

			const len = subTrees[ i ].triangles.length;

			if ( len > 8 && level < 16 ) {

				subTrees[ i ].split( level + 1 );

			}

			if ( len !== 0 ) {

				this.subTrees.push( subTrees[ i ] );

			}

		}

		return this;

	}

	/**
	 * Builds the Octree.
	 *
	 * @return {Octree} A reference to this Octree.
	 */
	build() {

		this.calcBox();
		this.split( 0 );

		return this;

	}

	/**
	 * Computes the triangles that potentially intersect with the given ray.
	 *
	 * @param {Ray} ray - The ray to test.
	 * @param {Array<Triangle>} triangles - The target array that holds the triangles.
	 */
	getRayTriangles( ray, triangles ) {

		for ( let i = 0; i < this.subTrees.length; i ++ ) {

			const subTree = this.subTrees[ i ];
			if ( ! ray.intersectsBox( subTree.box ) ) continue;

			if ( subTree.triangles.length > 0 ) {

				for ( let j = 0; j < subTree.triangles.length; j ++ ) {

					if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

				}

			} else {

				subTree.getRayTriangles( ray, triangles );

			}

		}

	}

	/**
	 * Computes the intersection between the given capsule and triangle.
	 *
	 * @param {Capsule} capsule - The capsule to test.
	 * @param {Triangle} triangle - The triangle to test.
	 * @return {Object|false} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	triangleCapsuleIntersect( capsule, triangle ) {

		triangle.getPlane( _plane );

		const d1 = _plane.distanceToPoint( capsule.start ) - capsule.radius;
		const d2 = _plane.distanceToPoint( capsule.end ) - capsule.radius;

		if ( ( d1 > 0 && d2 > 0 ) || ( d1 < - capsule.radius && d2 < - capsule.radius ) ) {

			return false;

		}

		const delta = Math.abs( d1 / ( Math.abs( d1 ) + Math.abs( d2 ) ) );
		const intersectPoint = _v1.copy( capsule.start ).lerp( capsule.end, delta );

		if ( triangle.containsPoint( intersectPoint ) ) {

			return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs( Math.min( d1, d2 ) ) };

		}

		const r2 = capsule.radius * capsule.radius;

		const line1 = _line1.set( capsule.start, capsule.end );

		const lines = [
			[ triangle.a, triangle.b ],
			[ triangle.b, triangle.c ],
			[ triangle.c, triangle.a ]
		];

		for ( let i = 0; i < lines.length; i ++ ) {

			const line2 = _line2.set( lines[ i ][ 0 ], lines[ i ][ 1 ] );

			lineToLineClosestPoints( line1, line2, _point1, _point2 );

			if ( _point1.distanceToSquared( _point2 ) < r2 ) {

				return {
					normal: _point1.clone().sub( _point2 ).normalize(),
					point: _point2.clone(),
					depth: capsule.radius - _point1.distanceTo( _point2 )
				};

			}

		}

		return false;

	}

	/**
	 * Computes the intersection between the given sphere and triangle.
	 *
	 * @param {Sphere} sphere - The sphere to test.
	 * @param {Triangle} triangle - The triangle to test.
	 * @return {Object|false} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	triangleSphereIntersect( sphere, triangle ) {

		triangle.getPlane( _plane );

		if ( ! sphere.intersectsPlane( _plane ) ) return false;

		const depth = Math.abs( _plane.distanceToSphere( sphere ) );
		const r2 = sphere.radius * sphere.radius - depth * depth;

		const plainPoint = _plane.projectPoint( sphere.center, _v1 );

		if ( triangle.containsPoint( sphere.center ) ) {

			return { normal: _plane.normal.clone(), point: plainPoint.clone(), depth: Math.abs( _plane.distanceToSphere( sphere ) ) };

		}

		const lines = [
			[ triangle.a, triangle.b ],
			[ triangle.b, triangle.c ],
			[ triangle.c, triangle.a ]
		];

		for ( let i = 0; i < lines.length; i ++ ) {

			_line1.set( lines[ i ][ 0 ], lines[ i ][ 1 ] );
			_line1.closestPointToPoint( plainPoint, true, _v2 );

			const d = _v2.distanceToSquared( sphere.center );

			if ( d < r2 ) {

				return { normal: sphere.center.clone().sub( _v2 ).normalize(), point: _v2.clone(), depth: sphere.radius - Math.sqrt( d ) };

			}

		}

		return false;

	}

	/**
	 * Computes the triangles that potentially intersect with the given bounding sphere.
	 *
	 * @param {Sphere} sphere - The sphere to test.
	 * @param {Array<Triangle>} triangles - The target array that holds the triangles.
	 */
	getSphereTriangles( sphere, triangles ) {

		for ( let i = 0; i < this.subTrees.length; i ++ ) {

			const subTree = this.subTrees[ i ];

			if ( ! sphere.intersectsBox( subTree.box ) ) continue;

			if ( subTree.triangles.length > 0 ) {

				for ( let j = 0; j < subTree.triangles.length; j ++ ) {

					if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

				}

			} else {

				subTree.getSphereTriangles( sphere, triangles );

			}

		}

	}

	/**
	 * Computes the triangles that potentially intersect with the given capsule.
	 *
	 * @param {Capsule} capsule - The capsule to test.
	 * @param {Array<Triangle>} triangles - The target array that holds the triangles.
	 */
	getCapsuleTriangles( capsule, triangles ) {

		for ( let i = 0; i < this.subTrees.length; i ++ ) {

			const subTree = this.subTrees[ i ];

			if ( ! capsule.intersectsBox( subTree.box ) ) continue;

			if ( subTree.triangles.length > 0 ) {

				for ( let j = 0; j < subTree.triangles.length; j ++ ) {

					if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

				}

			} else {

				subTree.getCapsuleTriangles( capsule, triangles );

			}

		}

	}

	/**
	 * Performs a bounding sphere intersection test with this Octree.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @return {Object|boolean} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	sphereIntersect( sphere ) {

		_sphere.copy( sphere );

		const triangles = [];
		let result, hit = false;

		this.getSphereTriangles( sphere, triangles );

		for ( let i = 0; i < triangles.length; i ++ ) {

			if ( result = this.triangleSphereIntersect( _sphere, triangles[ i ] ) ) {

				hit = true;

				_sphere.center.add( result.normal.multiplyScalar( result.depth ) );

			}

		}

		if ( hit ) {

			const collisionVector = _sphere.center.clone().sub( sphere.center );
			const depth = collisionVector.length();

			return { normal: collisionVector.normalize(), depth: depth };

		}

		return false;

	}

	/**
	 * Performs a capsule intersection test with this Octree.
	 *
	 * @param {Capsule} capsule - The capsule to test.
	 * @return {Object|boolean} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	capsuleIntersect( capsule ) {

		_capsule.copy( capsule );

		const triangles = [];
		let result, hit = false;

		this.getCapsuleTriangles( _capsule, triangles );

		for ( let i = 0; i < triangles.length; i ++ ) {

			if ( result = this.triangleCapsuleIntersect( _capsule, triangles[ i ] ) ) {

				hit = true;

				_capsule.translate( result.normal.multiplyScalar( result.depth ) );

			}

		}

		if ( hit ) {

			const collisionVector = _capsule.getCenter( new Vector3() ).sub( capsule.getCenter( _v1 ) );
			const depth = collisionVector.length();

			return { normal: collisionVector.normalize(), depth: depth };

		}

		return false;

	}

	/**
	 * Performs a ray intersection test with this Octree.
	 *
	 * @param {Ray} ray - The ray to test.
	 * @return {Object|boolean} The nearest intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	rayIntersect( ray ) {

		const triangles = [];
		let triangle, position, distance = 1e100;

		this.getRayTriangles( ray, triangles );

		for ( let i = 0; i < triangles.length; i ++ ) {

			const result = ray.intersectTriangle( triangles[ i ].a, triangles[ i ].b, triangles[ i ].c, true, _v1 );

			if ( result ) {

				const newdistance = result.sub( ray.origin ).length();

				if ( distance > newdistance ) {

					position = result.clone().add( ray.origin );
					distance = newdistance;
					triangle = triangles[ i ];

				}

			}

		}

		return distance < 1e100 ? { distance: distance, triangle: triangle, position: position } : false;

	}

	/**
	 * Constructs the Octree from the given 3D object.
	 *
	 * @param {Object3D} group - The scene graph node.
	 * @return {Octree} A reference to this Octree.
	 */
	fromGraphNode( group ) {

		group.updateWorldMatrix( true, true );

		group.traverse( ( obj ) => {

			if ( obj.isMesh === true ) {

				if ( this.layers.test( obj.layers ) ) {

					let geometry, isTemp = false;

					if ( obj.geometry.index !== null ) {

						isTemp = true;
						geometry = obj.geometry.toNonIndexed();

					} else {

						geometry = obj.geometry;

					}

					const positionAttribute = geometry.getAttribute( 'position' );

					for ( let i = 0; i < positionAttribute.count; i += 3 ) {

						const v1 = new Vector3().fromBufferAttribute( positionAttribute, i );
						const v2 = new Vector3().fromBufferAttribute( positionAttribute, i + 1 );
						const v3 = new Vector3().fromBufferAttribute( positionAttribute, i + 2 );

						v1.applyMatrix4( obj.matrixWorld );
						v2.applyMatrix4( obj.matrixWorld );
						v3.applyMatrix4( obj.matrixWorld );

						this.addTriangle( new Triangle( v1, v2, v3 ) );

					}

					if ( isTemp ) {

						geometry.dispose();

					}

				}

			}

		} );

		this.build();

		return this;

	}

	/**
	 * Clears the Octree by making it empty.
	 *
	 * @return {Octree} A reference to this Octree.
	 */
	clear() {

		this.box = null;
		this.bounds.makeEmpty();

		this.subTrees.length = 0;
		this.triangles.length = 0;

		return this;

	}

}

export { Octree };
