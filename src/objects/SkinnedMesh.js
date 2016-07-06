/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

THREE.SkinnedMesh = function ( geometry, material, useVertexTexture ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'SkinnedMesh';

	this.bindMode = "attached";
	this.bindMatrix = new THREE.Matrix4();
	this.bindMatrixInverse = new THREE.Matrix4();

	// init bones

	// TODO: remove bone creation as there is no reason (other than
	// convenience) for THREE.SkinnedMesh to do this.

	var bones = [];
	var boneInverses;

	if ( this.geometry && this.geometry.bones !== undefined ) {

		var bone, gbone;

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			bone = new THREE.Bone( this );
			bones.push( bone );

			bone.name = gbone.name;
			bone.position.fromArray( gbone.pos );
			bone.quaternion.fromArray( gbone.rotq );
			if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );

		}

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			if ( gbone.parent !== - 1 && gbone.parent !== null &&
					bones[ gbone.parent ] !== undefined ) {

				bones[ gbone.parent ].add( bones[ b ] );

			} else {

				this.add( bones[ b ] );

			}

		}

		if ( this.geometry.boneInverses !== undefined ) {

			boneInverses = [];

			for ( var i = 0, il = this.geometry.boneInverses.length; i < il; i ++ ) {

				boneInverses.push( new THREE.Matrix4().fromArray( this.geometry.boneInverses[ i ] ) );

			}

		}

	}

	this.normalizeSkinWeights();

	this.updateMatrixWorld( true );
	this.bind( new THREE.Skeleton( bones, boneInverses, useVertexTexture ), this.matrixWorld );

};


THREE.SkinnedMesh.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: THREE.SkinnedMesh,

	bind: function( skeleton, bindMatrix ) {

		this.skeleton = skeleton;

		if ( bindMatrix === undefined ) {

			this.updateMatrixWorld( true );

			this.skeleton.calculateInverses();

			bindMatrix = this.matrixWorld;

		}

		this.bindMatrix.copy( bindMatrix );
		this.bindMatrixInverse.getInverse( bindMatrix );

	},

	pose: function () {

		this.skeleton.pose();

	},

	normalizeSkinWeights: function () {

		if ( this.geometry instanceof THREE.Geometry ) {

			for ( var i = 0; i < this.geometry.skinWeights.length; i ++ ) {

				var sw = this.geometry.skinWeights[ i ];

				var scale = 1.0 / sw.lengthManhattan();

				if ( scale !== Infinity ) {

					sw.multiplyScalar( scale );

				} else {

					sw.set( 1, 0, 0, 0 ); // do something reasonable

				}

			}

		} else if ( this.geometry instanceof THREE.BufferGeometry ) {

			var vec = new THREE.Vector4();

			var skinWeight = this.geometry.attributes.skinWeight;

			for ( var i = 0; i < skinWeight.count; i ++ ) {

				vec.x = skinWeight.getX( i );
				vec.y = skinWeight.getY( i );
				vec.z = skinWeight.getZ( i );
				vec.w = skinWeight.getW( i );

				var scale = 1.0 / vec.lengthManhattan();

				if ( scale !== Infinity ) {

					vec.multiplyScalar( scale );

				} else {

					vec.set( 1, 0, 0, 0 ); // do something reasonable

				}

				skinWeight.setXYZW( i, vec.x, vec.y, vec.z, vec.w );

			}

		}

	},

	updateMatrixWorld: function( force ) {

		THREE.Mesh.prototype.updateMatrixWorld.call( this, true );

		if ( this.bindMode === "attached" ) {

			this.bindMatrixInverse.getInverse( this.matrixWorld );

		} else if ( this.bindMode === "detached" ) {

			this.bindMatrixInverse.getInverse( this.bindMatrix );

		} else {

			console.warn( 'THREE.SkinnedMesh unrecognized bindMode: ' + this.bindMode );

		}

	},

	clone: function() {

		return new this.constructor( this.geometry, this.material, this.skeleton.useVertexTexture ).copy( this );

	},

	toJSON: function ( meta ) {

		var isRootObject = ( meta === undefined || meta === '' );

		if ( isRootObject ) {

			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				skeletons: {}
			};

		}

		var data = THREE.Mesh.prototype.toJSON.call( this, meta );

		if ( isRootObject ) {

			data.metadata = {
				version: 4.4,
				type: 'SkinnedMesh',
				generator: 'SkinnedMesh.toJSON'
			};


		}

		var object = data.object;

		object.bindMode = this.bindMode;
		object.bindMatrix = this.bindMatrix.toArray();

		if ( meta.skeletons[ this.skeleton.uuid ] === undefined ) {

			meta.skeletons[ this.skeleton.uuid ] = this.skeleton.toJSON( meta );
			object.skeleton = this.skeleton.uuid;

		}

		// copied from Object3D
		if ( isRootObject ) {

			var geometries = extractFromCache( meta.geometries );
			var materials = extractFromCache( meta.materials );
			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );
			var skeletons = extractFromCache( meta.skeletons );

			if ( geometries.length > 0 ) data.geometries = geometries;
			if ( materials.length > 0 ) data.materials = materials;
			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( skeletons.length > 0 ) data.skeletons = skeletons;

		}

		return data;

		// copied from Object3D
		function extractFromCache ( cache ) {

			var values = [];
			for ( var key in cache ) {

				var data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}
			return values;

		}

	}

} );
