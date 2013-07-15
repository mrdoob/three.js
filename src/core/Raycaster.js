/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
 */

( function ( THREE ) {

	THREE.Raycaster = function ( origin, direction, near, far ) {

		this.ray = new THREE.Ray( origin, direction );

		// normalized ray.direction required for accurate distance calculations
		if ( this.ray.direction.lengthSq() > 0 ) {

			this.ray.direction.normalize();

		}

		this.near = near || 0;
		this.far = far || Infinity;

	};

	var sphere = new THREE.Sphere();
	var localRay = new THREE.Ray();
	var facePlane = new THREE.Plane();
	var intersectPoint = new THREE.Vector3();
	var matrixPosition = new THREE.Vector3();

	var inverseMatrix = new THREE.Matrix4();

	var descSort = function ( a, b ) {

		return a.distance - b.distance;

	};

	var intersectObject = function ( object, raycaster, intersects ) {

		if ( object instanceof THREE.Particle ) {

			matrixPosition.getPositionFromMatrix( object.matrixWorld );
			var distance = raycaster.ray.distanceToPoint( matrixPosition );

			if ( distance > object.scale.x ) {

				return intersects;

			}

			intersects.push( {

				distance: distance,
				point: object.position,
				face: null,
				object: object

			} );

		} else if ( object instanceof THREE.LOD ) {

			matrixPosition.getPositionFromMatrix( object.matrixWorld );
			var distance = raycaster.ray.origin.distanceTo( matrixPosition );

			intersectObject( object.getObjectForDistance( distance ), raycaster, intersects );

		} else if ( object instanceof THREE.Mesh ) {

			var geometry = object.geometry;

			// Checking boundingSphere distance to ray
			matrixPosition.getPositionFromMatrix( object.matrixWorld );

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.set( matrixPosition, geometry.boundingSphere.radius * object.matrixWorld.getMaxScaleOnAxis() );

			if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

				return intersects;

			}

			var vertices = geometry.vertices;

			if ( geometry instanceof THREE.BufferGeometry ) {

				var material = object.material;

				if ( material === undefined ) return intersects;
				if ( geometry.dynamic === false ) return intersects;

				var isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
				var objectMaterials = isFaceMaterial === true ? object.material.materials : null;

				var side = object.material.side;

				var a, b, c;
				var precision = raycaster.precision;

				inverseMatrix.getInverse( object.matrixWorld );

				localRay.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

				var fl;
				var indexed = false;

				if ( geometry.attributes.index ) {

					indexed = true;
					fl = geometry.attributes.index.numItems / 3;

				} else {

					fl = geometry.attributes.position.numItems / 9;

				}

				var vA = new THREE.Vector3();
				var vB = new THREE.Vector3();
				var vC = new THREE.Vector3();
				var vCB = new THREE.Vector3();
				var vAB = new THREE.Vector3();

				for ( var oi = 0; oi < geometry.offsets.length; ++oi ) {

					var start = geometry.offsets[ oi ].start;
					var count = geometry.offsets[ oi ].count;
					var index = geometry.offsets[ oi ].index;

					for ( var i = start, il = start + count; i < il; i += 3 ) {

						if ( indexed ) {

							a = index + geometry.attributes.index.array[ i ];
							b = index + geometry.attributes.index.array[ i + 1 ];
							c = index + geometry.attributes.index.array[ i + 2 ];

						} else {

							a = index;
							b = index + 1;
							c = index + 2;

						}

						vA.set(
							geometry.attributes.position.array[ a * 3 ],
							geometry.attributes.position.array[ a * 3 + 1 ],
							geometry.attributes.position.array[ a * 3 + 2 ]
						);
						vB.set(
							geometry.attributes.position.array[ b * 3 ],
							geometry.attributes.position.array[ b * 3 + 1 ],
							geometry.attributes.position.array[ b * 3 + 2 ]
						);
						vC.set(
							geometry.attributes.position.array[ c * 3 ],
							geometry.attributes.position.array[ c * 3 + 1 ],
							geometry.attributes.position.array[ c * 3 + 2 ]
						);

						facePlane.setFromCoplanarPoints( vA, vB, vC );

						var planeDistance = localRay.distanceToPlane( facePlane );

						// bail if the ray is too close to the plane
						if ( planeDistance < precision ) continue;

						// bail if the ray is behind the plane
						if ( planeDistance === null ) continue;

						// check if we hit the wrong side of a single sided face
						side = material.side;

						if ( side !== THREE.DoubleSide ) {

							var planeSign = localRay.direction.dot( facePlane.normal );
							

							if ( ! ( side === THREE.FrontSide ? planeSign < 0 : planeSign > 0 ) ) {

								continue;

							}

						}

						// this can be done using the planeDistance from localRay because
						// localRay wasn't normalized, but ray was
						if ( planeDistance < raycaster.near || planeDistance > raycaster.far ) {

							continue;

						}

						// passing in intersectPoint avoids a copy
						intersectPoint = localRay.at( planeDistance, intersectPoint );

						if ( THREE.Triangle.containsPoint( intersectPoint, vA, vB, vC ) === false ) {

							continue;

						}

						intersects.push( {

							// this works because the original ray was normalized,
							// and the transformed localRay wasn't
							distance: planeDistance,
							point: raycaster.ray.at( planeDistance ),
							face: null,
							faceIndex: null,
							object: object

						} );

					}
				}

			} else if ( geometry instanceof THREE.Geometry ) {

				var isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
				var objectMaterials = isFaceMaterial === true ? object.material.materials : null;

				var side = object.material.side;

				var a, b, c, d;
				var precision = raycaster.precision;

				inverseMatrix.getInverse( object.matrixWorld );

				localRay.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

				for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

					var face = geometry.faces[ f ];

					var material = isFaceMaterial === true ? objectMaterials[ face.materialIndex ] : object.material;

					if ( material === undefined ) continue;

					facePlane.setFromNormalAndCoplanarPoint( face.normal, vertices[face.a] );

					var planeDistance = localRay.distanceToPlane( facePlane );

					// bail if the ray is too close to the plane
					if ( planeDistance < precision ) continue;

					// bail if the ray is behind the plane
					if ( planeDistance === null ) continue;

					// check if we hit the wrong side of a single sided face
					side = material.side;
					if ( side !== THREE.DoubleSide ) {

						var planeSign = localRay.direction.dot( facePlane.normal );

						if ( ! ( side === THREE.FrontSide ? planeSign < 0 : planeSign > 0 ) ) {

							continue;

						}

					}

					// this can be done using the planeDistance from localRay because localRay
					// wasn't normalized, but ray was
					if ( planeDistance < raycaster.near || planeDistance > raycaster.far ) continue;

					// passing in intersectPoint avoids a copy
					intersectPoint = localRay.at( planeDistance, intersectPoint );

					if ( face instanceof THREE.Face3 ) {

						a = vertices[ face.a ];
						b = vertices[ face.b ];
						c = vertices[ face.c ];

						if ( THREE.Triangle.containsPoint( intersectPoint, a, b, c ) === false ) {

							continue;

						}

					} else if ( face instanceof THREE.Face4 ) {

						a = vertices[ face.a ];
						b = vertices[ face.b ];
						c = vertices[ face.c ];
						d = vertices[ face.d ];

						if ( THREE.Triangle.containsPoint( intersectPoint, a, b, d ) === false &&
						     THREE.Triangle.containsPoint( intersectPoint, b, c, d ) === false ) {

							continue;

						}

					} else {

						// This is added because if we call out of this if/else group when
						// none of the cases match it will add a point to the intersection
						// list erroneously.
						throw Error( "face type not supported" );

					}

					intersects.push( {

						// this works because the original ray was normalized,
						// and the transformed localRay wasn't
						distance: planeDistance,
						point: raycaster.ray.at( planeDistance ),
						face: face,
						faceIndex: f,
						object: object

					} );

				}

			}

		} else if ( object instanceof THREE.Line ) {

			var precision = raycaster.linePrecision;
			var precisionSq = precision * precision;

			var geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			// Checking boundingSphere distance to ray
			matrixPosition.getPositionFromMatrix(object.matrixWorld);
			sphere.set( matrixPosition, geometry.boundingSphere.radius * object.matrixWorld.getMaxScaleOnAxis() );
			
			if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

				return intersects;

			}
			
			inverseMatrix.getInverse( object.matrixWorld );
			localRay.copy( raycaster.ray ).applyMatrix4( inverseMatrix );
			localRay.direction.normalize(); // for scale matrix

			var vertices = geometry.vertices;
			var nbVertices = vertices.length;
			var interSegment = new THREE.Vector3();
			var interRay = new THREE.Vector3();
			var step = object.type === THREE.LineStrip ? 1 : 2;

			for ( var i = 0; i < nbVertices - 1; i = i + step ) {

				var distSq = localRay.distanceSqToSegment( vertices[ i ], vertices[ i + 1 ], interRay, interSegment );

				if ( distSq <= precisionSq ) {

					var distance = localRay.origin.distanceTo( interRay );

					if ( raycaster.near <= distance && distance <= raycaster.far ) {

						intersects.push( {

							distance: distance,
							// What do we want? intersection point on the ray or on the segment??
							// point: raycaster.ray.at( distance ),
							point: interSegment.clone().applyMatrix4( object.matrixWorld ),
							face: null,
							faceIndex: null,
							object: object

						} );

					}

				}

			}

		}

	};

	var intersectDescendants = function ( object, raycaster, intersects ) {

		var descendants = object.getDescendants();

		for ( var i = 0, l = descendants.length; i < l; i ++ ) {

			intersectObject( descendants[ i ], raycaster, intersects );

		}
	};

	//

	THREE.Raycaster.prototype.precision = 0.0001;
	THREE.Raycaster.prototype.linePrecision = 1;

	THREE.Raycaster.prototype.set = function ( origin, direction ) {

		this.ray.set( origin, direction );

		// normalized ray.direction required for accurate distance calculations
		if ( this.ray.direction.length() > 0 ) {

			this.ray.direction.normalize();

		}

	};

	THREE.Raycaster.prototype.intersectObject = function ( object, recursive ) {

		var intersects = [];

		if ( recursive === true ) {

			intersectDescendants( object, this, intersects );

		}

		intersectObject( object, this, intersects );

		intersects.sort( descSort );

		return intersects;

	};

	THREE.Raycaster.prototype.intersectObjects = function ( objects, recursive ) {

		var intersects = [];

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			intersectObject( objects[ i ], this, intersects );

			if ( recursive === true ) {

				intersectDescendants( objects[ i ], this, intersects );

			}

		}

		intersects.sort( descSort );

		return intersects;

	};

}( THREE ) );
