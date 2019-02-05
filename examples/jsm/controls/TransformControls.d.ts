import { Camera, Object3D } from'../../../src/Three';

export type TransformControlAxis = 'X' | 'Y' | 'Z';
export type TransformControlMode = 'translate' | 'rotate' | 'scale';
export type TransformControlSpace = 'wold' | 'local';

export class TransformControls extends Object3D {
  constructor(camera: Camera, domElement?: HTMLElement);
  camera: Camera;
  object: Object3D;
  enabled: boolean;
  axis: TransformControlAxis;
	mode: TransformControlMode;
	translationSnap: boolean;
	rotationSnap: boolean;
	space: TransformControlSpace;
	size: number;
	dragging: boolean;
	showX: boolean;
	showY: boolean;
	showZ: boolean;

  attach(object: Object3D): void;
  detach(): void;

  getMode(): TransformControlMode;
  setMode(mode: TransformControlMode): void;
  setTranslationSnap(size: number): void;
  setRotationSnap(size: number): void;
  setSize(size: number): void;
  setSpace(space: TransformControlSpace): void;

  /**
   * @deprecated
   */
  update(): void;
}
