// Renderers / WebGL /////////////////////////////////////////////////////////////////////
export class WebGLBufferRenderer {

	constructor( _gl: WebGLRenderingContext, extensions: any, _infoRender: any );

	setMode( value: any ): void;
	render( start: any, count: number ): void;
	renderInstances( geometry: any ): void;

}
