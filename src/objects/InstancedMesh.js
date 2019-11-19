/**
 * @author mrdoob / http://mrdoob.com/
 */
import { BufferAttribute } from '../core/BufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';

function InstancedMesh( geometry, material, count ) {

	Mesh.call( this, geometry, material );

	this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );

	this.count = count;

}

InstancedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: InstancedMesh,

	isInstancedMesh: true,

	getMatrixAt: function ( index, matrix ) {

		var matrix = matrix || new Matrix4();

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

		return matrix;

	},

	setMatrixAt: function ( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	},

	// updateMorphTargets: function () {
    //
	// }

} );

export { InstancedMesh };
