import {
  Camera,
  Scene,
  WebGLRenderer
} from '../../../src/Three';

export interface AsciiEffectOptions {
  resolution?: number;
  scale?: number;
  color?: boolean;
  alpha?: boolean;
  block?: boolean;
  invert?: boolean;
}

export class AsciiEffect {
  constructor(renderer: WebGLRenderer, charSet?: string, options?: AsciiEffectOptions);
  domElement: HTMLElement;

  render(scene: Scene, camera: Camera): void;
  setSize(width: number, height: number): void;
}
