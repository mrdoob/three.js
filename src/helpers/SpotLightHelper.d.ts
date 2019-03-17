import { Light } from './../lights/Light';
import { Color } from './../math/Color';
import { Matrix4 } from './../math/Matrix4';
import { Object3D } from './../core/Object3D';

export class SpotLightHelper extends Object3D {
  constructor(light: Light, color?: Color | string | number);

  light: Light;
  matrix: Matrix4;
  matrixAutoUpdate: boolean;
  color: Color | string | number | undefined;

  dispose(): void;
  update(): void;
}
