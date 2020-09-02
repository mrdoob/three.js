import { LineBasicMaterial, LineBasicMaterialParameters } from './LineBasicMaterial';

export interface LineDashedMaterialParameters extends LineBasicMaterialParameters {
	scale?: number;
	dashSize?: number;
	gapSize?: number;
}

export class LineDashedMaterial extends LineBasicMaterial {

	constructor( parameters?: LineDashedMaterialParameters );

	/**
	 * @default 'LineDashedMaterial'
	 */
	type: string;

	/**
	 * @default 1
	 */
	scale: number;

	/**
	 * @default 1
	 */
	dashSize: number;

	/**
	 * @default 1
	 */
	gapSize: number;
	readonly isLineDashedMaterial: true;

	setValues( parameters: LineDashedMaterialParameters ): void;

}
