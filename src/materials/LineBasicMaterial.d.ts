import { Color } from './../math/Color';
import { MaterialParameters, Material } from './Material';

export interface LineBasicMaterialParameters extends MaterialParameters {
  color?: Color | string | number;
  linewidth?: number;
  linecap?: string;
  linejoin?: string;
}

export class LineBasicMaterial extends Material {

	constructor( parameters?: LineBasicMaterialParameters );

  color: Color;
  linewidth: number;
  linecap: string;
  linejoin: string;

  setValues( parameters: LineBasicMaterialParameters ): void;

}
