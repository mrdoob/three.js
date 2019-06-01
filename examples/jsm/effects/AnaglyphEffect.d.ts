import {
  Camera,
  Matrix3,
  Scene,
  WebGLRenderer
} from '../../../src/Three';

export class AnaglyphEffect {
  constructor(renderer: WebGLRenderer, width?: number, height?: number);
  colorMatrixLeft: Matrix3;
  colorMatrixRight: Matrix3;

  dispose(): void;
  render(scene: Scene, camera: Camera): void;
  setSize(width: number, height: number): void;
}
