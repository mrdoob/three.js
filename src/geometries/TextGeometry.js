/**
 * Text = 3D Text
 *
 * parameters = {
 *  font: <THREE.Font>, // font
 *
 *  size: <float>, // size of the text
 *  height: <float>, // thickness to extrude text
 *  curveSegments: <int>, // number of points on the curves
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into text bevel goes
 *  bevelSize: <float>, // how far from text outline (including bevelOffset) is bevel
 *  bevelOffset: <float> // how far from text outline does bevel start
 * }
 */

import { Geometry } from '../core/Geometry.js';
import { TextBufferGeometry } from './TextBufferGeometry.js';

class TextGeometry extends Geometry {

	constructor( text, parameters ) {

		super();
		this.type = 'TextGeometry';

		this.parameters = {
			text: text,
			parameters: parameters
		};

		this.fromBufferGeometry( new TextBufferGeometry( text, parameters ) );
		this.mergeVertices();

	}

}

export { TextGeometry };
