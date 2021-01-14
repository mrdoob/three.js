import { BufferAttribute } from '../core/BufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';

const _instanceLocalMatrix = new Matrix4();
const _instanceWorldMatrix = new Matrix4();

const _instanceIntersects = [];

const _mesh = new Mesh();

function InstancedMesh( geometry, material, count ) {

	Mesh.call( this, geometry, material );

	this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );
	this.instanceColor = null;

	this.count = count;

	this.frustumCulled = false;

}

InstancedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: InstancedMesh,

	isInstancedMesh: true,

	copy: function ( source ) {

		Mesh.prototype.copy.call( this, source );

		this.instanceMatrix.copy( source.instanceMatrix );

		if ( source.instanceColor !== null ) this.instanceColor = source.instanceColor.clone();

		this.count = source.count;

		return this;

	},

	getColorAt: function ( index, color ) {

		color.fromArray( this.instanceColor.array, index * 3 );

	},

	getMatrixAt: function ( index, matrix ) {

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

	},

	raycast: function ( raycaster, intersects ) {

		const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;

		_mesh.geometry = this.geometry;
		_mesh.material = this.material;

		if ( _mesh.material === undefined ) return;

		for ( let instanceId = 0; instanceId < raycastTimes; instanceId ++ ) {

			// calculate the world matrix for each instance

			this.getMatrixAt( instanceId, _instanceLocalMatrix );

			_instanceWorldMatrix.multiplyMatrices( matrixWorld, _instanceLocalMatrix );

			// the mesh represents this single instance

			_mesh.matrixWorld = _instanceWorldMatrix;

			_mesh.raycast( raycaster, _instanceIntersects );

			// process the result of raycast

			for ( let i = 0, l = _instanceIntersects.length; i < l; i ++ ) {

				const intersect = _instanceIntersects[ i ];
				intersect.instanceId = instanceId;
				intersect.object = this;
				intersects.push( intersect );

			}

			_instanceIntersects.length = 0;

		}

	},

	setColorAt: function ( index, color ) {

		if ( this.instanceColor === null ) {

			this.instanceColor = new BufferAttribute( new Float32Array( this.count * 3 ), 3 );

		}

		color.toArray( this.instanceColor.array, index * 3 );

	},

	setMatrixAt: function ( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	},

	updateMorphTargets: function () {

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

} );

export { InstancedMesh };
