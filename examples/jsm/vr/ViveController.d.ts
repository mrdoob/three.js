import {
  Matrix4,
  Object3D
} from '../../../src/Three';

export class ViveController extends Object3D {
  constructor(id: number);
  standingMatrix: Matrix4;

  getButtonState(button: string): boolean;
  getGamepad(): object;
  update(): void;
}
