import {
  Object3D,
  Mesh,
  Texture
} from '../../../src/Three';

export class MD2CharacterComplex {
  constructor();
  scale: number;
  animationFPS: number;
  transitionFrames: number;
  maxSpeed: number;
  maxReverseSpeed: number;
  frontAcceleration: number;
  backAcceleration: number;
  frontDecceleration: number;
  angularSpeed: number;
  root: Object3D;
  meshBody: Mesh | null;
  meshWeapon: Mesh | null;
  controls: null;
  skinsBody: Texture[];
  skinsWeapon: Texture[];
  weapons: Mesh[];
  currentSkin: number;
  onLoadComplete: () => void;

  meshes: Mesh[];
  animations: object[];
  loadCounter: number;
  speed: number;
  bodyOrientation: number;
  walkSpeed: number;
  crouchSpeed: number;
  activeAnimation: string;
  oldAnimation: string;

  enableShadows(enable: boolean): void;
  setVisible(enable: boolean): void;
  shareParts(original: MD2CharacterComplex): void;
  loadParts(config: object): void;
  setPlaybackRate(rate: number): void;
  setWireframe(wireframeEnabled: boolean): void;
  setSkin(index: number): void;
  setWeapon(index: number): void;
  setAnimation(animationName: string): void;
  update(delta: number): void;
  updateAnimations(delta: number): void;
  updateBehaviors(): void;
  updateMovementModel(delta: number): void;
}
