import { Group } from '../../objects/Group';

export class WebXRController {

	constructor();

	getTargetRaySpace(): Group;
	getGripSpace(): Group;
	dispatchEvent( event: object ): this;
	disconnect( inputSource: object ): this;
	update( inputSource: object, frame: object, referenceSpace: string ): this;

}
