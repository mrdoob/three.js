export class WebGLIndexedBufferRenderer {

	constructor(
		gl: WebGLRenderingContext,
		extensions: any,
		info: any,
		capabilities: any
	);

	setMode( value: any ): void;
	setIndex( index: any ): void;
	render( start: any, count: number ): void;
	renderInstances(
		geometry: any,
		start: any,
		count: number,
		primcount: number
	): void;

}
