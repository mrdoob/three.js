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

THREE.Mesh.prototype.updateMorphTargets = function () {

	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {

		this.morphTargetBase = - 1;
		this.morphTargetForcedOrder = [];
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

	console.log( 'THREE.Mesh.getMorphTargetIndexByName: morph target ' + name + ' does not exist. Returning 0.' );

	return 0;

};


THREE.Mesh.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();

	var vBox1 = new THREE.Vector3();
	var vBox2 = new THREE.Vector3();

	return function ( raycaster, intersects ) {

		var geometry = this.geometry;

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );


		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		if ( ray.isIntersectionSphere( geometry.boundingSphere ) === false ) {

			return;

		}

		// Check boundingBox before continuing
		if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

		if ( ray.intersectBox( geometry.boundingBox, undefined, vBox1, vBox2 ) === null )  {

			return;

		}

		
		
		// calculate hitbox positions. 
		// we add or substarct 0.0001 for floating point errors
		// (http://en.wikipedia.org/wiki/Round-off_error)
		var minX = Math.min(vBox1.x, vBox2.x) - 0.0001;
		var minY = Math.min(vBox1.y, vBox2.y) - 0.0001;
		var minZ = Math.min(vBox1.z, vBox2.z) - 0.0001;
		var maxX = Math.max(vBox1.x, vBox2.x) + 0.0001;
		var maxY = Math.max(vBox1.y, vBox2.y) + 0.0001;
		var maxZ = Math.max(vBox1.z, vBox2.z) + 0.0001;
		

		if ( geometry instanceof THREE.BufferGeometry ) {

			var material = this.material;

			if ( material === undefined ) return;

			var attributes = geometry.attributes;

			var a, b, c;
			var precision = raycaster.precision;

			if ( attributes.index !== undefined ) {

				var indices = attributes.index.array;
				var positions = attributes.position.array;
				var offsets = geometry.offsets;

				if ( offsets.length === 0 ) {

					offsets = [ { start: 0, count: indices.length, index: 0 } ];

				}

				for ( var oi = 0, ol = offsets.length; oi < ol; ++oi ) {

					var start = offsets[ oi ].start;
					var count = offsets[ oi ].count;
					var index = offsets[ oi ].index;

					for ( var i = start, il = start + count; i < il; i += 3 ) {

						a = ( index + indices[ i ] ) * 3;
						b = ( index + indices[ i + 1 ] ) * 3;
						c = ( index + indices[ i + 2 ] ) * 3;

						// Test if the triangle is near the ray.
						if (positions[ a     ] < minX && positions[ b     ] < minX && positions[ c     ] < minX) continue;
						if (positions[ a + 1 ] < minY && positions[ b + 1 ] < minY && positions[ c + 1 ] < minY) continue;
						if (positions[ a + 2 ] < minZ && positions[ b + 2 ] < minZ && positions[ c + 2 ] < minZ) continue;
						if (positions[ a     ] > maxX && positions[ b     ] > maxX && positions[ c     ] > maxX) continue;
						if (positions[ a + 1 ] > maxY && positions[ b + 1 ] > maxY && positions[ c + 1 ] > maxY) continue;
						if (positions[ a + 2 ] > maxZ && positions[ b + 2 ] > maxZ && positions[ c + 2 ] > maxZ) continue;


						vA.fromArray( positions, a );
						vB.fromArray( positions, b );
						vC.fromArray( positions, c );


						if ( material.side === THREE.BackSide ) {

							var intersectionPoint = ray.intersectTriangle( vC, vB, vA, true );

						} else {

							var intersectionPoint = ray.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide );

						}

						if ( intersectionPoint === null ) continue;

						intersectionPoint.applyMatrix4( this.matrixWorld );

						var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

						if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

						intersects.push( {

							distance: distance,
							point: intersectionPoint,
							face: new THREE.Face3( a/3, b/3, c/3, THREE.Triangle.normal( vA, vB, vC ) ),
							faceIndex: null,
							object: this

						} );

					}

				}

			} else {

				var positions = attributes.position.array;

				for ( var i = 0, j = 0, il = positions.length; i < il; i += 3, j += 9 ) {

					// Test if the triangle is near the ray.
					if (positions[ j     ] < minX && positions[ j + 3 ] < minX && positions[ j + 6 ] < minX) continue;
					if (positions[ j + 1 ] < minY && positions[ j + 4 ] < minY && positions[ j + 7 ] < minY) continue;
					if (positions[ j + 2 ] < minZ && positions[ j + 5 ] < minZ && positions[ j + 8 ] < minZ) continue;
					if (positions[ j     ] > maxX && positions[ j + 3 ] > maxX && positions[ j + 6 ] > maxX) continue;
					if (positions[ j + 1 ] > maxY && positions[ j + 4 ] > maxY && positions[ j + 7 ] > maxY) continue;
					if (positions[ j + 2 ] > maxZ && positions[ j + 5 ] > maxZ && positions[ j + 8 ] > maxZ) continue;

					vA.fromArray( positions, j );
					vB.fromArray( positions, j + 3 );
					vC.fromArray( positions, j + 6 );

					if ( material.side === THREE.BackSide ) {

						var intersectionPoint = ray.intersectTriangle( vC, vB, vA, true );

					} else {

						var intersectionPoint = ray.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide );

					}

					if ( intersectionPoint === null ) continue;

					intersectionPoint.applyMatrix4( this.matrixWorld );

					var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

					if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

					intersects.push( {

						distance: distance,
						point: intersectionPoint,
						face: new THREE.Face3( i, i+1, i+2, THREE.Triangle.normal( vA, vB, vC ) ),
						faceIndex: null,
						object: this

					} );

				}

			}

		} else if ( geometry instanceof THREE.Geometry ) {

			var isFaceMaterial = this.material instanceof THREE.MeshFaceMaterial;
			var objectMaterials = isFaceMaterial === true ? this.material.materials : null;

			var a, b, c, d;
			var precision = raycaster.precision;

			var vertices = geometry.vertices;

			for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				var face = geometry.faces[ f ];

				var material = isFaceMaterial === true ? objectMaterials[ face.materialIndex ] : this.material;

				if ( material === undefined ) continue;

				a = vertices[ face.a ];
				b = vertices[ face.b ];
				c = vertices[ face.c ];

				if ( material.morphTargets === true ) {

					var morphTargets = geometry.morphTargets;
					var morphInfluences = this.morphTargetInfluences;

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
				
				
				// Test if the triangle is near the ray.
				if (a.x < minX && b.x < minX && c.x < minX) continue;
				if (a.y < minY && b.y < minY && c.y < minY) continue;
				if (a.z < minZ && b.z < minZ && c.z < minZ) continue;
				if (a.x > maxX && b.x > maxX && c.x > maxX) continue;
				if (a.y > maxY && b.y > maxY && c.y > maxY) continue;
				if (a.z > maxZ && b.z > maxZ && c.z > maxZ) continue;
				
				

				if ( material.side === THREE.BackSide ) {

					var intersectionPoint = ray.intersectTriangle( c, b, a, true );

				} else {

					var intersectionPoint = ray.intersectTriangle( a, b, c, material.side !== THREE.DoubleSide );

				}

				if ( intersectionPoint === null ) continue;

				intersectionPoint.applyMatrix4( this.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( intersectionPoint );

				if ( distance < precision || distance < raycaster.near || distance > raycaster.far ) continue;

				intersects.push( {

					distance: distance,
					point: intersectionPoint,
					face: face,
					faceIndex: f,
					object: this

				} );

			}

		}

	};

}() );

THREE.Mesh.prototype.clone = function ( object, recursive ) {

	if ( object === undefined ) object = new THREE.Mesh( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object, recursive );

	return object;

};
