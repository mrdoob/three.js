import { UIElement } from './UIElement.js';

var UIBreak = function () {

	UIElement.call( this );

	var dom = document.createElement( 'br' );
	dom.className = 'Break';

	this.dom = dom;

	return this;

};

UIBreak.prototype = Object.create( UIElement.prototype );
UIBreak.prototype.constructor = UIBreak;

export { UIBreak };