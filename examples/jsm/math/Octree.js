import {
	Layers,
	box3Copy,
	box3Create,
	box3GetCenter,
	box3IntersectsBox,
	box3IntersectsTriangle,
	box3MakeEmpty,
	box3Translate,
	line3ClosestPointToPoint,
	line3Create,
	line3Set,
	planeCreate,
	planeDistanceToPoint,
	planeDistanceToSphere,
	planeProjectPoint,
	rayIntersectTriangle,
	rayIntersectsBox,
	sphereCopy,
	sphereCreate,
	sphereIntersectsBox,
	sphereIntersectsPlane,
	triangleContainsPoint,
	triangleGetPlane,
	vec3Add,
	vec3AddScaledVector,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3DistanceTo,
	vec3DistanceToSquared,
	vec3Dot,
	vec3FromBufferAttribute,
	vec3Length,
	vec3Lerp,
	vec3Multiply,
	vec3MultiplyScalar,
	vec3Normalize,
	vec3Set,
	vec3Sub
} from 'three';
import { Capsule } from '../math/Capsule.js';


const _v1 = /*@__PURE__*/ vec3Create();
const _v2 = /*@__PURE__*/ vec3Create();
const _point1 = /*@__PURE__*/ vec3Create();
const _point2 = /*@__PURE__*/ vec3Create();
const _plane = /*@__PURE__*/ planeCreate();
const _line1 = /*@__PURE__*/ line3Create();
const _line2 = /*@__PURE__*/ line3Create();
const _box = /*@__PURE__*/ box3Create();
const _sphere = /*@__PURE__*/ sphereCreate();
const _capsule = new Capsule();
const _center = /*@__PURE__*/ vec3Create();

const _temp1 = /*@__PURE__*/ vec3Create();
const _temp2 = /*@__PURE__*/ vec3Create();
const _temp3 = /*@__PURE__*/ vec3Create();
const EPS = 1e-10;

function lineToLineClosestPoints( line1, line2, target1 = null, target2 = null ) {

	vec3Sub( vec3Copy( line1.end, _temp1 ), line1.start, _temp1 );
	vec3Sub( vec3Copy( line2.end, _temp2 ), line2.start, _temp2 );
	vec3Sub( vec3Copy( line2.start, _temp3 ), line1.start, _temp3 );

	const a = vec3Dot( _temp1, _temp2 ),
		b = vec3Dot( _temp1, _temp1 ),
		c = vec3Dot( _temp2, _temp2 ),
		d = vec3Dot( _temp2, _temp3 ),
		e = vec3Dot( _temp1, _temp3 );

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

		vec3Add( vec3MultiplyScalar( vec3Copy( _temp1, target1 ), t1, target1 ), line1.start, target1 );

	}

	if ( target2 ) {

		vec3Add( vec3MultiplyScalar( vec3Copy( _temp2, target2 ), t2, target2 ), line2.start, target2 );

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
 *
 * @three_import import { Octree } from 'three/addons/math/Octree.js';
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
		this.bounds = box3Create();

		/**
		 * Can by used for layers configuration for refine testing.
		 *
		 * @type {Layers}
		 */
		this.layers = new Layers();

		/**
		 * The number of triangles a leaf can store before it is split.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.trianglesPerLeaf = 8;

		/**
		 * The maximum level of the Octree. It defines the maximum
		 * hierarchical depth of the data structure.
		 *
		 * @type {number}
		 * @default 16
		 */
		this.maxLevel = 16;

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

		this.box = box3Copy( this.bounds );

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
		vec3MultiplyScalar( vec3Sub( vec3Copy( this.box.max, _v2 ), this.box.min, _v2 ), 0.5, _v2 );

		for ( let x = 0; x < 2; x ++ ) {

			for ( let y = 0; y < 2; y ++ ) {

				for ( let z = 0; z < 2; z ++ ) {

					const box = box3Create();

					vec3Set( _v1, x, y, z );

					vec3Add( vec3Copy( this.box.min, box.min ), vec3Multiply( _v1, _v2, _v1 ), box.min );
					vec3Add( vec3Copy( box.min, box.max ), _v2, box.max );

					subTrees.push( new Octree( box ) );

				}

			}

		}

		let triangle;

		while ( triangle = this.triangles.pop() ) {

			for ( let i = 0; i < subTrees.length; i ++ ) {

				if ( box3IntersectsTriangle( subTrees[ i ].box, triangle ) ) {

					subTrees[ i ].triangles.push( triangle );

				}

			}

		}

		for ( let i = 0; i < subTrees.length; i ++ ) {

			const len = subTrees[ i ].triangles.length;

			if ( len > this.trianglesPerLeaf && level < this.maxLevel ) {

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
			if ( ! rayIntersectsBox( ray, subTree.box ) ) continue;

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

		triangleGetPlane( triangle, _plane );

		const d1 = planeDistanceToPoint( _plane, capsule.start ) - capsule.radius;
		const d2 = planeDistanceToPoint( _plane, capsule.end ) - capsule.radius;

		if ( ( d1 > 0 && d2 > 0 ) || ( d1 < - capsule.radius && d2 < - capsule.radius ) ) {

			return false;

		}

		const delta = Math.abs( d1 / ( Math.abs( d1 ) + Math.abs( d2 ) ) );
		vec3Lerp( capsule.start, capsule.end, delta, _v1 );

		if ( triangleContainsPoint( _v1, triangle.a, triangle.b, triangle.c ) ) {

			return { normal: vec3Copy( _plane.normal ), point: vec3Copy( _v1 ), depth: Math.abs( Math.min( d1, d2 ) ) };

		}

		const r2 = capsule.radius * capsule.radius;

		line3Set( capsule.start, capsule.end, _line1 );

		const lines = [
			[ triangle.a, triangle.b ],
			[ triangle.b, triangle.c ],
			[ triangle.c, triangle.a ]
		];

		for ( let i = 0; i < lines.length; i ++ ) {

			line3Set( lines[ i ][ 0 ], lines[ i ][ 1 ], _line2 );

			lineToLineClosestPoints( _line1, _line2, _point1, _point2 );

			if ( vec3DistanceToSquared( _point1, _point2 ) < r2 ) {

				return {
					normal: vec3Normalize( vec3Sub( _point1, _point2 ) ),
					point: vec3Copy( _point2 ),
					depth: capsule.radius - vec3DistanceTo( _point1, _point2 )
				};

			}

		}

		return false;

	}

	/**
	 * Computes the intersection between the given bounding box and triangle.
	 *
	 * @param {Box3} box - The bounding box to test.
	 * @param {Triangle} triangle - The triangle to test.
	 * @return {Object|false} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	triangleBoxIntersect( box, triangle ) {

		// cheap check

		if ( Math.max( triangle.a.x, triangle.b.x, triangle.c.x ) < box.min.x ||
				Math.min( triangle.a.x, triangle.b.x, triangle.c.x ) > box.max.x ||
				Math.max( triangle.a.y, triangle.b.y, triangle.c.y ) < box.min.y ||
				Math.min( triangle.a.y, triangle.b.y, triangle.c.y ) > box.max.y ||
				Math.max( triangle.a.z, triangle.b.z, triangle.c.z ) < box.min.z ||
				Math.min( triangle.a.z, triangle.b.z, triangle.c.z ) > box.max.z ) {

			return false;

		}

		// expensive check

		if ( ! box3IntersectsTriangle( box, triangle ) ) return false;

		// there is an intersection, now compute collision data

		triangleGetPlane( triangle, _plane );

		// determine which corner of the box is "deepest" into the plane

		_v1.x = ( _plane.normal.x > 0 ) ? box.min.x : box.max.x;
		_v1.y = ( _plane.normal.y > 0 ) ? box.min.y : box.max.y;
		_v1.z = ( _plane.normal.z > 0 ) ? box.min.z : box.max.z;

		// Calculate the distance from the plane to that corner (the distance will be negative
		// because of the intersection)

		const distance = planeDistanceToPoint( _plane, _v1 );

		const intersection = {
			depth: - distance, // Flip sign so depth is positive
			normal: vec3Copy( _plane.normal ),
			point: vec3Copy( _v1 )
		};

		// project the point onto the triangle surface
		vec3AddScaledVector( intersection.point, intersection.normal, distance, intersection.point );

		return intersection;

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

		triangleGetPlane( triangle, _plane );

		if ( ! sphereIntersectsPlane( sphere, _plane ) ) return false;

		const depth = Math.abs( planeDistanceToSphere( _plane, sphere ) );
		const r2 = sphere.radius * sphere.radius - depth * depth;

		planeProjectPoint( _plane, sphere.center, _v1 );

		if ( triangleContainsPoint( sphere.center, triangle.a, triangle.b, triangle.c ) ) {

			return { normal: vec3Copy( _plane.normal ), point: vec3Copy( _v1 ), depth: Math.abs( planeDistanceToSphere( _plane, sphere ) ) };

		}

		const lines = [
			[ triangle.a, triangle.b ],
			[ triangle.b, triangle.c ],
			[ triangle.c, triangle.a ]
		];

		for ( let i = 0; i < lines.length; i ++ ) {

			line3Set( lines[ i ][ 0 ], lines[ i ][ 1 ], _line1 );
			line3ClosestPointToPoint( _line1, _v1, true, _v2 );

			const d = vec3DistanceToSquared( _v2, sphere.center );

			if ( d < r2 ) {

				return { normal: vec3Normalize( vec3Sub( sphere.center, _v2 ) ), point: vec3Copy( _v2 ), depth: sphere.radius - Math.sqrt( d ) };

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

			if ( ! sphereIntersectsBox( sphere, subTree.box ) ) continue;

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
	 * Computes the triangles that potentially intersect with the given bounding box.
	 *
	 * @param {Box3} box - The bounding box.
	 * @param {Array<Triangle>} triangles - The target array that holds the triangles.
	 */
	getBoxTriangles( box, triangles ) {

		for ( let i = 0; i < this.subTrees.length; i ++ ) {

			const subTree = this.subTrees[ i ];

			if ( ! box3IntersectsBox( box, subTree.box ) ) continue;

			if ( subTree.triangles.length > 0 ) {

				for ( let j = 0; j < subTree.triangles.length; j ++ ) {

					if ( triangles.indexOf( subTree.triangles[ j ] ) === - 1 ) triangles.push( subTree.triangles[ j ] );

				}

			} else {

				subTree.getBoxTriangles( box, triangles );

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
	 * Performs a bounding box intersection test with this Octree.
	 *
	 * @param {Box3} box - The bounding box to test.
	 * @return {Object|boolean} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	boxIntersect( box ) {

		box3Copy( box, _box );

		const triangles = [];
		let result, hit = false;

		this.getBoxTriangles( box, triangles );

		for ( let i = 0; i < triangles.length; i ++ ) {

			if ( result = this.triangleBoxIntersect( _box, triangles[ i ] ) ) {

				hit = true;

				box3Translate( _box, vec3MultiplyScalar( result.normal, result.depth, result.normal ), _box );

			}

		}

		if ( hit ) {

			vec3Sub( box3GetCenter( _box, _center ), box3GetCenter( box, _v1 ), _center );
			const depth = vec3Length( _center );

			return { normal: vec3Normalize( _center, _center ), depth: depth };

		}

		return false;

	}

	/**
	 * Performs a bounding sphere intersection test with this Octree.
	 *
	 * @param {Sphere} sphere - The bounding sphere to test.
	 * @return {Object|boolean} The intersection object. If no intersection
	 * is detected, the method returns `false`.
	 */
	sphereIntersect( sphere ) {

		sphereCopy( sphere, _sphere );

		const triangles = [];
		let result, hit = false;

		this.getSphereTriangles( sphere, triangles );

		for ( let i = 0; i < triangles.length; i ++ ) {

			if ( result = this.triangleSphereIntersect( _sphere, triangles[ i ] ) ) {

				hit = true;

				vec3Add( _sphere.center, vec3MultiplyScalar( result.normal, result.depth, result.normal ), _sphere.center );

			}

		}

		if ( hit ) {

			const collisionVector = vec3Sub( _sphere.center, sphere.center );
			const depth = vec3Length( collisionVector );

			return { normal: vec3Normalize( collisionVector, collisionVector ), depth: depth };

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

				_capsule.translate( vec3MultiplyScalar( result.normal, result.depth, result.normal ) );

			}

		}

		if ( hit ) {

			_capsule.getCenter( _center );
			capsule.getCenter( _v1 );
			vec3Sub( _center, _v1, _center );
			const depth = vec3Length( _center );

			return { normal: vec3Normalize( _center, _center ), depth: depth };

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

			const result = rayIntersectTriangle( ray, triangles[ i ].a, triangles[ i ].b, triangles[ i ].c, true, _v1 );

			if ( result ) {

				const newdistance = vec3Length( vec3Sub( result, ray.origin, _temp1 ) );

				if ( distance > newdistance ) {

					position = vec3Add( vec3Copy( _temp1 ), ray.origin );
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

						const v1 = vec3FromBufferAttribute( positionAttribute, i );
						const v2 = vec3FromBufferAttribute( positionAttribute, i + 1 );
						const v3 = vec3FromBufferAttribute( positionAttribute, i + 2 );

						vec3ApplyMatrix4( v1, obj.matrixWorld, v1 );
						vec3ApplyMatrix4( v2, obj.matrixWorld, v2 );
						vec3ApplyMatrix4( v3, obj.matrixWorld, v3 );

						this.addTriangle( { a: v1, b: v2, c: v3 } );

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
		box3MakeEmpty( this.bounds );

		this.subTrees.length = 0;
		this.triangles.length = 0;

		return this;

	}

}

export { Octree };
