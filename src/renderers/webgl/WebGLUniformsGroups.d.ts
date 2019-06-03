import { UniformsGroup } from './../../core/UniformsGroup';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLInfo } from './WebGLInfo';
import { WebGLState } from './WebGLState';

export class WebGLUniformsGroups {

	constructor( gl: any, info: WebGLInfo, capabilities: WebGLCapabilities, state: WebGLState );

	bind( uniformsGroup: UniformsGroup, program: any ): void;
	dispose(): void;
	update( uniformsGroup: UniformsGroup, program: any ): void;

}
