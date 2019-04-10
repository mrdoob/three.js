import { Camera, MOUSE, Object3D, Vector3 } from '../../../src/Three';

export class OrbitControls {
  constructor(object: Camera, domElement?: HTMLElement);

  object: Camera;
  domElement: HTMLElement | HTMLDocument;

  // API
  enabled: boolean;
  target: Vector3;

  // deprecated
  center: Vector3;

  enableZoom: boolean;
  zoomSpeed: number;
  minDistance: number;
  maxDistance: number;
  enableRotate: boolean;
  rotateSpeed: number;
  enablePan: boolean;
  keyPanSpeed: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  enableKeys: boolean;
  keys: {LEFT: number; UP: number; RIGHT: number; BOTTOM: number;};
  mouseButtons: {ORBIT: MOUSE; ZOOM: MOUSE; PAN: MOUSE;};
  enableDamping: boolean;
  dampingFactor: number;
  screenSpacePanning: boolean;


  rotateLeft(angle?: number): void;

  rotateUp(angle?: number): void;

  panLeft(distance?: number): void;

  panUp(distance?: number): void;

  pan(deltaX: number, deltaY: number): void;

  dollyIn(dollyScale: number): void;

  dollyOut(dollyScale: number): void;

  update(): void;

  reset(): void;

  dispose(): void;

  getPolarAngle(): number;

  getAzimuthalAngle(): number;

  // EventDispatcher mixins
  addEventListener(type: string, listener: (event: any) => void): void;

  hasEventListener(type: string, listener: (event: any) => void): boolean;

  removeEventListener(type: string, listener: (event: any) => void): void;

  dispatchEvent(event: {type: string; target: any;}): void;
}
