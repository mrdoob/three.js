export class WebGLExtensions {

	constructor( gl: WebGLRenderingContext );

	has( name: string ): boolean;
	get( name: string ): any;

}
