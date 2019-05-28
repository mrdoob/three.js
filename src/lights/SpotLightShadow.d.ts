import { PerspectiveCamera } from './../cameras/PerspectiveCamera';
import { Light } from './Light';
import { LightShadow } from './LightShadow';

export class SpotLightShadow extends LightShadow {

  camera: PerspectiveCamera;
  update( light: Light ): void;

}
