import { PerspectiveCamera } from './../cameras/PerspectiveCamera';
import { LightShadow } from './LightShadow';

export class PointLightShadow extends LightShadow {

	camera: PerspectiveCamera;

	updateMatrices( light: Light, viewportIndex: number ): void;

}
