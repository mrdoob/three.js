import { PerspectiveCamera } from './../cameras/PerspectiveCamera';
import { LightShadow } from './LightShadow';

export class SpotLightShadow extends LightShadow {
    camera: PerspectiveCamera;
    readonly isSpotLightShadow: true;

    /**
     * @default 1
     */
    focus: number;
}
