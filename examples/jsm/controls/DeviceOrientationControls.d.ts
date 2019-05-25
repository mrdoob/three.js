import {
  Camera,
  Vector3
} from '../../../src/Three';

export class DeviceOrientationControls {
  constructor(object: Camera);

  object: Camera;

  // API

  alphaOffset: number;
  deviceOrientation: any;
  enabled: boolean;
  screenOrientation: number;
  target: Vector3;

  connect(): void;
  disconnect(): void;
  dispose(): void;
  update(): void;

}
