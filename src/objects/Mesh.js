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

THREE.Mesh.prototype.objectSpaceRayIntersectsFace = function() {

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();

	var intersectionPoint = new THREE.Vector3();
	var intersectionPointWorld = new THREE.Vector3();
	var originWorld = new THREE.Vector3();

	var a, b, c, tmpFace;

	var uvA = new THREE.Vector2();
	var uvB = new THREE.Vector2();
	var uvC = new THREE.Vector2();

	var barycoord = new THREE.Vector3();


	function uvIntersection( point, p1, p2, p3, uv1, uv2, uv3 ) {

		THREE.Triangle.barycoordFromPoint( point, p1, p2, p3, barycoord );

		uv1.multiplyScalar( barycoord.x );
		uv2.multiplyScalar( barycoord.y );
		uv3.multiplyScalar( barycoord.z );

		uv1.add( uv2 ).add( uv3 );

		return uv1.clone();

	}


	return function(faceIndex, objectSpaceRay, near, far,  intersects) {

		var uv = undefined;
		var uvs = undefined;
		var geometry = this.geometry;


		var material = this.material;
		if ( material === undefined ) return;

		if ( geometry instanceof THREE.BufferGeometry ) {

			var attributes = geometry.attributes;
			var positions = attributes.position.array;

			// Indexed-BufferGeometry
			if ( geometry.index !== undefined ) {

				var indices = geometry.index.array;

				a = ( indices[ faceIndex*3 ] )      ;
				b = ( indices[ faceIndex*3 + 1 ] )  ;
				c = ( indices[ faceIndex*3 + 2 ] )  ;

			} else {

				a = faceIndex*3 ;
				b = faceIndex*3 + 1;
				c = faceIndex*3 + 2;

			}

			vA.fromArray( positions, a *3 );
			vB.fromArray( positions, b *3 );
			vC.fromArray( positions, c *3 );

			tmpFace = new THREE.Face3( a,b,c, THREE.Triangle.normal( vA, vB, vC ) );

			if ( attributes.uv !== undefined ) {

				uvs = attributes.uv.array;
				uvA.fromArray( uvs, a * 2 );
				uvB.fromArray( uvs, b * 2 );
				uvC.fromArray( uvs, c * 2 );

			}


		} else if ( this.geometry instanceof THREE.Geometry ) {

			tmpFace = geometry.faces[ faceIndex ];

			var isFaceMaterial = this.material instanceof THREE.MeshFaceMaterial;
			var objectMaterials = (isFaceMaterial === true ? this.material.materials : null);
			material = (isFaceMaterial === true ? objectMaterials[ tmpFace.materialIndex ] : this.material);


			if ( material === undefined ) return;

			vertices = geometry.vertices;

			a = vertices[ tmpFace.a ];
			b = vertices[ tmpFace.b ];
			c = vertices[ tmpFace.c ];

			vA.set( 0, 0, 0 );
			vB.set( 0, 0, 0 );
			vC.set( 0, 0, 0 );


			if ( faceMaterial.morphTargets === true ) {

				var morphTargets = geometry.morphTargets;
				var morphInfluences = this.morphTargetInfluences;

				for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

					var influence = morphInfluences[ t ];

					if ( influence === 0 ) return;

					var targets = morphTargets[ t ].vertices;

					vA.addScaledVector( tempA.subVectors( targets[ tmpFace.a ], a ), influence );
					vB.addScaledVector( tempB.subVectors( targets[ tmpFace.b ], b ), influence );
					vC.addScaledVector( tempC.subVectors( targets[ tmpFace.c ], c ), influence );

				}

			}

			vA.add( a );
			vB.add( b );
			vC.add( c );

			if ( geometry.faceVertexUvs[ 0 ].length > 0 ) {

				uvs = geometry.faceVertexUvs[ 0 ][ f ];
				uvA.copy( uvs[ 0 ] );
				uvB.copy( uvs[ 1 ] );
				uvC.copy( uvs[ 2 ] );

			}

		} else {
			console.warn('objectSpaceRayIntersectsFace: The type of the geometry is not supported.');
			return;
		}


		if ( material.side === THREE.BackSide ) {

			if ( objectSpaceRay.intersectTriangle( vC, vB, vA, true, intersectionPoint ) === null ){ return; } ;

		} else {

			if ( objectSpaceRay.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide, intersectionPoint ) === null ){ return; };

		}

		intersectionPointWorld.copy( intersectionPoint );
		intersectionPointWorld.applyMatrix4( this.matrixWorld );

		// To calculate the correct distance, we need to calculate the distance between the world intersection point
		// and the world ray origin.  (If we didn't do that the distance will be off by the object scaling factors.)
		originWorld.copy(objectSpaceRay.origin).applyMatrix4( this.matrixWorld );
		var distance = originWorld.distanceTo( intersectionPointWorld );

		if ( distance < near || distance > far ) return;

		if ( uvs !== undefined ) {

			uv = uvIntersection(intersectionPoint, vA, vB, vC, uvA, uvB, uvC);

		}

		intersects.push( {

			distance: distance,
			point: intersectionPointWorld.clone(),
			uv: uv,
			face: tmpFace,
			faceIndex: faceIndex,
			object: this

		} );
	};
}();

THREE.Mesh.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();

	return function ( raycaster, intersects ) {

		if ( this.material === undefined ) return;

		var geometry = this.geometry;

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );


		// Checking boundingSphere distance to ray
		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		if ( ray.isIntersectionSphere( geometry.boundingSphere ) === false ) {

			return;

		}


		// Check boundingBox before continuing
		if ( geometry.boundingBox !== null ) {

			if ( ray.isIntersectionBox( geometry.boundingBox ) === false )  {

				return;

			}

		}

		if ( geometry instanceof THREE.BufferGeometry ) {

			var attributes = geometry.attributes;
			var positions = attributes.position.array;

			if ( geometry.index !== undefined ) {

				var indices = geometry.index.array;
				var groups = geometry.groups;

				if ( groups.length === 0 ) {

					groups = [ { start: 0, count: indices.length } ];

				}

				for ( var oi = 0, ol = groups.length; oi < ol; ++oi ) {

					var start = groups[ oi ].start;
					var count = groups[ oi ].count;

					for ( var i = start / 3, il = (start + count) / 3; i < il; i += 1 ) {

						this.objectSpaceRayIntersectsFace(i, ray,  raycaster.near, raycaster.far, intersects);

					}

				}

			} else {

				for ( var i = 0,  l = positions.length / 9; i < l; i += 1 ) {

					this.objectSpaceRayIntersectsFace(i, ray, raycaster.near, raycaster.far,  intersects);

				}

			}

		} else if ( geometry instanceof THREE.Geometry ) {

			for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				this.objectSpaceRayIntersectsFace(f, ray, raycaster.near, raycaster.far, intersects);

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
