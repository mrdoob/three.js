import { InstancedBufferAttribute } from 'three';
import { storage, element, assign } from 'three/nodes';
import TypedBuffer, { getFunction } from './TypedBuffer.js';

export default class WebGPUTypedBuffer extends TypedBuffer {

	constructor( typedArray, elementSize = 1 ) {

		super( typedArray, elementSize );

		this._buffer = new InstancedBufferAttribute( typedArray, elementSize );
		this._nodeBuffer = storage( this._buffer, getFunction( typedArray, elementSize )().nodeType, this.length );
	
	}

	getBufferElement( i ) {

		return element( this._nodeBuffer, i );
	
	}

	setBufferElement( i, value ) {

		return assign( element( this._nodeBuffer, i ), value );
	
	}

	set needsUpdate( value ) {} // Temporary
	dispose() {} // Temporary

}