/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 * @author mrdoob / http://mrdoob.com/
 * @author ikerr / http://verold.com
 * @author Mugen87 / https://github.com/Mugen87
 */

import { LineSegments } from '../objects/LineSegments.js';
import { Matrix4 } from '../math/Matrix4.js';
import { VertexColors } from '../constants.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Object3D } from '../core/Object3D.js';

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

	geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

	var material = new LineBasicMaterial( { vertexColors: VertexColors, depthTest: false, depthWrite: false, transparent: true } );

	LineSegments.call( this, geometry, material );

	this.root = object;
	this.bones = bones;

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

}

SkeletonHelper.prototype = Object.create( LineSegments.prototype );
SkeletonHelper.prototype.constructor = SkeletonHelper;

SkeletonHelper.prototype.updateMatrixWorld = function () {

	var vector = new Vector3();

	var boneMatrix = new Matrix4();
	var matrixWorldInv = new Matrix4();

	return function updateMatrixWorld( force ) {

		var bones = this.bones;

		var geometry = this.geometry;
		var position = geometry.getAttribute( 'position' );

		matrixWorldInv.getInverse( this.root.matrixWorld );

		for ( var i = 0, j = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];

			if ( bone.parent && bone.parent.isBone ) {

				boneMatrix.multiplyMatrices( matrixWorldInv, bone.matrixWorld );
				vector.setFromMatrixPosition( boneMatrix );
				position.setXYZ( j, vector.x, vector.y, vector.z );

				boneMatrix.multiplyMatrices( matrixWorldInv, bone.parent.matrixWorld );
				vector.setFromMatrixPosition( boneMatrix );
				position.setXYZ( j + 1, vector.x, vector.y, vector.z );

				j += 2;

			}

		}

		geometry.getAttribute( 'position' ).needsUpdate = true;

		Object3D.prototype.updateMatrixWorld.call( this, force );

	};

}();

export { SkeletonHelper };
