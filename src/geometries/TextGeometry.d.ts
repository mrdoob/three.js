import { Font } from './../extras/core/Font';
import { ExtrudeGeometry } from './ExtrudeGeometry';

export interface TextGeometryParameters {
	font: Font;
	size?: number;
	height?: number;
	curveSegments?: number;
	bevelEnabled?: boolean;
	bevelThickness?: number;
	bevelSize?: number;
	bevelOffset?: number;
	bevelSegments?: number;
}

export class TextGeometry extends ExtrudeGeometry {

	/**
	 * @default 'TextGeometry'
	 */
	type: string;

	constructor( text: string, parameters: TextGeometryParameters );

	parameters: {
		font: Font;
		size: number;
		height: number;
		curveSegments: number;
		bevelEnabled: boolean;
		bevelThickness: number;
		bevelSize: number;
		bevelOffset: number;
		bevelSegments: number;
	};

}

export { TextGeometry as TextBufferGeometry };
