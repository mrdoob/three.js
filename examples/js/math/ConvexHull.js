( function () {

	/**
 * Ported from: https://github.com/maurizzzio/quickhull3d/ by Mauricio Poppe (https://github.com/maurizzzio)
 */

	const Visible = 0;
	const Deleted = 1;

	const _v1 = new THREE.Vector3();

	const _line3 = new THREE.Line3();

	const _plane = new THREE.Plane();

	const _closestPoint = new THREE.Vector3();

	const _triangle = new THREE.Triangle();

	class ConvexHull {

		constructor() {

			this.tolerance = - 1;
			this.faces = []; // the generated faces of the convex hull

			this.newFaces = []; // this array holds the faces that are generated within a single iteration
			// the vertex lists work as follows:
			//
			// let 'a' and 'b' be 'Face' instances
			// let 'v' be points wrapped as instance of 'Vertex'
			//
			//     [v, v, ..., v, v, v, ...]
			//      ^             ^
			//      |             |
			//  a.outside     b.outside
			//

			this.assigned = new VertexList();
			this.unassigned = new VertexList();
			this.vertices = []; // vertices of the hull (internal representation of given geometry data)

		}

		setFromPoints( points ) {

			if ( Array.isArray( points ) !== true ) {

				console.error( 'THREE.ConvexHull: Points parameter is not an array.' );

			}

			if ( points.length < 4 ) {

				console.error( 'THREE.ConvexHull: The algorithm needs at least four points.' );

			}

			this.makeEmpty();

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				this.vertices.push( new VertexNode( points[ i ] ) );

			}

			this.compute();
			return this;

		}

		setFromObject( object ) {

			const points = [];
			object.updateMatrixWorld( true );
			object.traverse( function ( node ) {

				const geometry = node.geometry;

				if ( geometry !== undefined ) {

					if ( geometry.isGeometry ) {

						console.error( 'THREE.ConvexHull no longer supports Geometry. Use THREE.BufferGeometry instead.' );
						return;

					} else if ( geometry.isBufferGeometry ) {

						const attribute = geometry.attributes.position;

						if ( attribute !== undefined ) {

							for ( let i = 0, l = attribute.count; i < l; i ++ ) {

								const point = new THREE.Vector3();
								point.fromBufferAttribute( attribute, i ).applyMatrix4( node.matrixWorld );
								points.push( point );

							}

						}

					}

				}

			} );
			return this.setFromPoints( points );

		}

		containsPoint( point ) {

			const faces = this.faces;

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				const face = faces[ i ]; // compute signed distance and check on what half space the point lies

				if ( face.distanceToPoint( point ) > this.tolerance ) return false;

			}

			return true;

		}

		intersectRay( ray, target ) {

			// based on "Fast Ray-Convex Polyhedron Intersection"  by Eric Haines, GRAPHICS GEMS II
			const faces = this.faces;
			let tNear = - Infinity;
			let tFar = Infinity;

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				const face = faces[ i ]; // interpret faces as planes for the further computation

				const vN = face.distanceToPoint( ray.origin );
				const vD = face.normal.dot( ray.direction ); // if the origin is on the positive side of a plane (so the plane can "see" the origin) and
				// the ray is turned away or parallel to the plane, there is no intersection

				if ( vN > 0 && vD >= 0 ) return null; // compute the distance from the ray’s origin to the intersection with the plane

				const t = vD !== 0 ? - vN / vD : 0; // only proceed if the distance is positive. a negative distance means the intersection point
				// lies "behind" the origin

				if ( t <= 0 ) continue; // now categorized plane as front-facing or back-facing

				if ( vD > 0 ) {

					//  plane faces away from the ray, so this plane is a back-face
					tFar = Math.min( t, tFar );

				} else {

					// front-face
					tNear = Math.max( t, tNear );

				}

				if ( tNear > tFar ) {

					// if tNear ever is greater than tFar, the ray must miss the convex hull
					return null;

				}

			} // evaluate intersection point
			// always try tNear first since its the closer intersection point


			if ( tNear !== - Infinity ) {

				ray.at( tNear, target );

			} else {

				ray.at( tFar, target );

			}

			return target;

		}

		intersectsRay( ray ) {

			return this.intersectRay( ray, _v1 ) !== null;

		}

		makeEmpty() {

			this.faces = [];
			this.vertices = [];
			return this;

		} // Adds a vertex to the 'assigned' list of vertices and assigns it to the given face


		addVertexToFace( vertex, face ) {

			vertex.face = face;

			if ( face.outside === null ) {

				this.assigned.append( vertex );

			} else {

				this.assigned.insertBefore( face.outside, vertex );

			}

			face.outside = vertex;
			return this;

		} // Removes a vertex from the 'assigned' list of vertices and from the given face


		removeVertexFromFace( vertex, face ) {

			if ( vertex === face.outside ) {

				// fix face.outside link
				if ( vertex.next !== null && vertex.next.face === face ) {

					// face has at least 2 outside vertices, move the 'outside' reference
					face.outside = vertex.next;

				} else {

					// vertex was the only outside vertex that face had
					face.outside = null;

				}

			}

			this.assigned.remove( vertex );
			return this;

		} // Removes all the visible vertices that a given face is able to see which are stored in the 'assigned' vertext list


		removeAllVerticesFromFace( face ) {

			if ( face.outside !== null ) {

				// reference to the first and last vertex of this face
				const start = face.outside;
				let end = face.outside;

				while ( end.next !== null && end.next.face === face ) {

					end = end.next;

				}

				this.assigned.removeSubList( start, end ); // fix references

				start.prev = end.next = null;
				face.outside = null;
				return start;

			}

		} // Removes all the visible vertices that 'face' is able to see


		deleteFaceVertices( face, absorbingFace ) {

			const faceVertices = this.removeAllVerticesFromFace( face );

			if ( faceVertices !== undefined ) {

				if ( absorbingFace === undefined ) {

					// mark the vertices to be reassigned to some other face
					this.unassigned.appendChain( faceVertices );

				} else {

					// if there's an absorbing face try to assign as many vertices as possible to it
					let vertex = faceVertices;

					do {

						// we need to buffer the subsequent vertex at this point because the 'vertex.next' reference
						// will be changed by upcoming method calls
						const nextVertex = vertex.next;
						const distance = absorbingFace.distanceToPoint( vertex.point ); // check if 'vertex' is able to see 'absorbingFace'

						if ( distance > this.tolerance ) {

							this.addVertexToFace( vertex, absorbingFace );

						} else {

							this.unassigned.append( vertex );

						} // now assign next vertex


						vertex = nextVertex;

					} while ( vertex !== null );

				}

			}

			return this;

		} // Reassigns as many vertices as possible from the unassigned list to the new faces


		resolveUnassignedPoints( newFaces ) {

			if ( this.unassigned.isEmpty() === false ) {

				let vertex = this.unassigned.first();

				do {

					// buffer 'next' reference, see .deleteFaceVertices()
					const nextVertex = vertex.next;
					let maxDistance = this.tolerance;
					let maxFace = null;

					for ( let i = 0; i < newFaces.length; i ++ ) {

						const face = newFaces[ i ];

						if ( face.mark === Visible ) {

							const distance = face.distanceToPoint( vertex.point );

							if ( distance > maxDistance ) {

								maxDistance = distance;
								maxFace = face;

							}

							if ( maxDistance > 1000 * this.tolerance ) break;

						}

					} // 'maxFace' can be null e.g. if there are identical vertices


					if ( maxFace !== null ) {

						this.addVertexToFace( vertex, maxFace );

					}

					vertex = nextVertex;

				} while ( vertex !== null );

			}

			return this;

		} // Computes the extremes of a simplex which will be the initial hull


		computeExtremes() {

			const min = new THREE.Vector3();
			const max = new THREE.Vector3();
			const minVertices = [];
			const maxVertices = []; // initially assume that the first vertex is the min/max

			for ( let i = 0; i < 3; i ++ ) {

				minVertices[ i ] = maxVertices[ i ] = this.vertices[ 0 ];

			}

			min.copy( this.vertices[ 0 ].point );
			max.copy( this.vertices[ 0 ].point ); // compute the min/max vertex on all six directions

			for ( let i = 0, l = this.vertices.length; i < l; i ++ ) {

				const vertex = this.vertices[ i ];
				const point = vertex.point; // update the min coordinates

				for ( let j = 0; j < 3; j ++ ) {

					if ( point.getComponent( j ) < min.getComponent( j ) ) {

						min.setComponent( j, point.getComponent( j ) );
						minVertices[ j ] = vertex;

					}

				} // update the max coordinates


				for ( let j = 0; j < 3; j ++ ) {

					if ( point.getComponent( j ) > max.getComponent( j ) ) {

						max.setComponent( j, point.getComponent( j ) );
						maxVertices[ j ] = vertex;

					}

				}

			} // use min/max vectors to compute an optimal epsilon


			this.tolerance = 3 * Number.EPSILON * ( Math.max( Math.abs( min.x ), Math.abs( max.x ) ) + Math.max( Math.abs( min.y ), Math.abs( max.y ) ) + Math.max( Math.abs( min.z ), Math.abs( max.z ) ) );
			return {
				min: minVertices,
				max: maxVertices
			};

		} // Computes the initial simplex assigning to its faces all the points
		// that are candidates to form part of the hull


		computeInitialHull() {

			const vertices = this.vertices;
			const extremes = this.computeExtremes();
			const min = extremes.min;
			const max = extremes.max; // 1. Find the two vertices 'v0' and 'v1' with the greatest 1d separation
			// (max.x - min.x)
			// (max.y - min.y)
			// (max.z - min.z)

			let maxDistance = 0;
			let index = 0;

			for ( let i = 0; i < 3; i ++ ) {

				const distance = max[ i ].point.getComponent( i ) - min[ i ].point.getComponent( i );

				if ( distance > maxDistance ) {

					maxDistance = distance;
					index = i;

				}

			}

			const v0 = min[ index ];
			const v1 = max[ index ];
			let v2;
			let v3; // 2. The next vertex 'v2' is the one farthest to the line formed by 'v0' and 'v1'

			maxDistance = 0;

			_line3.set( v0.point, v1.point );

			for ( let i = 0, l = this.vertices.length; i < l; i ++ ) {

				const vertex = vertices[ i ];

				if ( vertex !== v0 && vertex !== v1 ) {

					_line3.closestPointToPoint( vertex.point, true, _closestPoint );

					const distance = _closestPoint.distanceToSquared( vertex.point );

					if ( distance > maxDistance ) {

						maxDistance = distance;
						v2 = vertex;

					}

				}

			} // 3. The next vertex 'v3' is the one farthest to the plane 'v0', 'v1', 'v2'


			maxDistance = - 1;

			_plane.setFromCoplanarPoints( v0.point, v1.point, v2.point );

			for ( let i = 0, l = this.vertices.length; i < l; i ++ ) {

				const vertex = vertices[ i ];

				if ( vertex !== v0 && vertex !== v1 && vertex !== v2 ) {

					const distance = Math.abs( _plane.distanceToPoint( vertex.point ) );

					if ( distance > maxDistance ) {

						maxDistance = distance;
						v3 = vertex;

					}

				}

			}

			const faces = [];

			if ( _plane.distanceToPoint( v3.point ) < 0 ) {

				// the face is not able to see the point so 'plane.normal' is pointing outside the tetrahedron
				faces.push( Face.create( v0, v1, v2 ), Face.create( v3, v1, v0 ), Face.create( v3, v2, v1 ), Face.create( v3, v0, v2 ) ); // set the twin edge

				for ( let i = 0; i < 3; i ++ ) {

					const j = ( i + 1 ) % 3; // join face[ i ] i > 0, with the first face

					faces[ i + 1 ].getEdge( 2 ).setTwin( faces[ 0 ].getEdge( j ) ); // join face[ i ] with face[ i + 1 ], 1 <= i <= 3

					faces[ i + 1 ].getEdge( 1 ).setTwin( faces[ j + 1 ].getEdge( 0 ) );

				}

			} else {

				// the face is able to see the point so 'plane.normal' is pointing inside the tetrahedron
				faces.push( Face.create( v0, v2, v1 ), Face.create( v3, v0, v1 ), Face.create( v3, v1, v2 ), Face.create( v3, v2, v0 ) ); // set the twin edge

				for ( let i = 0; i < 3; i ++ ) {

					const j = ( i + 1 ) % 3; // join face[ i ] i > 0, with the first face

					faces[ i + 1 ].getEdge( 2 ).setTwin( faces[ 0 ].getEdge( ( 3 - i ) % 3 ) ); // join face[ i ] with face[ i + 1 ]

					faces[ i + 1 ].getEdge( 0 ).setTwin( faces[ j + 1 ].getEdge( 1 ) );

				}

			} // the initial hull is the tetrahedron


			for ( let i = 0; i < 4; i ++ ) {

				this.faces.push( faces[ i ] );

			} // initial assignment of vertices to the faces of the tetrahedron


			for ( let i = 0, l = vertices.length; i < l; i ++ ) {

				const vertex = vertices[ i ];

				if ( vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3 ) {

					maxDistance = this.tolerance;
					let maxFace = null;

					for ( let j = 0; j < 4; j ++ ) {

						const distance = this.faces[ j ].distanceToPoint( vertex.point );

						if ( distance > maxDistance ) {

							maxDistance = distance;
							maxFace = this.faces[ j ];

						}

					}

					if ( maxFace !== null ) {

						this.addVertexToFace( vertex, maxFace );

					}

				}

			}

			return this;

		} // Removes inactive faces


		reindexFaces() {

			const activeFaces = [];

			for ( let i = 0; i < this.faces.length; i ++ ) {

				const face = this.faces[ i ];

				if ( face.mark === Visible ) {

					activeFaces.push( face );

				}

			}

			this.faces = activeFaces;
			return this;

		} // Finds the next vertex to create faces with the current hull


		nextVertexToAdd() {

			// if the 'assigned' list of vertices is empty, no vertices are left. return with 'undefined'
			if ( this.assigned.isEmpty() === false ) {

				let eyeVertex,
					maxDistance = 0; // grap the first available face and start with the first visible vertex of that face

				const eyeFace = this.assigned.first().face;
				let vertex = eyeFace.outside; // now calculate the farthest vertex that face can see

				do {

					const distance = eyeFace.distanceToPoint( vertex.point );

					if ( distance > maxDistance ) {

						maxDistance = distance;
						eyeVertex = vertex;

					}

					vertex = vertex.next;

				} while ( vertex !== null && vertex.face === eyeFace );

				return eyeVertex;

			}

		} // Computes a chain of half edges in CCW order called the 'horizon'.
		// For an edge to be part of the horizon it must join a face that can see
		// 'eyePoint' and a face that cannot see 'eyePoint'.


		computeHorizon( eyePoint, crossEdge, face, horizon ) {

			// moves face's vertices to the 'unassigned' vertex list
			this.deleteFaceVertices( face );
			face.mark = Deleted;
			let edge;

			if ( crossEdge === null ) {

				edge = crossEdge = face.getEdge( 0 );

			} else {

				// start from the next edge since 'crossEdge' was already analyzed
				// (actually 'crossEdge.twin' was the edge who called this method recursively)
				edge = crossEdge.next;

			}

			do {

				const twinEdge = edge.twin;
				const oppositeFace = twinEdge.face;

				if ( oppositeFace.mark === Visible ) {

					if ( oppositeFace.distanceToPoint( eyePoint ) > this.tolerance ) {

						// the opposite face can see the vertex, so proceed with next edge
						this.computeHorizon( eyePoint, twinEdge, oppositeFace, horizon );

					} else {

						// the opposite face can't see the vertex, so this edge is part of the horizon
						horizon.push( edge );

					}

				}

				edge = edge.next;

			} while ( edge !== crossEdge );

			return this;

		} // Creates a face with the vertices 'eyeVertex.point', 'horizonEdge.tail' and 'horizonEdge.head' in CCW order


		addAdjoiningFace( eyeVertex, horizonEdge ) {

			// all the half edges are created in ccw order thus the face is always pointing outside the hull
			const face = Face.create( eyeVertex, horizonEdge.tail(), horizonEdge.head() );
			this.faces.push( face ); // join face.getEdge( - 1 ) with the horizon's opposite edge face.getEdge( - 1 ) = face.getEdge( 2 )

			face.getEdge( - 1 ).setTwin( horizonEdge.twin );
			return face.getEdge( 0 ); // the half edge whose vertex is the eyeVertex

		} //  Adds 'horizon.length' faces to the hull, each face will be linked with the
		//  horizon opposite face and the face on the left/right


		addNewFaces( eyeVertex, horizon ) {

			this.newFaces = [];
			let firstSideEdge = null;
			let previousSideEdge = null;

			for ( let i = 0; i < horizon.length; i ++ ) {

				const horizonEdge = horizon[ i ]; // returns the right side edge

				const sideEdge = this.addAdjoiningFace( eyeVertex, horizonEdge );

				if ( firstSideEdge === null ) {

					firstSideEdge = sideEdge;

				} else {

					// joins face.getEdge( 1 ) with previousFace.getEdge( 0 )
					sideEdge.next.setTwin( previousSideEdge );

				}

				this.newFaces.push( sideEdge.face );
				previousSideEdge = sideEdge;

			} // perform final join of new faces


			firstSideEdge.next.setTwin( previousSideEdge );
			return this;

		} // Adds a vertex to the hull


		addVertexToHull( eyeVertex ) {

			const horizon = [];
			this.unassigned.clear(); // remove 'eyeVertex' from 'eyeVertex.face' so that it can't be added to the 'unassigned' vertex list

			this.removeVertexFromFace( eyeVertex, eyeVertex.face );
			this.computeHorizon( eyeVertex.point, null, eyeVertex.face, horizon );
			this.addNewFaces( eyeVertex, horizon ); // reassign 'unassigned' vertices to the new faces

			this.resolveUnassignedPoints( this.newFaces );
			return this;

		}

		cleanup() {

			this.assigned.clear();
			this.unassigned.clear();
			this.newFaces = [];
			return this;

		}

		compute() {

			let vertex;
			this.computeInitialHull(); // add all available vertices gradually to the hull

			while ( ( vertex = this.nextVertexToAdd() ) !== undefined ) {

				this.addVertexToHull( vertex );

			}

			this.reindexFaces();
			this.cleanup();
			return this;

		}

	} //


	class Face {

		constructor() {

			this.normal = new THREE.Vector3();
			this.midpoint = new THREE.Vector3();
			this.area = 0;
			this.constant = 0; // signed distance from face to the origin

			this.outside = null; // reference to a vertex in a vertex list this face can see

			this.mark = Visible;
			this.edge = null;

		}

		static create( a, b, c ) {

			const face = new Face();
			const e0 = new HalfEdge( a, face );
			const e1 = new HalfEdge( b, face );
			const e2 = new HalfEdge( c, face ); // join edges

			e0.next = e2.prev = e1;
			e1.next = e0.prev = e2;
			e2.next = e1.prev = e0; // main half edge reference

			face.edge = e0;
			return face.compute();

		}

		getEdge( i ) {

			let edge = this.edge;

			while ( i > 0 ) {

				edge = edge.next;
				i --;

			}

			while ( i < 0 ) {

				edge = edge.prev;
				i ++;

			}

			return edge;

		}

		compute() {

			const a = this.edge.tail();
			const b = this.edge.head();
			const c = this.edge.next.head();

			_triangle.set( a.point, b.point, c.point );

			_triangle.getNormal( this.normal );

			_triangle.getMidpoint( this.midpoint );

			this.area = _triangle.getArea();
			this.constant = this.normal.dot( this.midpoint );
			return this;

		}

		distanceToPoint( point ) {

			return this.normal.dot( point ) - this.constant;

		}

	} // Entity for a Doubly-Connected Edge List (DCEL).


	class HalfEdge {

		constructor( vertex, face ) {

			this.vertex = vertex;
			this.prev = null;
			this.next = null;
			this.twin = null;
			this.face = face;

		}

		head() {

			return this.vertex;

		}

		tail() {

			return this.prev ? this.prev.vertex : null;

		}

		length() {

			const head = this.head();
			const tail = this.tail();

			if ( tail !== null ) {

				return tail.point.distanceTo( head.point );

			}

			return - 1;

		}

		lengthSquared() {

			const head = this.head();
			const tail = this.tail();

			if ( tail !== null ) {

				return tail.point.distanceToSquared( head.point );

			}

			return - 1;

		}

		setTwin( edge ) {

			this.twin = edge;
			edge.twin = this;
			return this;

		}

	} // A vertex as a double linked list node.


	class VertexNode {

		constructor( point ) {

			this.point = point;
			this.prev = null;
			this.next = null;
			this.face = null; // the face that is able to see this vertex

		}

	} // A double linked list that contains vertex nodes.


	class VertexList {

		constructor() {

			this.head = null;
			this.tail = null;

		}

		first() {

			return this.head;

		}

		last() {

			return this.tail;

		}

		clear() {

			this.head = this.tail = null;
			return this;

		} // Inserts a vertex before the target vertex


		insertBefore( target, vertex ) {

			vertex.prev = target.prev;
			vertex.next = target;

			if ( vertex.prev === null ) {

				this.head = vertex;

			} else {

				vertex.prev.next = vertex;

			}

			target.prev = vertex;
			return this;

		} // Inserts a vertex after the target vertex


		insertAfter( target, vertex ) {

			vertex.prev = target;
			vertex.next = target.next;

			if ( vertex.next === null ) {

				this.tail = vertex;

			} else {

				vertex.next.prev = vertex;

			}

			target.next = vertex;
			return this;

		} // Appends a vertex to the end of the linked list


		append( vertex ) {

			if ( this.head === null ) {

				this.head = vertex;

			} else {

				this.tail.next = vertex;

			}

			vertex.prev = this.tail;
			vertex.next = null; // the tail has no subsequent vertex

			this.tail = vertex;
			return this;

		} // Appends a chain of vertices where 'vertex' is the head.


		appendChain( vertex ) {

			if ( this.head === null ) {

				this.head = vertex;

			} else {

				this.tail.next = vertex;

			}

			vertex.prev = this.tail; // ensure that the 'tail' reference points to the last vertex of the chain

			while ( vertex.next !== null ) {

				vertex = vertex.next;

			}

			this.tail = vertex;
			return this;

		} // Removes a vertex from the linked list


		remove( vertex ) {

			if ( vertex.prev === null ) {

				this.head = vertex.next;

			} else {

				vertex.prev.next = vertex.next;

			}

			if ( vertex.next === null ) {

				this.tail = vertex.prev;

			} else {

				vertex.next.prev = vertex.prev;

			}

			return this;

		} // Removes a list of vertices whose 'head' is 'a' and whose 'tail' is b


		removeSubList( a, b ) {

			if ( a.prev === null ) {

				this.head = b.next;

			} else {

				a.prev.next = b.next;

			}

			if ( b.next === null ) {

				this.tail = a.prev;

			} else {

				b.next.prev = a.prev;

			}

			return this;

		}

		isEmpty() {

			return this.head === null;

		}

	}

	THREE.ConvexHull = ConvexHull;

} )();
