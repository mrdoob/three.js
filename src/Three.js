/**
 * @author mr.doob / http://mrdoob.com/
 */

var THREE = THREE || {};

if ( ! self.Int32Array ) {

	self.Int32Array = Array;
	self.Float32Array = Array;

}

// Provides requestAnimationFrame in a cross browser way.
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/

if ( ! self.requestAnimationFrame ) {

	self.requestAnimationFrame = ( function () {

		return self.webkitRequestAnimationFrame ||
		self.mozRequestAnimationFrame ||
		self.oRequestAnimationFrame ||
		self.msRequestAnimationFrame ||
		function ( callback, element ) {

			self.setTimeout( callback, 1000 / 60 );

		};

	} )();

}
