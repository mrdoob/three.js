/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */
import * as THREE from '../../../build/three.module.js';
import { LineGeometry } from '../../modules/lines/LineGeometry.js';
import { LineMaterial } from '../../modules/lines/LineMaterial.js';
import { LineSegments2 } from '../../modules/lines/LineSegments2.js';
var __Line2;

__Line2 = function ( geometry, material ) {

	LineSegments2.call( this );

	this.type = 'Line2';

	this.geometry = geometry !== undefined ? geometry : new LineGeometry();
	this.material = material !== undefined ? material : new LineMaterial( { color: Math.random() * 0xffffff } );

};

__Line2.prototype = Object.assign( Object.create( LineSegments2.prototype ), {

	constructor: __Line2,

	isLine2: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );

export { __Line2 as Line2 };
