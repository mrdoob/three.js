import {
  Color,
  MaterialParameters,
  ShaderMaterial,
  Vector2
} from '../../../src/Three';

export interface PerspectiveLineMaterialParameters extends MaterialParameters {
  color?: number;
  worldlinewidth?: number;
  minlinewidth?: number;
  maxlinewidth?: number;
  dashed?: boolean;
  dashScale?: number;
  dashSize?: number;
  gapSize?: number;
  resolution?: Vector2;
}

export class PerspectiveLineMaterial extends ShaderMaterial {
  constructor(parameters?: PerspectiveLineMaterialParameters);
  color: Color;
  worldlinewidth: number;
  minlinewidth: number;
  maxlinewidth: number;
  dashed: boolean;
  dashScale: number;
  dashSize: number;
  gapSize: number;
  isPerspectiveLineMaterial: boolean;
  resolution: Vector2;
}
