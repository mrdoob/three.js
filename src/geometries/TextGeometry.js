import { Geometry } from '../core/Geometry.js';
import { ExtrudeBufferGeometry } from './ExtrudeGeometry.js';

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

// TextGeometry

function TextGeometry( text, parameters ) {

	Geometry.call( this );

	this.type = 'TextGeometry';

	this.parameters = {
		text: text,
		parameters: parameters
	};

	this.fromBufferGeometry( new TextBufferGeometry( text, parameters ) );
	this.mergeVertices();

}

TextGeometry.prototype = Object.create( Geometry.prototype );
TextGeometry.prototype.constructor = TextGeometry;

// TextBufferGeometry

function TextBufferGeometry( text, parameters ) {

	parameters = parameters || {};

	const font = parameters.font;

	if ( ! ( font && font.isFont ) ) {

		console.error( 'THREE.TextGeometry: font parameter is not an instance of THREE.Font.' );
		return new Geometry();

	}

	const shapes = font.generateShapes( text, parameters.size );

	// translate parameters to ExtrudeGeometry API

	parameters.depth = parameters.height !== undefined ? parameters.height : 50;

	// defaults

	if ( parameters.bevelThickness === undefined ) parameters.bevelThickness = 10;
	if ( parameters.bevelSize === undefined ) parameters.bevelSize = 8;
	if ( parameters.bevelEnabled === undefined ) parameters.bevelEnabled = false;

	ExtrudeBufferGeometry.call( this, shapes, parameters );

	this.type = 'TextBufferGeometry';

}

TextBufferGeometry.prototype = Object.create( ExtrudeBufferGeometry.prototype );
TextBufferGeometry.prototype.constructor = TextBufferGeometry;


export { TextGeometry, TextBufferGeometry };
