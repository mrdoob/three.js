/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BufferAttribute } from '../core/BufferAttribute.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Mesh } from './Mesh.js';

var _matrix3 = new Matrix3();

function InstancedMesh( geometry, material, count ) {

	Mesh.call( this, geometry, material );

	this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );
	this.instanceNormalMatrix = new BufferAttribute( new Float32Array( count * 9 ), 9 );

}

InstancedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: InstancedMesh,

	isInstancedMesh: true,

	raycast: function () {},

	setMatrixAt: function ( matrix, offset ) {

		matrix.toArray( this.instanceMatrix.array, offset * 16 );

		_matrix3.getNormalMatrix( matrix ).toArray( this.instanceNormalMatrix.array, offset * 9 );

	},

	updateMorphTargets: function () {}

} );

export { InstancedMesh };
