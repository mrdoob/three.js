import { Mesh } from './Mesh';
import { Vector4 } from '../math/Vector4';
import { Skeleton } from './Skeleton';
import { Bone } from './Bone';
import { Matrix4 } from '../math/Matrix4';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

function SkinnedMesh( geometry, material, useVertexTexture ) {

	Mesh.call( this, geometry, material );

	this.type = 'SkinnedMesh';

	this.bindMode = "attached";
	this.bindMatrix = new Matrix4();
	this.bindMatrixInverse = new Matrix4();

	// init bones

	// TODO: remove bone creation as there is no reason (other than
	// convenience) for THREE.SkinnedMesh to do this.

	var bones = [];
	var boneInverses;

	if ( this.geometry && this.geometry.bones !== undefined ) {

		var bone, gbone;

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			bone = new Bone();
			bones.push( bone );

			bone.name = gbone.name;
			bone.position.fromArray( gbone.pos );
			bone.quaternion.fromArray( gbone.rotq );
			if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );
			if ( gbone.uuid !== undefined ) bone.uuid = gbone.uuid;

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

				boneInverses.push( new Matrix4().fromArray( this.geometry.boneInverses[ i ] ) );

			}

		}

	}

	this.normalizeSkinWeights();

	this.updateMatrixWorld( true );
	this.bind( new Skeleton( bones, boneInverses, useVertexTexture ), this.matrixWorld );

}

SkinnedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: SkinnedMesh,

	isSkinnedMesh: true,

	bind: function ( skeleton, bindMatrix ) {

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

		if ( this.geometry && this.geometry.isGeometry ) {

			for ( var i = 0; i < this.geometry.skinWeights.length; i ++ ) {

				var sw = this.geometry.skinWeights[ i ];

				var scale = 1.0 / sw.lengthManhattan();

				if ( scale !== Infinity ) {

					sw.multiplyScalar( scale );

				} else {

					sw.set( 1, 0, 0, 0 ); // do something reasonable

				}

			}

		} else if ( this.geometry && this.geometry.isBufferGeometry ) {

			var vec = new Vector4();

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

	updateMatrixWorld: function () {

		Mesh.prototype.updateMatrixWorld.call( this, true );

		if ( this.bindMode === "attached" ) {

			this.bindMatrixInverse.getInverse( this.matrixWorld );

		} else if ( this.bindMode === "detached" ) {

			this.bindMatrixInverse.getInverse( this.bindMatrix );

		} else {

			console.warn( 'THREE.SkinnedMesh unrecognized bindMode: ' + this.bindMode );

		}

	},

	clone: function () {

		return new this.constructor( this.geometry, this.material, this.skeleton.useVertexTexture ).copy( this );

	},

	// copied from Object3D.toJSON()
	toJSON: function ( meta ) {

		// meta is '' when called from JSON.stringify
		var isRootObject = ( meta === undefined || meta === '' );

		var output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				skeletons: {}
			};

			output.metadata = {
				version: 4.4,
				type: 'SkinnedMesh',
				generator: 'SkinnedMesh.toJSON'
			};

		}

		// standard Object3D serialization

		var object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;

		object.matrix = this.matrix.toArray();

		// SkinnedMesh specific

		if ( this.bindMode !== undefined ) object.bindMode = this.bindMode;
		if ( this.bindMatrix !== undefined ) object.bindMatrix = this.bindMatrix.toArray();

		//

		if ( this.geometry !== undefined ) {

			if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

				meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON( meta );

			}

			object.geometry = this.geometry.uuid;

		}

		if ( this.material !== undefined ) {

			if ( meta.materials[ this.material.uuid ] === undefined ) {

				meta.materials[ this.material.uuid ] = this.material.toJSON( meta );

			}

			object.material = this.material.uuid;

		}

		if ( this.skeleton !== undefined ) {

			if ( meta.skeletons[ this.skeleton.uuid ] === undefined ) {

				meta.skeletons[ this.skeleton.uuid ] = this.skeleton.toJSON( meta );

			}

			object.skeleton = this.skeleton.uuid;

		}

		//

		object.children = [];

		for ( var i = 0; i < this.children.length; i ++ ) {

			var child = this.children[ i ];

			if ( ! ( child instanceof Bone ) /* || child.skin !== this */ ) {

				object.children.push( child.toJSON( meta ).object );

			}

		}

		if ( isRootObject ) {

			var geometries = extractFromCache( meta.geometries );
			var materials = extractFromCache( meta.materials );
			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );
			var skeletons = extractFromCache( meta.skeletons );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( skeletons.length > 0 ) output.skeletons = skeletons;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

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


export { SkinnedMesh };
