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
