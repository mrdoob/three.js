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

		var data = THREE.Mesh.prototype.toJSON.call( this, meta );

		data.object.bindMode = this.bindMode;
		data.object.bindMatrix = this.bindMatrix.toArray();

		var geometry;

		for ( var i = 0, il = data.geometries.length; i < il; i ++ ) {

			if ( data.geometries[ i ].uuid === this.geometry.uuid ) {

				geometry = data.geometries[ i ].data;
				break;

			}

		}

		// the following code should be in THREE.Skeleton?
		var scope = this;

		function getParentIndex ( bone ) {

			if ( ! bone.parent instanceof THREE.Bone ) return -1;

			for ( var i = 0, il = scope.skeleton.bones.length; i < il; i ++ ) {

				if ( scope.skeleton.bones[ i ] === bone.parent ) return i;

			}

			return -1;

		}

		var bones = [];

		for ( var i = 0, il = this.skeleton.bones.length; i < il; i ++ ) {

			var bone = this.skeleton.bones[ i ];

			bones.push( {

				name: bone.name,
				parent: getParentIndex( bone ),
				pos: bone.position.toArray(),
				rotq: bone.quaternion.toArray(),
				scl: bone.scale.toArray()

			} );

		}

		var boneInverses = [];

		for ( var i = 0, il = this.skeleton.boneInverses.length; i < il; i ++ ) {

			boneInverses.push( this.skeleton.boneInverses[ i ].toArray() );

		}

		if ( bones.length > 0 ) geometry.bones = bones;
		if ( boneInverses.length > 0 ) geometry.boneInverses = boneInverses;
		geometry.useVertexTexture = this.skeleton.useVertexTexture;

		return data;

	}

} );
