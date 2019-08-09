import {
  Renderer,
  RenderTarget,
  Texture,
  CubeTexture
} from '../../../src/Three';

export class PMREMGenerator {
  cubeLods:CubeTexture[];

  constructor(sourceTexture:Texture, samplesPerLevel?:number, resolution?:number);
  update(renderer:Renderer): void;
  renderToCubeMapTarget(renderer:Renderer, renderTarget:any): void;
  renderToCubeMapTargetFace(renderer:Renderer, renderTarget:RenderTarget, faceIndex:number): void;
  dispose(): void;
}
