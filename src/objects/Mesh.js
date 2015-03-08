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


THREE.Mesh.prototype.rayIntersectsFace = function() {

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();
	var originalOrigin = new THREE.Vector3();
	var a, b, c, tmpFace;
			
	return function(faceIndex, drawcallIndexOffset, ray, precision, near, far,  intersects) {

		var geometry = this.geometry;
			
		var material = this.material;
		if ( material === undefined ) return;				
								
		if ( geometry instanceof THREE.BufferGeometry ) {	
			
			var attributes = geometry.attributes;
			var positions = attributes.position.array;				
		
			// Indexed-BufferGeometry
			if ( attributes.index !== undefined ) {

				var indices = attributes.index.array;
				
				a = ( indices[ faceIndex*3 ] )     + drawcallIndexOffset ;
				b = ( indices[ faceIndex*3 + 1 ] ) + drawcallIndexOffset ;
				c = ( indices[ faceIndex*3 + 2 ] ) + drawcallIndexOffset ;
											
			} else {
				
				a = faceIndex*3 ;
				b = faceIndex*3 + 1;
				c = faceIndex*3 + 2;
				
			}
			
			vA.fromArray( positions, a *3 );
			vB.fromArray( positions, b *3 );
			vC.fromArray( positions, c *3 );	
			
			tmpFace = new THREE.Face3( a,b,c, THREE.Triangle.normal( vA, vB, vC ) );							
			
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

				if ( material.morphTargets === true ) {

					var morphTargets = geometry.morphTargets;
					var morphInfluences = this.morphTargetInfluences;

					for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

						var influence = morphInfluences[ t ];

						if ( influence === 0 ) return;

						var targets = morphTargets[ t ].vertices;

						vA.x += ( targets[ tmpFace.a ].x - a.x ) * influence;
						vA.y += ( targets[ tmpFace.a ].y - a.y ) * influence;
						vA.z += ( targets[ tmpFace.a ].z - a.z ) * influence;

						vB.x += ( targets[ tmpFace.b ].x - b.x ) * influence;
						vB.y += ( targets[ tmpFace.b ].y - b.y ) * influence;
						vB.z += ( targets[ tmpFace.b ].z - b.z ) * influence;

						vC.x += ( targets[ tmpFace.c ].x - c.x ) * influence;
						vC.y += ( targets[ tmpFace.c ].y - c.y ) * influence;
						vC.z += ( targets[ tmpFace.c ].z - c.z ) * influence;

					}

				}
				
				vA.add( a );
				vB.add( b );
				vC.add( c );			
				
		} else {
			console.warn('rayIntersectsFace: The type of the geometry is not supported.');
			return;
		}
		
			
		if ( material.side === THREE.BackSide ) {

			var intersectionPoint = ray.intersectTriangle( vC, vB, vA, true );

		} else {

			var intersectionPoint = ray.intersectTriangle( vA, vB, vC, material.side !== THREE.DoubleSide );

		}

		if ( intersectionPoint === null ) return;

		intersectionPoint.applyMatrix4( this.matrixWorld );
		
		// To calculate the correct distance we need to calculate the distance between the world intersection point 
		// and the world ray origin.  (If we didn't do that the distance will be off by the object scaling factor.)    
		originalOrigin.copy(ray.origin).applyMatrix4( this.matrixWorld );
		var distance = originalOrigin.distanceTo( intersectionPoint );

		if ( distance < precision || distance < near || distance > far ) return;
		

		intersects.push( {

			distance: distance,
			point: intersectionPoint,
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

			if ( attributes.index !== undefined ) {

				var indices = attributes.index.array;
				var drawcalls = geometry.drawcalls;

				if ( drawcalls.length === 0 ) {

					drawcalls = [ { start: 0, count: indices.length, index: 0 } ];

				}

				for ( var oi = 0, ol = offsets.length; oi < ol; ++oi ) {

					var start = drawcalls[ oi ].start;
					var count = drawcalls[ oi ].count;
					var indexOffset = drawcalls[ oi ].index;

					for ( var i = start / 3, il = (start + count) / 3; i < il; i += 1 ) {

  						this.rayIntersectsFace(i, indexOffset,  ray, raycaster.precision, raycaster.near, raycaster.far, intersects);		

					}

				}

			} else {

				for ( var i = 0,  l = positions.length / 9; i < l; i += 1 ) {

					this.rayIntersectsFace(i, 0, ray, raycaster.precision, raycaster.near, raycaster.far,  intersects);

				}

			}

		} else if ( geometry instanceof THREE.Geometry ) {

			for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				this.rayIntersectsFace(f, 0,  ray, raycaster.precision, raycaster.near, raycaster.far, intersects);		
				
			}

		}

	};

}() );

THREE.Mesh.prototype.clone = function ( object, recursive ) {

	if ( object === undefined ) object = new THREE.Mesh( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object, recursive );

	return object;

};
