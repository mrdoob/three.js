export class WebGLAttributes {
	constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);

	get(attribute: any): any;

	remove(attribute: any): void;

	update(attribute: any, bufferType: Array<any>): void;
}
