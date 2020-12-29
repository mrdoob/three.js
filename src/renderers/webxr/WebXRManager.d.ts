import { Group } from '../../objects/Group';
import { Camera } from '../../cameras/Camera';
import { EventDispatcher } from '../../core/EventDispatcher';
import { XRFrameRequestCallback, XRReferenceSpace, XRReferenceSpaceType, XRSession } from './WebXR';

export class WebXRManager extends EventDispatcher {

	constructor( renderer: any, gl: WebGLRenderingContext );

	/**
	 * @default false
	 */
	enabled: boolean;

	/**
	 * @default false
	 */
	isPresenting: boolean;

	getController( id: number ): Group;
	getControllerGrip( id: number ): Group;
	getHand( id: number ): Group;
	setFramebufferScaleFactor( value: number ): void;
	setReferenceSpaceType( value: XRReferenceSpaceType ): void;
	getReferenceSpace(): XRReferenceSpace;
	getSession(): XRSession;
	setSession( value: XRSession ): void;
	getCamera( camera: Camera ): Camera;
	setAnimationLoop( callback: XRFrameRequestCallback ): void;
	dispose(): void;

}
