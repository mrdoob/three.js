import { PerspectiveCamera } from './PerspectiveCamera';
import { Camera } from './Camera';

export class StereoCamera extends Camera {
  constructor();

  type: 'StereoCamera';

  aspect: number;
  eyeSep: number;
  cameraL: PerspectiveCamera;
  cameraR: PerspectiveCamera;

  update(camera: PerspectiveCamera): void;
}
