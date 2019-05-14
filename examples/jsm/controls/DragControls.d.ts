import {
  Camera,
	Object3D
} from '../../../src/Three';

export class DragControls {
  constructor(objects: Object3D[], camera: Camera, domElement?: HTMLElement);

  object: Camera;

  // API

  enabled: boolean;

  activate(): void;
  deactivate(): void;
  dispose(): void;

}
