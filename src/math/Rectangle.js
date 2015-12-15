/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Rectangle = function ( x, y, width, height ) {

	this.set( x, y, width, height );

};

THREE.Rectangle.prototype = {

	constructor: THREE.Rectangle,

	set: function ( x, y, width, height ) {

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		return this;

	}

};
