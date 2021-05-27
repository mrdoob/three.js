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

import { BufferGeometry } from '../core/BufferGeometry.js';
import { ExtrudeGeometry } from './ExtrudeGeometry.js';

class TextGeometry extends ExtrudeGeometry {

	constructor( text, options = {} ) {

		const font = options.font;

		if ( ! ( font && font.isFont ) ) {

			console.error( 'THREE.TextGeometry: font parameter is not an instance of THREE.Font.' );
			return new BufferGeometry();

		}

		const shapes = font.generateShapes( text, options.size );

		// translate parameters to ExtrudeGeometry API

		options.depth = options.height !== undefined ? options.height : 50;

		// defaults

		if ( options.bevelThickness === undefined ) options.bevelThickness = 10;
		if ( options.bevelSize === undefined ) options.bevelSize = 8;
		if ( options.bevelEnabled === undefined ) options.bevelEnabled = false;

		super( shapes, options );

		this.type = 'TextGeometry';

		this.parameters = {
			text: text,
			font: font, // store font in parameters so it can be easier processed in Object3D.toJSON() (need to remove it in TextGeometry.toJSON() again)
			options: options
		};

	}

	toJSON() {

		const data = super.toJSON();

		delete data.font;
		data.options.font = this.parameters.font.uuid;

		return data;

	}

}


export { TextGeometry, TextGeometry as TextBufferGeometry };
