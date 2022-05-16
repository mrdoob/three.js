import { Group } from '../../objects/Group';
import { Camera } from '../../cameras/Camera';
import { EventDispatcher } from '../../core/EventDispatcher';
import { XRFrameRequestCallback, XRReferenceSpace, XRReferenceSpaceType, XRSession } from './WebXR';

export class WebXRManager extends EventDispatcher {
    constructor(renderer: any, gl: WebGLRenderingContext);

    /**
     * @default false
     */
    enabled: boolean;

    /**
     * @default false
     */
    isPresenting: boolean;

    getController(index: number): Group;
    getControllerGrip(index: number): Group;
    getHand(index: number): Group;
    setFramebufferScaleFactor(value: number): void;
    setReferenceSpaceType(value: XRReferenceSpaceType): void;
    getReferenceSpace(): XRReferenceSpace | null;
    getSession(): XRSession | null;
    setSession(value: XRSession): Promise<void>;
    getCamera(camera: Camera): Camera;
    setAnimationLoop(callback: XRFrameRequestCallback | null): void;
    getFoveation(): number | undefined;
    setFoveation(foveation: number): void;
    dispose(): void;
}
