/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 */

THREE.Mesh = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.type = 'Mesh';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.updateMorphTargets();

};

THREE.Mesh.prototype = Object.create( THREE.Object3D.prototype );
THREE.Mesh.prototype.constructor = THREE.Mesh;

THREE.Mesh.prototype.updateMorphTargets = function () {

	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {

		this.morphTargetBase = - 1;
		this.morphTargetInfluences = [];
		this.morphTargetDictionary = {};

		for ( var m = 0, ml = this.geometry.morphTargets.length; m < ml; m ++ ) {

			this.morphTargetInfluences.push( 0 );
			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

		}

	}

};

THREE.Mesh.prototype.getMorphTargetIndexByName = function ( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];

	}

	console.warn( 'THREE.Mesh.getMorphTargetIndexByName: morph target ' + name + ' does not exist. Returning 0.' );

	return 0;

};


THREE.Mesh.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();

	var tempA = new THREE.Vector3();
	var tempB = new THREE.Vector3();
	var tempC = new THREE.Vector3();

	var uvA = new THREE.Vector2();
	var uvB = new THREE.Vector2();
	var uvC = new THREE.Vector2();

	var barycoord = new THREE.Vector3();

	var intersectionPoint = new THREE.Vector3();
	var intersectionPointWorld = new THREE.Vector3();

	function uvIntersection( point, p1, p2, p3, uv1, uv2, uv3 ) {

		THREE.Triangle.barycoordFromPoint( point, p1, p2, p3, barycoord );

		uv1.multiplyScalar( barycoord.x );
		uv2.multiplyScalar( barycoord.y );
		uv3.multiplyScalar( barycoord.z );

		uv1.add( uv2 ).add( uv3 );

		return uv1.clone();

	}

	return function raycast( raycaster, intersects ) {

		var geometry = this.geometry;
		var material = this.material;

		if ( material === undefined ) return;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		sphere.copy( geometry.boundingSphere );
		sphere.applyMatrix4( this.matrixWorld );

		if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

			return;

		}

		// Check boundingBox before continuing

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		if ( geometry.boundingBox !== null ) {

			if ( ray.isIntersectionBox( geometry.boundingBox ) === false ) {

				return;

			}

		}

		var a, b, c;

		if ( geometry instanceof THREE.BufferGeometry ) {

			var index = geometry.index;
			var attributes = geometry.attributes;

			if ( index !== null ) {

				var indices = index.array;
				var positions = attributes.position.array;

				for ( var i = 0, l = indices.length; i < l; i += 3 ) {

					a = indices[ i ];
					b = indices[ i + 1 ];
					c = indices[ i + 2 ];

					vA.fromArray( positions, a * 3 );
					vB.fromArray( positions, b * 3 );
					vC.fromArray( positions, c * 3 );

					if ( material.side === THREE.BackSide ) {

						if ( ray.intersectTriangle( vC, vB, vA, true, intersectionPoint ) === null ) continue;

					} else {

						if ( ray.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide, intersectionPoint ) === null ) continue;

					}

					intersectionPointWorld.copy( intersectionPoint );
					intersectionPointWorld.applyMatrix4( this.matrixWorld );

					var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

					if ( distance < raycaster.near || distance > raycaster.far ) continue;

					var uv;

					if ( attributes.uv !== undefined ) {

						var uvs = attributes.uv.array;
						uvA.fromArray( uvs, a * 2 );
						uvB.fromArray( uvs, b * 2 );
						uvC.fromArray( uvs, c * 2 );
						uv = uvIntersection( intersectionPoint, vA, vB, vC, uvA, uvB, uvC );

					}

					intersects.push( {

						distance: distance,
						point: intersectionPointWorld.clone(),
						uv: uv,
						face: new THREE.Face3( a, b, c, THREE.Triangle.normal( vA, vB, vC ) ),
						faceIndex: Math.floor( i / 3 ), // triangle number in indices buffer semantics
						object: this

					} );

				}

			} else {

				var positions = attributes.position.array;

				for ( var i = 0, l = positions.length; i < l; i += 9 ) {

					vA.fromArray( positions, i );
					vB.fromArray( positions, i + 3 );
					vC.fromArray( positions, i + 6 );

					if ( material.side === THREE.BackSide ) {

						if ( ray.intersectTriangle( vC, vB, vA, true, intersectionPoint ) === null ) continue;

					} else {

						if ( ray.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide, intersectionPoint ) === null ) continue;

					}

					intersectionPointWorld.copy( intersectionPoint );
					intersectionPointWorld.applyMatrix4( this.matrixWorld );

					var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

					if ( distance < raycaster.near || distance > raycaster.far ) continue;

					var uv;

					if ( attributes.uv !== undefined ) {

						var uvs = attributes.uv.array;
						uvA.fromArray( uvs, i );
						uvB.fromArray( uvs, i + 2 );
						uvC.fromArray( uvs, i + 4 );
						uv = uvIntersection( intersectionPoint, vA, vB, vC, uvA, uvB, uvC );

					}

					a = i / 3;
					b = a + 1;
					c = a + 2;

					intersects.push( {

						distance: distance,
						point: intersectionPointWorld.clone(),
						uv: uv,
						face: new THREE.Face3( a, b, c, THREE.Triangle.normal( vA, vB, vC ) ),
						index: a, // triangle number in positions buffer semantics
						object: this

					} );

				}

			}

		} else if ( geometry instanceof THREE.Geometry ) {

			var isFaceMaterial = material instanceof THREE.MeshFaceMaterial;
			var materials = isFaceMaterial === true ? material.materials : null;

			var vertices = geometry.vertices;
			var faces = geometry.faces;

			for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

				var face = faces[ f ];
				var faceMaterial = isFaceMaterial === true ? materials[ face.materialIndex ] : material;

				if ( faceMaterial === undefined ) continue;

				a = vertices[ face.a ];
				b = vertices[ face.b ];
				c = vertices[ face.c ];

				if ( faceMaterial.morphTargets === true ) {

					var morphTargets = geometry.morphTargets;
					var morphInfluences = this.morphTargetInfluences;

					vA.set( 0, 0, 0 );
					vB.set( 0, 0, 0 );
					vC.set( 0, 0, 0 );

					for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

						var influence = morphInfluences[ t ];

						if ( influence === 0 ) continue;

						var targets = morphTargets[ t ].vertices;

						vA.addScaledVector( tempA.subVectors( targets[ face.a ], a ), influence );
						vB.addScaledVector( tempB.subVectors( targets[ face.b ], b ), influence );
						vC.addScaledVector( tempC.subVectors( targets[ face.c ], c ), influence );

					}

					vA.add( a );
					vB.add( b );
					vC.add( c );

					a = vA;
					b = vB;
					c = vC;

				}

				if ( faceMaterial.side === THREE.BackSide ) {

					if ( ray.intersectTriangle( c, b, a, true, intersectionPoint ) === null ) continue;

				} else {

					if ( ray.intersectTriangle( a, b, c, faceMaterial.side !== THREE.DoubleSide, intersectionPoint ) === null ) continue;

				}

				intersectionPointWorld.copy( intersectionPoint );
				intersectionPointWorld.applyMatrix4( this.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

				if ( distance < raycaster.near || distance > raycaster.far ) continue;

				var uv;

				if ( geometry.faceVertexUvs[ 0 ].length > 0 ) {

					var uvs = geometry.faceVertexUvs[ 0 ][ f ];
					uvA.copy( uvs[ 0 ] );
					uvB.copy( uvs[ 1 ] );
					uvC.copy( uvs[ 2 ] );
					uv = uvIntersection( intersectionPoint, a, b, c, uvA, uvB, uvC );

				}

				intersects.push( {

					distance: distance,
					point: intersectionPointWorld.clone(),
					uv: uv,
					face: face,
					faceIndex: f,
					object: this

				} );

			}

		}

	};

}() );

THREE.Mesh.prototype.clone = function () {

	return new this.constructor( this.geometry, this.material ).copy( this );

};

THREE.Mesh.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	// only serialize if not in meta geometries cache
	if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

		meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON( meta );

	}

	// only serialize if not in meta materials cache
	if ( meta.materials[ this.material.uuid ] === undefined ) {

		meta.materials[ this.material.uuid ] = this.material.toJSON( meta );

	}

	data.object.geometry = this.geometry.uuid;
	data.object.material = this.material.uuid;

	return data;

};
