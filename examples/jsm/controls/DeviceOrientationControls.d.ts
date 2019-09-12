import {
  Camera
} from '../../../src/Three';

export class DeviceOrientationControls {
  constructor(object: Camera);

  object: Camera;

  // API

  alphaOffset: number;
  deviceOrientation: any;
  enabled: boolean;
  screenOrientation: number;

  connect(): void;
  disconnect(): void;
  dispose(): void;
  update(): void;

}
