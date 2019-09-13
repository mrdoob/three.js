import { Camera, EventDispatcher } from '../../../src/Three';

export class OrthographicTrackballControls extends EventDispatcher {
  constructor(object: Camera, domElement?: HTMLElement);

  object: Camera;
  domElement: HTMLElement;

  enabled: boolean;
  screen: {left: number; top: number; width: number; height: number};
  rotateSpeed: number;
  zoomSpeed: number;
  noRotate: boolean;
  noZoom: boolean;
  noPan: boolean;
  noRoll: boolean;
  staticMoving: boolean;
  dynamicDampingFactor: number;
  keys: number[];

  handleResize(): void;
  rotateCamera(): void;
  zoomCamera(): void;
  panCamera(): void;
  update(): void;
  reset(): void;
  dispose(): void;

}
