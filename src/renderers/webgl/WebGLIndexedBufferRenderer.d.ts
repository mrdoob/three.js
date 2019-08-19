export class WebGLIndexedBufferRenderer {

	constructor( gl: WebGLRenderingContext, properties: any, info: any );

	setMode( value: any ): void;
	setIndex( index: any ): void;
	render( start: any, count: number ): void;
	renderInstances( geometry: any, start: any, count: number ): void;

}
