import {
  Object3D,
} from '../../../src/Three';

export class CarControls {
  constructor( maxSpeed: number, acceleration: number, brakePower: number, turningRadius: number, keys: object );

  // API
  enabled: boolean;
  elemNames: object;
  maxSpeed: number;
  acceleration: number;
  turningRadius: number;
  brakePower: number;
  speed: number;

  dispose(): void;
  update( delta: number ): void;
  setModel ( model: Object3D, elemNames: object ): void;

}
