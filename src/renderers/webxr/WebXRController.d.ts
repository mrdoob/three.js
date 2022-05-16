import { Group } from '../../objects/Group';
import { XREventType, XRFrame, XRInputSource, XRReferenceSpace } from './WebXR';

export type XRControllerEventType = XREventType | 'disconnected' | 'connected';

export class WebXRController {
    constructor();

    getTargetRaySpace(): Group;
    getGripSpace(): Group;
    dispatchEvent(event: { type: XRControllerEventType; data?: XRInputSource | undefined }): this;
    disconnect(inputSource: XRInputSource): this;
    update(inputSource: XRInputSource, frame: XRFrame, referenceSpace: XRReferenceSpace): this;
}
