import { storage, element, assign } from 'three/nodes';
import TypedBuffer, { getFunction } from './TypedBuffer.js';

export default class WebGPUTypedBuffer extends TypedBuffer {

	constructor( bufferAttribute ) {

		super( bufferAttribute );

		this._buffer = bufferAttribute;
		this._nodeBuffer = storage( bufferAttribute, getFunction( bufferAttribute )().nodeType, this.length );
	
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