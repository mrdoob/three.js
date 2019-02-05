import { Camera, Object3D, Vector3, EventDispatcher } from '../../../src/Three';

export class PointerLockControls extends EventDispatcher {
  constructor(camera: Camera, domElement?: HTMLElement);

  domElement: HTMLCanvasElement | HTMLDocument;
  
  pitchObject: Object3D;
  yawObject: Object3D;
  isLocked: boolean;

  connect(): void;
  disconnect(): void;
  dispose(): void;

  getObject(): Object3D;
  getDirection(object: Object3D): Object3D;
  lock(): void;
  unlock(): void;
}
