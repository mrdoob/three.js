/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 * @author mrdoob / http://mrdoob.com/
 * @author ikerr / http://verold.com
 */

module.exports = SkeletonHelper;

var Constants = require( "../../Constants" ),
	Geometry = require( "../../core/Geometry" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" ),
	Color = require( "../../math/Color" ),
	Matrix4 = require( "../../math/Matrix4" ),
	Vector3 = require( "../../math/Vector3" ),
	Bone = require( "../../objects/Bone" ),
	LineSegments = require( "../../objects/LineSegments");

function SkeletonHelper( object ) {

	this.bones = this.getBoneList( object );

	var geometry = new Geometry();

	for ( var i = 0; i < this.bones.length; i ++ ) {

		var bone = this.bones[ i ];

		if ( bone.parent instanceof Bone ) {

			geometry.vertices.push( new Vector3() );
			geometry.vertices.push( new Vector3() );
			geometry.colors.push( new Color( 0, 0, 1 ) );
			geometry.colors.push( new Color( 0, 1, 0 ) );

		}

	}

	geometry.dynamic = true;

	var material = new LineBasicMaterial( { vertexColors: Constants.VertexColors, depthTest: false, depthWrite: false, transparent: true } );

	LineSegments.call( this, geometry, material );

	this.root = object;

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

	this.update();

}

SkeletonHelper.prototype = Object.create( LineSegments.prototype );
SkeletonHelper.prototype.constructor = SkeletonHelper;

SkeletonHelper.prototype.getBoneList = function( object ) {

	var boneList = [];

	if ( object instanceof Bone ) {

		boneList.push( object );

	}

	for ( var i = 0; i < object.children.length; i ++ ) {

		boneList.push.apply( boneList, this.getBoneList( object.children[ i ] ) );

	}

	return boneList;

};

SkeletonHelper.prototype.update = function () {

	var geometry = this.geometry;

	var matrixWorldInv = new Matrix4().getInverse( this.root.matrixWorld );

	var boneMatrix = new Matrix4();

	var j = 0;

	for ( var i = 0; i < this.bones.length; i ++ ) {

		var bone = this.bones[ i ];

		if ( bone.parent instanceof Bone ) {

			boneMatrix.multiplyMatrices( matrixWorldInv, bone.matrixWorld );
			geometry.vertices[ j ].setFromMatrixPosition( boneMatrix );

			boneMatrix.multiplyMatrices( matrixWorldInv, bone.parent.matrixWorld );
			geometry.vertices[ j + 1 ].setFromMatrixPosition( boneMatrix );

			j += 2;

		}

	}

	geometry.verticesNeedUpdate = true;

	geometry.computeBoundingSphere();

};
