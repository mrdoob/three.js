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

	},

	copy: function ( source ) {

		this.x = source.x;
		this.y = source.y;
		this.width = source.width;
		this.height = source.height;

		return this;

	},

	equals: function ( rectangle ) {

		return this.x === rectangle.x && this.y === rectangle.y && this.width === rectangle.width && this.height === rectangle.height;

	}

};
