import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';

const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();

const _instanceIntersects = [];

const _identity = /*@__PURE__*/ new Matrix4();
const _mesh = /*@__PURE__*/ new Mesh();

class InstancedMesh extends Mesh {

	constructor( geometry, material, count ) {

		super( geometry, material );

		this.isInstancedMesh = true;

		this.instanceAttributes = {
			instanceMatrix: new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 )
		};

		this.count = count;

		this.frustumCulled = false;

		for ( let i = 0; i < count; i ++ ) {

			this.setMatrixAt( i, _identity );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		const sourceInstanceAttributeEntries = Object.entries( source.instanceAttributes );

		for ( const [ sourceAttributeKey, sourceAttribute ] of sourceInstanceAttributeEntries ) {

			const targetAttribute = this.instanceAttributes[ sourceAttributeKey ];

			if ( targetAttribute != null ) {

				targetAttribute.copy( sourceAttribute );

			} else {

				this.instanceAttributes[ sourceAttributeKey ] = sourceAttribute.clone();

			}

		}

		this.count = source.count;

		return this;

	}

	getAttributeAt( name, index, target, size ) {

		target.fromArray( this.instanceAttributes[ name ].array, index * size );

	}

	getColorAt( index, color ) {

		this.getAttributeAt( 'instanceColor', index, color, 3 );

	}

	getMatrixAt( index, matrix ) {

		this.getAttributeAt( 'instanceMatrix', index, matrix, 16 );

	}

	raycast( raycaster, intersects ) {

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

	}

	setColorAt( index, color ) {

		this.setAttributeAt( 'instanceColor', index, color, 3 );

	}

	setMatrixAt( index, matrix ) {

		this.setAttributeAt( 'instanceMatrix', index, matrix, 16 );

	}

	setAttributeAt( name, index, source, size ) {

		let attribute = this.instanceAttributes[ name ];

		if ( attribute == null ) {

			attribute = new InstancedBufferAttribute( new Float32Array( this.count * size ), size );
			this.instanceAttributes[ name ] = attribute;

		}

		source.toArray( attribute.array, index * size );

	}

	updateMorphTargets() {

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export { InstancedMesh };
