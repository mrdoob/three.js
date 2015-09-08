/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

module.exports = SkinnedMesh;

var Bone = require( "./Bone" ),
	Mesh = require( "./Mesh" ),
	Skeleton = require( "./Skeleton" ),
	Geometry = require( "../core/Geometry" ),
	Matrix4 = require( "../math/Matrix4" );

function SkinnedMesh( geometry, material, useVertexTexture ) {

	Mesh.call( this, geometry, material );

	this.type = "SkinnedMesh";

	this.bindMode = "attached";
	this.bindMatrix = new Matrix4();
	this.bindMatrixInverse = new Matrix4();

	// init bones

	// TODO: remove bone creation as there is no reason (other than
	// convenience) for SkinnedMesh to do this.

	var bones = [];

	var b, bl, bone, gbone;

	if ( this.geometry && this.geometry.bones !== undefined ) {

		for ( b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			bone = new Bone( this );
			bones.push( bone );

			bone.name = gbone.name;
			bone.position.fromArray( gbone.pos );
			bone.quaternion.fromArray( gbone.rotq );
			if ( gbone.scl !== undefined ) { bone.scale.fromArray( gbone.scl ); }

		}

		for ( b = 0, bl = this.geometry.bones.length; b < bl; ++ b ) {

			gbone = this.geometry.bones[ b ];

			if ( gbone.parent !== - 1 ) {

				bones[ gbone.parent ].add( bones[ b ] );

			} else {

				this.add( bones[ b ] );

			}

		}

	}

	this.normalizeSkinWeights();

	this.updateMatrixWorld( true );
	this.bind( new Skeleton( bones, undefined, useVertexTexture ), this.matrixWorld );

}

SkinnedMesh.prototype = Object.create( Mesh.prototype );
SkinnedMesh.prototype.constructor = SkinnedMesh;

SkinnedMesh.prototype.bind = function( skeleton, bindMatrix ) {

	this.skeleton = skeleton;

	if ( bindMatrix === undefined ) {

		this.updateMatrixWorld( true );
		
		this.skeleton.calculateInverses();

		bindMatrix = this.matrixWorld;

	}

	this.bindMatrix.copy( bindMatrix );
	this.bindMatrixInverse.getInverse( bindMatrix );

};

SkinnedMesh.prototype.pose = function () {

	this.skeleton.pose();

};

SkinnedMesh.prototype.normalizeSkinWeights = function () {

	if ( this.geometry instanceof Geometry ) {

		for ( var i = 0; i < this.geometry.skinIndices.length; i ++ ) {

			var sw = this.geometry.skinWeights[ i ];

			var scale = 1.0 / sw.lengthManhattan();

			if ( scale !== Infinity ) {

				sw.multiplyScalar( scale );

			} else {

				sw.set( 1 ); // this will be normalized by the shader anyway

			}

		}

	} else {

		// skinning weights assumed to be normalized for THREE.BufferGeometry

	}

};

SkinnedMesh.prototype.updateMatrixWorld = function () {

	Mesh.prototype.updateMatrixWorld.call( this, true );

	if ( this.bindMode === "attached" ) {

		this.bindMatrixInverse.getInverse( this.matrixWorld );

	} else if ( this.bindMode === "detached" ) {

		this.bindMatrixInverse.getInverse( this.bindMatrix );

	} else {

		console.warn( "SkinnedMesh unrecognized bindMode: " + this.bindMode );

	}

};

SkinnedMesh.prototype.clone = function() {

	return new this.constructor( this.geometry, this.material, this.useVertexTexture ).copy( this );

};
