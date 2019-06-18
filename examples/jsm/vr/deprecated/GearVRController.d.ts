import {
  Object3D
} from '../../../../src/Three';

export class GearVRController extends Object3D {
  constructor(id: number);

	getTouchpadState(): boolean;
  getGamepad(): object;
  update(): void;
}
