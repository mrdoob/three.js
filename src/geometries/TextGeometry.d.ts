import { Font } from './../extras/core/Font';
import { Geometry } from './../core/Geometry';
import { TextGeometryParameters } from './TextBufferGeometry';

export class TextGeometry extends Geometry {

	constructor( text: string, parameters: TextGeometryParameters );

	/**
	 * @default 'TextGeometry'
	 */
	type: string;

	parameters: {
		font: Font;
		size: number;
		/**
		 * @default 50
		 */
		height: number;
		curveSegments: number;
		/**
		 * @default false
		 */
		bevelEnabled: boolean;
		/**
		 * @default 10
		 */
		bevelThickness: number;
		/**
		 * @default 8
		 */
		bevelSize: number;
		bevelOffset: number;
		bevelSegments: number;
	};

}
