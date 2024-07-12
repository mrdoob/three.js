import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Box3 } from '../math/Box3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Sphere } from '../math/Sphere.js';
import { DataTexture } from '../textures/DataTexture.js';
import { FloatType, RedFormat } from '../constants.js';

const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();

const _instanceIntersects = [];

const _box3 = /*@__PURE__*/ new Box3();
const _identity = /*@__PURE__*/ new Matrix4();
const _mesh = /*@__PURE__*/ new Mesh();
const _sphere = /*@__PURE__*/ new Sphere();

class InstancedMesh extends Mesh {

	constructor( geometry, material, count ) {

		super( geometry, material );

		this.isInstancedMesh = true;

		this.instanceMatrix = new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 );
		this.instanceColor = null;
		this.morphTexture = null;

		this.count = count;

		this.boundingBox = null;
		this.boundingSphere = null;

		for ( let i = 0; i < count; i ++ ) {

			this.setMatrixAt( i, _identity );

		}

	}

	computeBoundingBox() {

		const geometry = this.geometry;
		const count = this.count;

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		if ( geometry.boundingBox === null ) {

			geometry.computeBoundingBox();

		}

		this.boundingBox.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			this.getMatrixAt( i, _instanceLocalMatrix );

			_box3.copy( geometry.boundingBox ).applyMatrix4( _instanceLocalMatrix );

			this.boundingBox.union( _box3 );

		}

	}

	computeBoundingSphere() {

		const geometry = this.geometry;
		const count = this.count;

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		if ( geometry.boundingSphere === null ) {

			geometry.computeBoundingSphere();

		}

		this.boundingSphere.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			this.getMatrixAt( i, _instanceLocalMatrix );

			_sphere.copy( geometry.boundingSphere ).applyMatrix4( _instanceLocalMatrix );

			this.boundingSphere.union( _sphere );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.instanceMatrix.copy( source.instanceMatrix );

		if ( source.morphTexture !== null ) this.morphTexture = source.morphTexture.clone();
		if ( source.instanceColor !== null ) this.instanceColor = source.instanceColor.clone();

		this.count = source.count;

		if ( source.boundingBox !== null ) this.boundingBox = source.boundingBox.clone();
		if ( source.boundingSphere !== null ) this.boundingSphere = source.boundingSphere.clone();

		return this;

	}

	getColorAt( index, color ) {

		color.fromArray( this.instanceColor.array, index * 3 );

	}

	getMatrixAt( index, matrix ) {

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

	}

	getMorphAt( index, object ) {

		const objectInfluences = object.morphTargetInfluences;

		const array = this.morphTexture.source.data.data;

		const len = objectInfluences.length + 1; // All influences + the baseInfluenceSum

		const dataIndex = index * len + 1; // Skip the baseInfluenceSum at the beginning

		for ( let i = 0; i < objectInfluences.length; i ++ ) {

			objectInfluences[ i ] = array[ dataIndex + i ];

		}

	}

	raycast( raycaster, intersects ) {

		const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;

		_mesh.geometry = this.geometry;
		_mesh.material = this.material;

		if ( _mesh.material === undefined ) return;

		// test with bounding sphere first

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere.copy( this.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		// now test each instance

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

			this.instanceColor = new InstancedBufferAttribute( new Float32Array( this.instanceMatrix.count * 3 ).fill( 1 ), 3 );

		}

		color.toArray( this.instanceColor.array, index * 3 );

	}

	setMatrixAt( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	}

	setMorphAt( index, object ) {

		const objectInfluences = object.morphTargetInfluences;

		const len = objectInfluences.length + 1; // morphBaseInfluence + all influences

		if ( this.morphTexture === null ) {

			this.morphTexture = new DataTexture( new Float32Array( len * this.count ), len, this.count, RedFormat, FloatType );

		}

		const array = this.morphTexture.source.data.data;

		let morphInfluencesSum = 0;

		for ( let i = 0; i < objectInfluences.length; i ++ ) {

			morphInfluencesSum += objectInfluences[ i ];

		}

		const morphBaseInfluence = this.geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

		const dataIndex = len * index;

		array[ dataIndex ] = morphBaseInfluence;

		array.set( objectInfluences, dataIndex + 1 );

	}

	updateMorphTargets() {

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

		if ( this.morphTexture !== null ) {

			this.morphTexture.dispose();
			this.morphTexture = null;

		}

		return this;

	}

}

export { InstancedMesh };
