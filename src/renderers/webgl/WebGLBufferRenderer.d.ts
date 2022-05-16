// Renderers / WebGL /////////////////////////////////////////////////////////////////////
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLInfo } from './WebGLInfo';
import { WebGLCapabilities } from './WebGLCapabilities';

export class WebGLBufferRenderer {
    constructor(
        gl: WebGLRenderingContext,
        extensions: WebGLExtensions,
        info: WebGLInfo,
        capabilities: WebGLCapabilities,
    );

    setMode(value: any): void;
    render(start: any, count: number): void;
    renderInstances(start: any, count: number, primcount: number): void;
}
