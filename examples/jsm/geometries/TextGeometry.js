/**
 * Text = 3D Text
 *
 * parameters = {
 *  font: <THREE.Font>, // font
 *
 *  size: <float>, // size of the text
 *  depth: <float>, // thickness to extrude text
 *  curveSegments: <int>, // number of points on the curves
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into text bevel goes
 *  bevelSize: <float>, // how far from text outline (including bevelOffset) is bevel
 *  bevelOffset: <float> // how far from text outline does bevel start
 * }
 */

import { Font } from '../loaders/FontLoader.js';
import {
	ExtrudeGeometry
} from 'three';

class TextGeometry extends ExtrudeGeometry {

	constructor( text, parameters = {} ) {

		const font = parameters.font;

		if ( font === undefined ) {

			super(); // generate default extrude geometry

		} else {

			const shapes = font.generateShapes( text, parameters.size );

			// translate parameters to ExtrudeGeometry API

			if ( parameters.depth === undefined && parameters.height !== undefined ) {

				console.warn( 'THREE.TextGeometry: .height is now depreciated. Please use .depth instead' ); // @deprecated, r163

			}

			parameters.depth = parameters.depth !== undefined ?
				parameters.depth : parameters.height !== undefined ?
					parameters.height : 50;

			// defaults

			if ( parameters.bevelThickness === undefined ) parameters.bevelThickness = 10;
			if ( parameters.bevelSize === undefined ) parameters.bevelSize = 8;
			if ( parameters.bevelEnabled === undefined ) parameters.bevelEnabled = false;

			super( shapes, parameters );

			// for conversion of font to object units (ie. px -> m)

			const scale = parameters.scale;

			if ( scale !== undefined ) {

				this.computeBoundingBox();
				this.scale( scale, scale, scale );

			}

		}

		this.type = 'TextGeometry';

	}

	toJSON() {

		const data = super.toJSON();
		return data;

	}

	static fromJSON( data ) {

		const options = data.options;

		options.font = new Font( options.font.data );
		return new TextGeometry( options.text, options );

	}

}


export { TextGeometry };
