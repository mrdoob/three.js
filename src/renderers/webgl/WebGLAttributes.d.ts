import { WebGLCapabilities } from "./WebGLCapabilities";
import { BufferAttribute } from "../../core/BufferAttribute";
import { InterleavedBufferAttribute } from "../../core/InterleavedBufferAttribute";

export class WebGLAttributes {

	constructor( gl: WebGLRenderingContext | WebGL2RenderingContext, capabilities: WebGLCapabilities );

	get( attribute: BufferAttribute | InterleavedBufferAttribute ): {
		buffer: WebGLBuffer,
		type: GLenum,
		bytesPerElement: number,
		version: number
	};

	remove( attribute: BufferAttribute | InterleavedBufferAttribute ): void;

	update( attribute: BufferAttribute | InterleavedBufferAttribute, bufferType: GLenum ): void;

}
