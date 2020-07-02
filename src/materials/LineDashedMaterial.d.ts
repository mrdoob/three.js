import { LineBasicMaterial, LineBasicMaterialParameters } from './LineBasicMaterial';

export interface LineDashedMaterialParameters extends LineBasicMaterialParameters {
	scale?: number;
	dashSize?: number;
	gapSize?: number;
}

export class LineDashedMaterial extends LineBasicMaterial {

	constructor( parameters?: LineDashedMaterialParameters );

	scale: number;
	dashSize: number;
	gapSize: number;
	readonly isLineDashedMaterial: true;

	setValues( parameters: LineDashedMaterialParameters ): void;

}
