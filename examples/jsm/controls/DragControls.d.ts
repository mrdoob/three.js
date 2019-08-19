import {
  Camera,
  EventDispatcher,
  Object3D
} from '../../../src/Three';

export class DragControls extends EventDispatcher {
  constructor(objects: Object3D[], camera: Camera, domElement?: HTMLElement);

  object: Camera;

  // API

  enabled: boolean;

  activate(): void;
  deactivate(): void;
  dispose(): void;

}
