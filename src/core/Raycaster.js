/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
 * @author stephomi / http://stephaneginier.com/
 */

( function ( THREE ) {

	THREE.Raycaster = function ( origin, direction, near, far ) {

		this.ray = new THREE.Ray( origin, direction );
		// direction is assumed to be normalized (for accurate distance calculations)

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

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();

	var intersectObject = function ( object, raycaster, intersects ) {

		if ( object instanceof THREE.Sprite ) {

			matrixPosition.setFromMatrixPosition( object.matrixWorld );
			
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

			matrixPosition.setFromMatrixPosition( object.matrixWorld );
			var distance = raycaster.ray.origin.distanceTo( matrixPosition );

			intersectObject( object.getObjectForDistance( distance ), raycaster, intersects );

		} else if ( object instanceof THREE.Mesh ) {

			var geometry = object.geometry;

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( object.matrixWorld );

			if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

				return intersects;

			}

			// Check boundingBox before continuing
			
			inverseMatrix.getInverse( object.matrixWorld );  
			localRay.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			if ( geometry.boundingBox !== null ) {

				if ( localRay.isIntersectionBox( geometry.boundingBox ) === false )  {

					return intersects;

				}

			} 

			if ( geometry instanceof THREE.BufferGeometry ) {

				var material = object.material;

				if ( material === undefined ) return intersects;

				var attributes = geometry.attributes;

				var a, b, c;
				var precision = raycaster.precision;

				if ( attributes.index !== undefined ) {

					var offsets = geometry.offsets;
					var indices = attributes.index.array;
					var positions = attributes.position.array;

					for ( var oi = 0, ol = offsets.length; oi < ol; ++oi ) {

						var start = offsets[ oi ].start;
						var count = offsets[ oi ].count;
						var index = offsets[ oi ].index;

						for ( var i = start, il = start + count; i < il; i += 3 ) {

							a = index + indices[ i ];
							b = index + indices[ i + 1 ]; 
							c = index + indices[ i + 2 ];

							vA.set(
								positions[ a * 3 ],
								positions[ a * 3 + 1 ],
								positions[ a * 3 + 2 ]
							);
							vB.set(
								positions[ b * 3 ],
								positions[ b * 3 + 1 ],
								positions[ b * 3 + 2 ]
							);
							vC.set(
								positions[ c * 3 ],
								positions[ c * 3 + 1 ],
								positions[ c * 3 + 2 ]
							);

							
							if ( material.side === THREE.BackSide ) {
							
								var intersectionPoint = localRay.intersectTriangle( vC, vB, vA, true ); 

							} else {

								var intersectionPoint = localRay.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide );

							}

							if ( intersectionPoint === null ) continue;

							intersectionPoint.applyMatrix4( object.matrixWorld );

							var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

							if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

							intersects.push( {

								distance: distance,
								point: intersectionPoint,
								indices: [a, b, c],
								face: null,
								faceIndex: null,
								object: object

							} );

						}

					}

				} else {

					var offsets = geometry.offsets;
					var positions = attributes.position.array;

					for ( var i = 0, il = attributes.position.array.length; i < il; i += 3 ) {

						a = i;
						b = i + 1;
						c = i + 2;

						vA.set(
							positions[ a * 3 ],
							positions[ a * 3 + 1 ],
							positions[ a * 3 + 2 ]
						);
						vB.set(
							positions[ b * 3 ],
							positions[ b * 3 + 1 ],
							positions[ b * 3 + 2 ]
						);
						vC.set(
							positions[ c * 3 ],
							positions[ c * 3 + 1 ],
							positions[ c * 3 + 2 ]
						);

						
						if ( material.side === THREE.BackSide ) {
							
							var intersectionPoint = localRay.intersectTriangle( vC, vB, vA, true ); 

						} else {

							var intersectionPoint = localRay.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide );

						}

						if ( intersectionPoint === null ) continue;

						intersectionPoint.applyMatrix4( object.matrixWorld );

						var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

						if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

						intersects.push( {

							distance: distance,
							point: intersectionPoint,
							indices: [a, b, c],
							face: null,
							faceIndex: null,
							object: object

						} );

					}

				}

			} else if ( geometry instanceof THREE.Geometry ) {

				var isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
				var objectMaterials = isFaceMaterial === true ? object.material.materials : null;

				var a, b, c, d;
				var precision = raycaster.precision;

				var vertices = geometry.vertices;

				for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

					var face = geometry.faces[ f ];

					var material = isFaceMaterial === true ? objectMaterials[ face.materialIndex ] : object.material;

					if ( material === undefined ) continue;

					a = vertices[ face.a ];
					b = vertices[ face.b ];
					c = vertices[ face.c ];

					if ( material.morphTargets === true ) {

						var morphTargets = geometry.morphTargets;
						var morphInfluences = object.morphTargetInfluences;

						vA.set( 0, 0, 0 );
						vB.set( 0, 0, 0 );
						vC.set( 0, 0, 0 );

						for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

							var influence = morphInfluences[ t ];

							if ( influence === 0 ) continue;

							var targets = morphTargets[ t ].vertices;

							vA.x += ( targets[ face.a ].x - a.x ) * influence;
							vA.y += ( targets[ face.a ].y - a.y ) * influence;
							vA.z += ( targets[ face.a ].z - a.z ) * influence;

							vB.x += ( targets[ face.b ].x - b.x ) * influence;
							vB.y += ( targets[ face.b ].y - b.y ) * influence;
							vB.z += ( targets[ face.b ].z - b.z ) * influence;

							vC.x += ( targets[ face.c ].x - c.x ) * influence;
							vC.y += ( targets[ face.c ].y - c.y ) * influence;
							vC.z += ( targets[ face.c ].z - c.z ) * influence;

						}

						vA.add( a );
						vB.add( b );
						vC.add( c );

						a = vA;
						b = vB;
						c = vC;

					}

					if ( material.side === THREE.BackSide ) {
							
						var intersectionPoint = localRay.intersectTriangle( c, b, a, true );

					} else {
								
						var intersectionPoint = localRay.intersectTriangle( a, b, c, material.side !== THREE.DoubleSide );

					}

					if ( intersectionPoint === null ) continue;

					intersectionPoint.applyMatrix4( object.matrixWorld );

					var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

					if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

					intersects.push( {

						distance: distance,
						point: intersectionPoint,
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

			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( object.matrixWorld );
			
			if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

				return intersects;

			}
			
			inverseMatrix.getInverse( object.matrixWorld );
			localRay.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			/* if ( geometry instanceof THREE.BufferGeometry ) {

			} else */ if ( geometry instanceof THREE.Geometry ) {

				var vertices = geometry.vertices;
				var nbVertices = vertices.length;
				var interSegment = new THREE.Vector3();
				var interRay = new THREE.Vector3();
				var step = object.type === THREE.LineStrip ? 1 : 2;

				for ( var i = 0; i < nbVertices - 1; i = i + step ) {

					var distSq = localRay.distanceSqToSegment( vertices[ i ], vertices[ i + 1 ], interRay, interSegment );

					if ( distSq > precisionSq ) continue;

					var distance = localRay.origin.distanceTo( interRay );

					if ( distance < raycaster.near || distance > raycaster.far ) continue;

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
		// direction is assumed to be normalized (for accurate distance calculations)

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
