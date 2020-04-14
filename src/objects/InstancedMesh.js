/**
 * @author mrdoob / http://mrdoob.com/
 */
import { BufferAttribute } from '../core/BufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';

var _instanceLocalMatrix = new Matrix4();
var _instanceWorldMatrix = new Matrix4();

var _instanceIntersects = [];

var _mesh = new Mesh();

function InstancedMesh( geometry, material, count ) {

	Mesh.call( this, geometry, material );

	this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );

	this.count = count;

	this.frustumCulled = false;

}

InstancedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: InstancedMesh,

	isInstancedMesh: true,

	getMatrixAt: function ( index, matrix ) {

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

	},

	raycast: function ( raycaster, intersects ) {

		var matrixWorld = this.matrixWorld;
		var raycastTimes = this.count;

		_mesh.geometry = this.geometry;
		_mesh.material = this.material;

		if ( _mesh.material === undefined ) return;

		for ( var instanceId = 0; instanceId < raycastTimes; instanceId ++ ) {

			// calculate the world matrix for each instance

			this.getMatrixAt( instanceId, _instanceLocalMatrix );

			_instanceWorldMatrix.multiplyMatrices( matrixWorld, _instanceLocalMatrix );

			// the mesh represents this single instance

			_mesh.matrixWorld = _instanceWorldMatrix;

			_mesh.raycast( raycaster, _instanceIntersects );

			// process the result of raycast

			if ( _instanceIntersects.length > 0 ) {

				_instanceIntersects[ 0 ].instanceId = instanceId;
				_instanceIntersects[ 0 ].object = this;

				intersects.push( _instanceIntersects[ 0 ] );

				_instanceIntersects.length = 0;

			}

		}

	},

	setMatrixAt: function ( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	},

	updateMorphTargets: function () {

	}

} );

export { InstancedMesh };
