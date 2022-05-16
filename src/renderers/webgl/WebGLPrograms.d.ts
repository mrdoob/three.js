import { WebGLRenderer } from './../WebGLRenderer';
import { WebGLProgram } from './WebGLProgram';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLCubeMaps } from './WebGLCubeMaps';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLClipping } from './WebGLClipping';
import { WebGLBindingStates } from './WebGLBindingStates';
import { Material } from './../../materials/Material';
import { Scene } from './../../scenes/Scene';

export class WebGLPrograms {
    constructor(
        renderer: WebGLRenderer,
        cubemaps: WebGLCubeMaps,
        extensions: WebGLExtensions,
        capabilities: WebGLCapabilities,
        bindingStates: WebGLBindingStates,
        clipping: WebGLClipping,
    );

    programs: WebGLProgram[];

    getParameters(material: Material, lights: any, shadows: object[], scene: Scene, object: any): any;
    getProgramCacheKey(parameters: any): string;
    getUniforms(material: Material): object;
    acquireProgram(parameters: any, cacheKey: string): WebGLProgram;
    releaseProgram(program: WebGLProgram): void;
}
