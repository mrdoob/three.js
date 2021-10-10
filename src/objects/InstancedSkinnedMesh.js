import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';
import { SkinnedMesh } from './SkinnedMesh.js';
import { Matrix4 } from '../math/Matrix4.js';

const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();

const _instanceIntersects = [];

class InstancedSkinnedMesh extends SkinnedMesh {

	constructor( geometry, material, count ) {

		super( geometry, material );

		this.instanceMatrix = new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 );
		this.instanceColor = null;
		this.instanceBones = null;

		this.count = count;

		this.frustumCulled = false;

		this._mesh = null;

	}

	copy( source ) {

		super.copy( source );

		if ( source.isInstancedMesh ) {

			this.instanceMatrix.copy( source.instanceMatrix );

			if ( source.instanceColor !== null ) this.instanceColor = source.instanceColor.clone();

			this.count = source.count;

		}

		return this;

	}

	getColorAt( index, color ) {

		color.fromArray( this.instanceColor.array, index * 3 );

	}

	getMatrixAt( index, matrix ) {

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

	}

	raycast( raycaster, intersects ) {

		const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;

		if ( this._mesh === null ) {

			this._mesh = new SkinnedMesh( this.geometry, this.material );
			this._mesh.copy( this );

		}

		const _mesh = this._mesh;

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

	}

	setColorAt( index, color ) {

		if ( this.instanceColor === null ) {

			this.instanceColor = new InstancedBufferAttribute( new Float32Array( this.instanceMatrix.count * 3 ), 3 );

		}

		color.toArray( this.instanceColor.array, index * 3 );

	}

	setMatrixAt( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	}

	setBonesAt( index, skeleton ) {

		skeleton = skeleton || this.skeleton;

		const size = skeleton.bones.length * 16;

		if ( this.instanceBones === null ) {

			this.instanceBones = new Float32Array( size * this.count );

		}

		skeleton.update( this.instanceBones, index );

	}

	updateMorphTargets() {

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

InstancedSkinnedMesh.prototype.isInstancedMesh = true;

export { InstancedSkinnedMesh };
