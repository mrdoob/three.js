import Node, { addNodeClass } from '../core/Node.js';
import { nodeProxy, mat3, mat4 } from '../shadernode/ShaderNode.js';
import { cameraProjectionMatrix } from './CameraNode.js';
import { modelViewMatrix, transformedViewMatrix, transformedNormalMatrix, modelNormalMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { normalLocal } from './NormalNode.js';
import InstanceNode from './InstanceNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { DynamicDrawUsage, InstancedBufferAttribute, InstancedInterleavedBuffer } from 'three';
import { instanceIndex } from '../core/IndexNode.js';

class AutoInstanceNode extends Node {

	constructor( instances ) {

		super( 'void' );

		this.instances = instances;

		this._modelViewMatrix = null;
		this._modelViewMatrixNode = null;

		this._normalMatrix = null;
		this._normalMatrixNode = null;

		//this.updateType = NodeUpdateType.OBJECT;
		this.updateBeforeType = NodeUpdateType.OBJECT;

	}

	constructorModelViewMatrix() {

		let instanceModelViewMatrixNode = this._modelViewMatrixNode;

		if ( instanceModelViewMatrixNode === null ) {

			const instances = this.instances;

			const instanceCount = instances.length;
			const instanceAttribute = new InstancedBufferAttribute( new Float32Array( instanceCount * 16 ), 16 );
			instanceAttribute.usage = DynamicDrawUsage;

			const buffer = new InstancedInterleavedBuffer( instanceAttribute.array, 16, 1 );

			const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			const instanceBuffers = [
				// F.Signature -> bufferAttribute( array, type, stride, offset )
				bufferFn( buffer, 'vec4', 16, 0 ),
				bufferFn( buffer, 'vec4', 16, 4 ),
				bufferFn( buffer, 'vec4', 16, 8 ),
				bufferFn( buffer, 'vec4', 16, 12 )
			];

			instanceModelViewMatrixNode = mat4( ...instanceBuffers );

			this._modelViewMatrix = instanceAttribute;
			this._modelViewMatrixNode = instanceModelViewMatrixNode;

		}

		return instanceModelViewMatrixNode;

	}

	constructorNormalMatrix() {

		let normalMatrixNode = this._normalMatrixNode;

		if ( normalMatrixNode === null ) {

			const instances = this.instances;

			const instanceCount = instances.length;
			const instanceAttribute = new InstancedBufferAttribute( new Float32Array( instanceCount * 9 ), 9 );
			instanceAttribute.usage = DynamicDrawUsage;

			const buffer = new InstancedInterleavedBuffer( instanceAttribute.array, 9, 1 );

			const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			const instanceBuffers = [
				bufferFn( buffer, 'vec3', 9, 0 ),
				bufferFn( buffer, 'vec3', 9, 3 ),
				bufferFn( buffer, 'vec3', 9, 6 )
			];

			normalMatrixNode = mat3( ...instanceBuffers );

			this._normalMatrix = instanceAttribute;
			this._normalMatrixNode = normalMatrixNode;

		}

		return normalMatrixNode;

	}

	construct( builder ) {

		const instanceMatrixNode = this.constructorModelViewMatrix();
		const normalMatrixNode = this.constructorNormalMatrix();

		builder.stack.assign( transformedViewMatrix, instanceMatrixNode );
		builder.stack.assign( transformedNormalMatrix, normalMatrixNode );


		//builder.stack.assign( transformedViewMatrix, modelViewMatrix );
		//builder.stack.assign( transformedNormalMatrix, modelNormalMatrix );

		//return cameraProjectionMatrix.mul( instanceMatrixNode ).mul( positionLocal );

	}

	updateBefore( frame ) {

		const { object, camera } = frame;
		const { instances, _modelViewMatrix, _normalMatrix } = this;

		// Set instance definitions ( injection! )

		const count = instances.length;

		object.isInstancedMesh = true;
		object.count = count;

		// --

		for ( let i = 0; i < count; i ++ ) {

			const instance = instances[ i ];

			instance.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, instance.matrixWorld );
			instance.normalMatrix.getNormalMatrix( instance.modelViewMatrix );

			//instance.updateWorldMatrix();
			//instance.matrixWorld.toArray( instanceMatrix.array, i * 16 );

			instance.modelViewMatrix.toArray( _modelViewMatrix.array, i * 16 );
			instance.normalMatrix.toArray( _normalMatrix.array, i * 9 );

		}

	}

}

export default AutoInstanceNode;

export const autoInstance = nodeProxy( AutoInstanceNode );

addNodeClass( AutoInstanceNode );
