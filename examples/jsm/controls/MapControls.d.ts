import {
  Camera,
  EventDispatcher,
  MOUSE,
  Object3D,
  Vector3
} from '../../../src/Three';

export class MapControls extends EventDispatcher {
  constructor(object: Camera, domElement?: HTMLElement);

  object: Camera;
  domElement: HTMLElement | HTMLDocument;

  // API
  enabled: boolean;
  target: Vector3;

  enableZoom: boolean;
  zoomSpeed: number;
  minDistance: number;
  maxDistance: number;
  enableRotate: boolean;
  rotateSpeed: number;
  enablePan: boolean;
  keyPanSpeed: number;
  maxZoom: number;
  minZoom: number;
  panSpeed: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  enableKeys: boolean;
  screenSpacePanning: boolean;
  keys: { LEFT: number; UP: number; RIGHT: number; BOTTOM: number };
  mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
  enableDamping: boolean;
  dampingFactor: number;
  target0: Vector3;
  position0: Vector3;
  zoom0: number;

  rotateLeft(angle?: number): void;

  rotateUp(angle?: number): void;

  panLeft(distance?: number): void;

  panUp(distance?: number): void;

  pan(deltaX: number, deltaY: number): void;

  dollyIn(dollyScale: number): void;

  dollyOut(dollyScale: number): void;

  saveState(): void;

  update(): boolean;

  reset(): void;

  dispose(): void;

  getPolarAngle(): number;

  getAzimuthalAngle(): number;
}
