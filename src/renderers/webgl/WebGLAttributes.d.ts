export class WebGLAttributes {
	constructor(gl: CanvasRenderingContext2D | WebGLRenderingContext);

	get(attribute: any): any;

	remove(attribute: any): void;

	update(attribute: any, bufferType: Array<any>): void;
}
