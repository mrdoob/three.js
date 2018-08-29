/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */
import * as THREE from '../../../build/three.module.js';
import { LineSegmentsGeometry } from '../../modules/lines/LineSegmentsGeometry.js';
var __WireframeGeometry2;

__WireframeGeometry2 = function ( geometry ) {

	LineSegmentsGeometry.call( this );

	this.type = 'WireframeGeometry2';

	this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) );

	// set colors, maybe

};

__WireframeGeometry2.prototype = Object.assign( Object.create( LineSegmentsGeometry.prototype ), {

	constructor: __WireframeGeometry2,

	isWireframeGeometry2: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );

export { __WireframeGeometry2 as WireframeGeometry2 };
