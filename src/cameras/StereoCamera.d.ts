import { PerspectiveCamera } from './PerspectiveCamera';
import { Camera } from './Camera';

export class StereoCamera extends Camera {
    constructor();

    type: 'StereoCamera';

    /**
     * @default 1
     */
    aspect: number;

    /**
     * @default 0.064
     */
    eyeSep: number;

    cameraL: PerspectiveCamera;
    cameraR: PerspectiveCamera;

    update(camera: PerspectiveCamera): void;
}
