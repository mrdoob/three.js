import {
  WireframeGeometry
} from '../../../build/three.module.js';
import {
  LineSegmentsGeometry
} from '../LineSegmentsGeometry.js';
/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

var WireframeGeometry2 = function ( geometry ) {

	LineSegmentsGeometry.call( this );

	this.type = 'WireframeGeometry2';

	this.fromWireframeGeometry( new WireframeGeometry( geometry ) );

	// set colors, maybe

};

WireframeGeometry2.prototype = Object.assign( Object.create( LineSegmentsGeometry.prototype ), {

	constructor: WireframeGeometry2,

	isWireframeGeometry2: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );

export {
  WireframeGeometry2
};