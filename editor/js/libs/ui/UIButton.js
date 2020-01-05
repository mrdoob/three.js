import { UIElement } from './UIElement.js';

var UIButton = function ( value ) {

	UIElement.call( this );

	var dom = document.createElement( 'button' );
	dom.className = 'Button';

	this.dom = dom;
	this.dom.textContent = value;

	return this;

};

UIButton.prototype = Object.create( UIElement.prototype );
UIButton.prototype.constructor = UIButton;

UIButton.prototype.setLabel = function ( value ) {

	this.dom.textContent = value;

	return this;

};

export { UIButton };