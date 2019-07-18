import {
  Camera,
  EventDispatcher,
  Vector3,
  Object3D
} from '../../../src/Three';

export class EditorControls extends EventDispatcher {
  constructor(object: Camera, domElement?: HTMLElement);

  object: Camera;
  domElement: HTMLElement | HTMLDocument;

  enabled: boolean;
  center: Vector3;
  panSpeed: number;
  zoomSpeed: number;
  rotationSpeed: number;

  focus(target: Object3D): void;
  pan(delta: Vector3): void;
  zoom(delta: Vector3): void;
  rotate(delta: Vector3): void;
  dispose(): void;

}
