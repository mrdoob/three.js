import { Camera, EventDispatcher, Object3D, Vector3 } from '../../../src/Three';

export class EditorControls extends EventDispatcher {
  constructor(object: Camera, domElement?: HTMLElement);

  enabled: boolean;
  center: Vector3;

  focus(target: Object3D, frame: boolean): void;

  pan(delta: Vector3): void;

  zoom(delta: Vector3): void;

  rotate(delta: Vector3): void;

  dispose(): void;
}
