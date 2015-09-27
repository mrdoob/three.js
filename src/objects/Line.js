/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Line = function ( geometry, material, mode ) {

	if ( mode === 1 ) {

		console.warn( 'THREE.Line: parameter THREE.LinePieces no longer supported. Created THREE.LineSegments instead.' );
		return new THREE.LineSegments( geometry, material );

	}

	THREE.Object3D.call( this );

	this.type = 'Line';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.LineBasicMaterial( { color: Math.random() * 0xffffff } );

};

THREE.Line.prototype = Object.create( THREE.Object3D.prototype );
THREE.Line.prototype.constructor = THREE.Line;

THREE.Line.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();

	return function raycast( raycaster, intersects ) {

		var precision = raycaster.linePrecision;
		var precisionSq = precision * precision;

		var geometry = this.geometry;

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		// Checking boundingSphere distance to ray

		sphere.copy( geometry.boundingSphere );
		sphere.applyMatrix4( this.matrixWorld );

		if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

			return;

		}

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		var vStart = new THREE.Vector3();
		var vEnd = new THREE.Vector3();
		var interSegment = new THREE.Vector3();
		var interRay = new THREE.Vector3();
		var step = this instanceof THREE.LineSegments ? 2 : 1;

		if ( geometry instanceof THREE.BufferGeometry ) {

			var index = geometry.index;
			var attributes = geometry.attributes;

			if ( index !== null ) {

				var indices = index.array;
				var positions = attributes.position.array;

				for ( var i = 0, l = indices.length - 1; i < l; i += step ) {

					var a = indices[ i ];
					var b = indices[ i + 1 ];

					vStart.fromArray( positions, a * 3 );
					vEnd.fromArray( positions, b * 3 );

					var distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

					if ( distSq > precisionSq ) continue;

					interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

					var distance = raycaster.ray.origin.distanceTo( interRay );

					if ( distance < raycaster.near || distance > raycaster.far ) continue;

					intersects.push( {

						distance: distance,
						// What do we want? intersection point on the ray or on the segment??
						// point: raycaster.ray.at( distance ),
						point: interSegment.clone().applyMatrix4( this.matrixWorld ),
						index: i,
						face: null,
						faceIndex: null,
						object: this

					} );

				}

			} else {

				var positions = attributes.position.array;

				for ( var i = 0, l = positions.length / 3 - 1; i < l; i += step ) {

					vStart.fromArray( positions, 3 * i );
					vEnd.fromArray( positions, 3 * i + 3 );

					var distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

					if ( distSq > precisionSq ) continue;

					interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

					var distance = raycaster.ray.origin.distanceTo( interRay );

					if ( distance < raycaster.near || distance > raycaster.far ) continue;

					intersects.push( {

						distance: distance,
						// What do we want? intersection point on the ray or on the segment??
						// point: raycaster.ray.at( distance ),
						point: interSegment.clone().applyMatrix4( this.matrixWorld ),
						index: i,
						face: null,
						faceIndex: null,
						object: this

					} );

				}

			}

		} else if ( geometry instanceof THREE.Geometry ) {

			var vertices = geometry.vertices;
			var nbVertices = vertices.length;

			for ( var i = 0; i < nbVertices - 1; i += step ) {

				var distSq = ray.distanceSqToSegment( vertices[ i ], vertices[ i + 1 ], interRay, interSegment );

				if ( distSq > precisionSq ) continue;

				interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

				var distance = raycaster.ray.origin.distanceTo( interRay );

				if ( distance < raycaster.near || distance > raycaster.far ) continue;

				intersects.push( {

					distance: distance,
					// What do we want? intersection point on the ray or on the segment??
					// point: raycaster.ray.at( distance ),
					point: interSegment.clone().applyMatrix4( this.matrixWorld ),
					index: i,
					face: null,
					faceIndex: null,
					object: this

				} );

			}

		}

	};

}() );

THREE.Line.prototype.clone = function () {

	return new this.constructor( this.geometry, this.material ).copy( this );

};

THREE.Line.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	// only serialize if not in meta geometries cache
	if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

		meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON();

	}

	// only serialize if not in meta materials cache
	if ( meta.materials[ this.material.uuid ] === undefined ) {

		meta.materials[ this.material.uuid ] = this.material.toJSON();

	}

	data.object.geometry = this.geometry.uuid;
	data.object.material = this.material.uuid;

	return data;

};

// DEPRECATED

THREE.LineStrip = 0;
THREE.LinePieces = 1;
