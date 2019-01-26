import { Color } from './../math/Color';
import { MaterialParameters } from './Material';
import { LineBasicMaterial } from './LineBasicMaterial';

export interface LineDashedMaterialParameters extends MaterialParameters {
  color?: Color | string | number;
  linewidth?: number;
  scale?: number;
  dashSize?: number;
  gapSize?: number;
}

export class LineDashedMaterial extends LineBasicMaterial {
  constructor(parameters?: LineDashedMaterialParameters);

  scale: number;
  dashSize: number;
  gapSize: number;
  isLineDashedMaterial: boolean;

  setValues(parameters: LineDashedMaterialParameters): void;
}
