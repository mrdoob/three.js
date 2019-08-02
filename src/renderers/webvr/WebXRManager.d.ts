import { Group } from '../../objects/Group';
import { Camera } from '../../cameras/Camera';

export class WebXRManager {

	constructor( renderer: any, gl: WebGLRenderingContext );

	enabled: boolean;
	getController( id: number ): Group;
	setFramebufferScaleFactor( value: number ): void;
	setReferenceSpaceType( value: string ): void;
	getSession(): any;
	setSession( value: any ): void;
	getCamera( camera: Camera ): Camera;
	isPresenting: () => boolean;
	setAnimationLoop( callback: Function ): void;
	dispose(): void;

}
