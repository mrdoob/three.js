import { UIElement } from './UIElement.js';

var UIDiv = function () {

	UIElement.call( this );

	this.dom = document.createElement( 'div' );

	return this;

};

UIDiv.prototype = Object.create( UIElement.prototype );
UIDiv.prototype.constructor = UIDiv;

export { UIDiv };