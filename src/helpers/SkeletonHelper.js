/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 * @author mrdoob / http://mrdoob.com/
 * @author ikerr / http://verold.com
 * @author Mugen87 / https://github.com/Mugen87
 */

import { LineSegments } from '../objects/LineSegments.js';
import { Matrix4 } from '../math/Matrix4.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Object3D } from '../core/Object3D.js';

var _vector = new Vector3();
var _boneMatrix = new Matrix4();
var _matrixWorldInv = new Matrix4();

function getBoneList( object ) {

	var boneList = [];

	if ( object && object.isBone ) {

		boneList.push( object );

	}

	for ( var i = 0; i < object.children.length; i ++ ) {

		boneList.push.apply( boneList, getBoneList( object.children[ i ] ) );

	}

	return boneList;

}

function SkeletonHelper( object ) {

	var bones = getBoneList( object );

	var geometry = new BufferGeometry();

	var vertices = [];
	var colors = [];

	var color1 = new Color( 0, 0, 1 );
	var color2 = new Color( 0, 1, 0 );

	for ( var i = 0; i < bones.length; i ++ ) {

		var bone = bones[ i ];

		if ( bone.parent && bone.parent.isBone ) {

			vertices.push( 0, 0, 0 );
			vertices.push( 0, 0, 0 );
			colors.push( color1.r, color1.g, color1.b );
			colors.push( color2.r, color2.g, color2.b );

		}

	}

	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	var material = new LineBasicMaterial( { vertexColors: true, depthTest: false, depthWrite: false, toneMapped: false, transparent: true } );

	LineSegments.call( this, geometry, material );

	this.root = object;
	this.bones = bones;

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

}

SkeletonHelper.prototype = Object.create( LineSegments.prototype );
SkeletonHelper.prototype.constructor = SkeletonHelper;

SkeletonHelper.prototype.isSkeletonHelper = true;

SkeletonHelper.prototype.updateMatrixWorld = function ( force ) {

	var bones = this.bones;

	var geometry = this.geometry;
	var position = geometry.getAttribute( 'position' );

	_matrixWorldInv.getInverse( this.root.matrixWorld );

	for ( var i = 0, j = 0; i < bones.length; i ++ ) {

		var bone = bones[ i ];

		if ( bone.parent && bone.parent.isBone ) {

			_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.matrixWorld );
			_vector.setFromMatrixPosition( _boneMatrix );
			position.setXYZ( j, _vector.x, _vector.y, _vector.z );

			_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.parent.matrixWorld );
			_vector.setFromMatrixPosition( _boneMatrix );
			position.setXYZ( j + 1, _vector.x, _vector.y, _vector.z );

			j += 2;

		}

	}

	geometry.getAttribute( 'position' ).needsUpdate = true;

	Object3D.prototype.updateMatrixWorld.call( this, force );

};

export { SkeletonHelper };
