import {
  Object3D,
  Camera,
  Vector3,
  Euler
} from '../../../src/Three';

export class TransformControls extends Object3D {
  constructor(object: Camera, domElement?: HTMLElement);

  domElement: HTMLElement;

  // API

  camera: Camera;
  object: Object3D;
  enabled: boolean;
  axis: string;
  mode: string;
  translationSnap: Vector3;
  rotationSnap: Vector3;
  space: string;
  size: number;
  dragging: boolean;
  showX: boolean;
  showY: boolean;
  showZ: boolean;
  isTransformControls: boolean;
  visible: boolean;

  attach(object: Object3D): void;
  detach(): void;
  pointerHover(pointer: Object): void;
  pointerDown(pointer: Object): void;
  pointerMove(pointer: Object): void;
  pointerUp(pointer: Object): void;
  getMode(): string;
  setMode(mode: string): void;
  setTranslationSnap(translationSnap: Vector3): void;
  setRotationSnap(rotationSnap: Euler): void;
  setSize(size: number): void;
  setSpace(space: string): void;
  dispose(): void;
  update(): void;

}
