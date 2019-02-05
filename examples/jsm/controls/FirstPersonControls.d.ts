import { Camera, Object3D, Vector3 } from '../../../src/Three';

export class FirstPersonControls {
  constructor(object: Camera, domElement?: HTMLElement);

  object: Object3D;
  target: Vector3;
  domElement: HTMLCanvasElement | HTMLDocument;
  enabled: boolean;
  movementSpeed: number;
  lookSpeed: number;
  noFly: boolean;
  lookVertical: boolean;
  autoForward: boolean;
  activeLook: boolean;
  heightSpeed: boolean;
  heightCoef: number;
  heightMin: number;
  heightMax: number;
  constrainVertical: boolean;
  verticalMin: number;
  verticalMax: number;
  autoSpeedFactor: number;
  mouseX: number;
  mouseY: number;
  lat: number;
  lon: number;
  phi: number;
  theta: number;
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  freeze: boolean;
  mouseDragOn: boolean;

  update(delta: number): void;

  dispose(): void;
}
