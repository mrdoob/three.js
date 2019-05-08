import { UniformsGroup } from './../../core/UniformsGroup';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLProgram } from './WebGLProgram';
import { WebGLInfo} from './WebGLInfo';

export class WebGLUniformsGroups {
  constructor(gl: any, info: WebGLInfo, capabilities: WebGLCapabilities);

	bind(uniformsGroup: UniformsGroup, program: WebGLProgram): void;
	dispose(): void;
	update(uniformsGroup: UniformsGroup): void;

}
