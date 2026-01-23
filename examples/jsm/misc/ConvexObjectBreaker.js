import {
	Line3,
	Mesh,
	Plane,
	Vector3
} from 'three';
import { ConvexGeometry } from '../geometries/ConvexGeometry.js';

const _v1 = new Vector3();

/**
 * This class can be used to subdivide a convex Geometry object into pieces.
 *
 * Use the function prepareBreakableObject to prepare a Mesh object to be broken.
 * Then, call the various functions to subdivide the object (subdivideByImpact, cutByPlane).
 * Sub-objects that are product of subdivision don't need prepareBreakableObject to be called on them.
 *
 * Requisites for the object:
 * - Mesh object must have a buffer geometry and a material.
 * - Vertex normals must be planar (not smoothed).
 * - The geometry must be convex (this is not checked in the library). You can create convex
 * geometries with {@link ConvexGeometry}. The {@link BoxGeometry}, {@link SphereGeometry} and other
 * convex primitives can also be used.
 *
 * Note: This lib adds member variables to object's userData member (see prepareBreakableObject function)
 * Use with caution and read the code when using with other libs.
 *
 * @three_import import { ConvexObjectBreaker } from 'three/addons/misc/ConvexObjectBreaker.js';
 */
class ConvexObjectBreaker {

	/**
	 * Constructs a new convex object breaker.
	 *
	 * @param {number} [minSizeForBreak=1.4] - Min size a debris can have to break.
 	 * @param {number} [smallDelta=0.0001] - Max distance to consider that a point belongs to a plane.
	 */
	constructor( minSizeForBreak = 1.4, smallDelta = 0.0001 ) {

		this.minSizeForBreak = minSizeForBreak;
		this.smallDelta = smallDelta;

		this.tempLine1 = new Line3();
		this.tempPlane1 = new Plane();
		this.tempPlane2 = new Plane();
		this.tempPlane_Cut = new Plane();
		this.tempCM1 = new Vector3();
		this.tempCM2 = new Vector3();
		this.tempVector3 = new Vector3();
		this.tempVector3_2 = new Vector3();
		this.tempVector3_3 = new Vector3();
		this.tempVector3_P0 = new Vector3();
		this.tempVector3_P1 = new Vector3();
		this.tempVector3_P2 = new Vector3();
		this.tempVector3_N0 = new Vector3();
		this.tempVector3_N1 = new Vector3();
		this.tempVector3_AB = new Vector3();
		this.tempVector3_CB = new Vector3();
		this.tempResultObjects = { object1: null, object2: null };

		this.segments = [];
		const n = 30 * 30;
		for ( let i = 0; i < n; i ++ ) this.segments[ i ] = false;

	}

	/**
	 * Must be called for all 3D objects that should be breakable.
	 *
	 * @param {Object3D} object - The 3D object. It must have a convex geometry.
	 * @param {number} mass - The 3D object's mass in kg. Must be greater than `0`.
	 * @param {Vector3} velocity - The 3D object's velocity.
	 * @param {Vector3} angularVelocity - The 3D object's angular velocity.
	 * @param {boolean} breakable - Whether the 3D object is breakable or not.
	 */
	prepareBreakableObject( object, mass, velocity, angularVelocity, breakable ) {

		// object is a Object3d (normally a Mesh), must have a buffer geometry, and it must be convex.
		// Its material property is propagated to its children (sub-pieces)
		// mass must be > 0

		const userData = object.userData;
		userData.mass = mass;
		userData.velocity = velocity.clone();
		userData.angularVelocity = angularVelocity.clone();
		userData.breakable = breakable;

	}

	/**
	 * Subdivides the given 3D object into pieces by an impact (meaning another object hits
	 * the given 3D object at a certain surface point).
	 *
	 * @param {Object3D} object - The 3D object to subdivide.
	 * @param {Vector3} pointOfImpact - The point of impact.
	 * @param {Vector3} normal - The impact normal.
	 * @param {number} maxRadialIterations - Iterations for radial cuts.
	 * @param {number} maxRandomIterations - Max random iterations for not-radial cuts.
	 * @return {Array<Object3D>} The array of pieces.
	 */
	subdivideByImpact( object, pointOfImpact, normal, maxRadialIterations, maxRandomIterations ) {

		const debris = [];

		const tempPlane1 = this.tempPlane1;
		const tempPlane2 = this.tempPlane2;

		this.tempVector3.addVectors( pointOfImpact, normal );
		tempPlane1.setFromCoplanarPoints( pointOfImpact, object.position, this.tempVector3 );

		const maxTotalIterations = maxRandomIterations + maxRadialIterations;

		const scope = this;

		function subdivideRadial( subObject, startAngle, endAngle, numIterations ) {

			if ( Math.random() < numIterations * 0.05 || numIterations > maxTotalIterations ) {

				debris.push( subObject );

				return;

			}

			let angle = Math.PI;

			if ( numIterations === 0 ) {

				tempPlane2.normal.copy( tempPlane1.normal );
				tempPlane2.constant = tempPlane1.constant;

			} else {

				if ( numIterations <= maxRadialIterations ) {

					angle = ( endAngle - startAngle ) * ( 0.2 + 0.6 * Math.random() ) + startAngle;

					// Rotate tempPlane2 at impact point around normal axis and the angle
					scope.tempVector3_2.copy( object.position ).sub( pointOfImpact ).applyAxisAngle( normal, angle ).add( pointOfImpact );
					tempPlane2.setFromCoplanarPoints( pointOfImpact, scope.tempVector3, scope.tempVector3_2 );

				} else {

					angle = ( ( 0.5 * ( numIterations & 1 ) ) + 0.2 * ( 2 - Math.random() ) ) * Math.PI;

					// Rotate tempPlane2 at object position around normal axis and the angle
					scope.tempVector3_2.copy( pointOfImpact ).sub( subObject.position ).applyAxisAngle( normal, angle ).add( subObject.position );
					scope.tempVector3_3.copy( normal ).add( subObject.position );
					tempPlane2.setFromCoplanarPoints( subObject.position, scope.tempVector3_3, scope.tempVector3_2 );

				}

			}

			// Perform the cut
			scope.cutByPlane( subObject, tempPlane2, scope.tempResultObjects );

			const obj1 = scope.tempResultObjects.object1;
			const obj2 = scope.tempResultObjects.object2;

			if ( obj1 ) {

				subdivideRadial( obj1, startAngle, angle, numIterations + 1 );

			}

			if ( obj2 ) {

				subdivideRadial( obj2, angle, endAngle, numIterations + 1 );

			}

		}

		subdivideRadial( object, 0, 2 * Math.PI, 0 );

		return debris;

	}

	/**
	 * Subdivides the given 3D object into pieces by a plane.
	 *
	 * @param {Object3D} object - The 3D object to subdivide.
	 * @param {Plane} plane - The plane to cut the 3D object.
	 * @param {{object1:?Mesh,object2:?Mesh}} output - An object that stores the pieces.
	 * @return {number} The number of pieces.
	 */
	cutByPlane( object, plane, output ) {

		// Returns breakable objects in output.object1 and output.object2 members, the resulting 2 pieces of the cut.
		// object2 can be null if the plane doesn't cut the object.
		// object1 can be null only in case of internal error
		// Returned value is number of pieces, 0 for error.

		const geometry = object.geometry;
		const coords = geometry.attributes.position.array;
		const normals = geometry.attributes.normal.array;

		const numPoints = coords.length / 3;
		let numFaces = numPoints / 3;

		let indices = geometry.getIndex();

		if ( indices ) {

			indices = indices.array;
			numFaces = indices.length / 3;

		}

		function getVertexIndex( faceIdx, vert ) {

			// vert = 0, 1 or 2.

			const idx = faceIdx * 3 + vert;

			return indices ? indices[ idx ] : idx;

		}

		const points1 = [];
		const points2 = [];

		const delta = this.smallDelta;

		// Reset segments mark
		const numPointPairs = numPoints * numPoints;
		for ( let i = 0; i < numPointPairs; i ++ ) this.segments[ i ] = false;

		const p0 = this.tempVector3_P0;
		const p1 = this.tempVector3_P1;
		const n0 = this.tempVector3_N0;
		const n1 = this.tempVector3_N1;

		// Iterate through the faces to mark edges shared by coplanar faces
		for ( let i = 0; i < numFaces - 1; i ++ ) {

			const a1 = getVertexIndex( i, 0 );
			const b1 = getVertexIndex( i, 1 );
			const c1 = getVertexIndex( i, 2 );

			// Assuming all 3 vertices have the same normal
			n0.set( normals[ a1 ], normals[ a1 ] + 1, normals[ a1 ] + 2 );

			for ( let j = i + 1; j < numFaces; j ++ ) {

				const a2 = getVertexIndex( j, 0 );
				const b2 = getVertexIndex( j, 1 );
				const c2 = getVertexIndex( j, 2 );

				// Assuming all 3 vertices have the same normal
				n1.set( normals[ a2 ], normals[ a2 ] + 1, normals[ a2 ] + 2 );

				const coplanar = 1 - n0.dot( n1 ) < delta;

				if ( coplanar ) {

					if ( a1 === a2 || a1 === b2 || a1 === c2 ) {

						if ( b1 === a2 || b1 === b2 || b1 === c2 ) {

							this.segments[ a1 * numPoints + b1 ] = true;
							this.segments[ b1 * numPoints + a1 ] = true;

						}	else {

							this.segments[ c1 * numPoints + a1 ] = true;
							this.segments[ a1 * numPoints + c1 ] = true;

						}

					}	else if ( b1 === a2 || b1 === b2 || b1 === c2 ) {

						this.segments[ c1 * numPoints + b1 ] = true;
						this.segments[ b1 * numPoints + c1 ] = true;

					}

				}

			}

		}

		// Transform the plane to object local space
		const localPlane = this.tempPlane_Cut;
		object.updateMatrix();
		ConvexObjectBreaker.transformPlaneToLocalSpace( plane, object.matrix, localPlane );

		// Iterate through the faces adding points to both pieces
		for ( let i = 0; i < numFaces; i ++ ) {

			const va = getVertexIndex( i, 0 );
			const vb = getVertexIndex( i, 1 );
			const vc = getVertexIndex( i, 2 );

			for ( let segment = 0; segment < 3; segment ++ ) {

				const i0 = segment === 0 ? va : ( segment === 1 ? vb : vc );
				const i1 = segment === 0 ? vb : ( segment === 1 ? vc : va );

				const segmentState = this.segments[ i0 * numPoints + i1 ];

				if ( segmentState ) continue; // The segment already has been processed in another face

				// Mark segment as processed (also inverted segment)
				this.segments[ i0 * numPoints + i1 ] = true;
				this.segments[ i1 * numPoints + i0 ] = true;

				p0.set( coords[ 3 * i0 ], coords[ 3 * i0 + 1 ], coords[ 3 * i0 + 2 ] );
				p1.set( coords[ 3 * i1 ], coords[ 3 * i1 + 1 ], coords[ 3 * i1 + 2 ] );

				// mark: 1 for negative side, 2 for positive side, 3 for coplanar point
				let mark0 = 0;

				let d = localPlane.distanceToPoint( p0 );

				if ( d > delta ) {

					mark0 = 2;
					points2.push( p0.clone() );

				} else if ( d < - delta ) {

					mark0 = 1;
					points1.push( p0.clone() );

				} else {

					mark0 = 3;
					points1.push( p0.clone() );
					points2.push( p0.clone() );

				}

				// mark: 1 for negative side, 2 for positive side, 3 for coplanar point
				let mark1 = 0;

				d = localPlane.distanceToPoint( p1 );

				if ( d > delta ) {

					mark1 = 2;
					points2.push( p1.clone() );

				} else if ( d < - delta ) {

					mark1 = 1;
					points1.push( p1.clone() );

				}	else {

					mark1 = 3;
					points1.push( p1.clone() );
					points2.push( p1.clone() );

				}

				if ( ( mark0 === 1 && mark1 === 2 ) || ( mark0 === 2 && mark1 === 1 ) ) {

					// Intersection of segment with the plane

					this.tempLine1.start.copy( p0 );
					this.tempLine1.end.copy( p1 );

					let intersection = new Vector3();
					intersection = localPlane.intersectLine( this.tempLine1, intersection );

					if ( intersection === null ) {

						// Shouldn't happen
						console.error( 'Internal error: segment does not intersect plane.' );
						output.segmentedObject1 = null;
						output.segmentedObject2 = null;
						return 0;

					}

					points1.push( intersection );
					points2.push( intersection.clone() );

				}

			}

		}

		// Calculate debris mass (very fast and imprecise):
		const newMass = object.userData.mass * 0.5;

		// Calculate debris Center of Mass (again fast and imprecise)
		this.tempCM1.set( 0, 0, 0 );
		let radius1 = 0;
		const numPoints1 = points1.length;

		if ( numPoints1 > 0 ) {

			for ( let i = 0; i < numPoints1; i ++ ) this.tempCM1.add( points1[ i ] );

			this.tempCM1.divideScalar( numPoints1 );
			for ( let i = 0; i < numPoints1; i ++ ) {

				const p = points1[ i ];
				p.sub( this.tempCM1 );
				radius1 = Math.max( radius1, p.x, p.y, p.z );

			}

			this.tempCM1.add( object.position );

		}

		this.tempCM2.set( 0, 0, 0 );
		let radius2 = 0;
		const numPoints2 = points2.length;
		if ( numPoints2 > 0 ) {

			for ( let i = 0; i < numPoints2; i ++ ) this.tempCM2.add( points2[ i ] );

			this.tempCM2.divideScalar( numPoints2 );
			for ( let i = 0; i < numPoints2; i ++ ) {

				const p = points2[ i ];
				p.sub( this.tempCM2 );
				radius2 = Math.max( radius2, p.x, p.y, p.z );

			}

			this.tempCM2.add( object.position );

		}

		let object1 = null;
		let object2 = null;

		let numObjects = 0;

		if ( numPoints1 > 4 ) {

			object1 = new Mesh( new ConvexGeometry( points1 ), object.material );
			object1.position.copy( this.tempCM1 );
			object1.quaternion.copy( object.quaternion );

			this.prepareBreakableObject( object1, newMass, object.userData.velocity, object.userData.angularVelocity, 2 * radius1 > this.minSizeForBreak );

			numObjects ++;

		}

		if ( numPoints2 > 4 ) {

			object2 = new Mesh( new ConvexGeometry( points2 ), object.material );
			object2.position.copy( this.tempCM2 );
			object2.quaternion.copy( object.quaternion );

			this.prepareBreakableObject( object2, newMass, object.userData.velocity, object.userData.angularVelocity, 2 * radius2 > this.minSizeForBreak );

			numObjects ++;

		}

		output.object1 = object1;
		output.object2 = object2;

		return numObjects;

	}

	// internal helpers

	static transformFreeVector( v, m ) {

		// input:
		// vector interpreted as a free vector
		// THREE.Matrix4 orthogonal matrix (matrix without scale)

		const x = v.x, y = v.y, z = v.z;
		const e = m.elements;

		v.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		v.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		v.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return v;

	}

	static transformFreeVectorInverse( v, m ) {

		// input:
		// vector interpreted as a free vector
		// THREE.Matrix4 orthogonal matrix (matrix without scale)

		const x = v.x, y = v.y, z = v.z;
		const e = m.elements;

		v.x = e[ 0 ] * x + e[ 1 ] * y + e[ 2 ] * z;
		v.y = e[ 4 ] * x + e[ 5 ] * y + e[ 6 ] * z;
		v.z = e[ 8 ] * x + e[ 9 ] * y + e[ 10 ] * z;

		return v;

	}

	static transformTiedVectorInverse( v, m ) {

		// input:
		// vector interpreted as a tied (ordinary) vector
		// THREE.Matrix4 orthogonal matrix (matrix without scale)

		const x = v.x, y = v.y, z = v.z;
		const e = m.elements;

		v.x = e[ 0 ] * x + e[ 1 ] * y + e[ 2 ] * z - e[ 12 ];
		v.y = e[ 4 ] * x + e[ 5 ] * y + e[ 6 ] * z - e[ 13 ];
		v.z = e[ 8 ] * x + e[ 9 ] * y + e[ 10 ] * z - e[ 14 ];

		return v;

	}

	static transformPlaneToLocalSpace( plane, m, resultPlane ) {

		resultPlane.normal.copy( plane.normal );
		resultPlane.constant = plane.constant;

		const referencePoint = ConvexObjectBreaker.transformTiedVectorInverse( plane.coplanarPoint( _v1 ), m );

		ConvexObjectBreaker.transformFreeVectorInverse( resultPlane.normal, m );

		// recalculate constant (like in setFromNormalAndCoplanarPoint)
		resultPlane.constant = - referencePoint.dot( resultPlane.normal );

	}

}

export { ConvexObjectBreaker };
