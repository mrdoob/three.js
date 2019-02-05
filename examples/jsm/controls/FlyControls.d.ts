import { Camera, Object3D, Vector3 } from '../../../src/Three';

export class FlyControls {
  constructor(object: Camera, domElement?: HTMLElement);

  object: Object3D;
  target: Vector3;
  domElement: HTMLCanvasElement | HTMLDocument;
  enabled: boolean;
  movementSpeed: number;
  rollSpeed: number;
  dragToLook: boolean;
  autoForward: boolean;

  update(delta: number): void;

  updateMovementVector(): void;
  updateRotationVector(): void;
  getContainerDimensions(): { size: [number, number], offset: [number, number] };

  dispose(): void;
}
