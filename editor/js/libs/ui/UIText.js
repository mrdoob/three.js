import { UIElement } from './UIElement.js';

var UIText = function ( text ) {

	UIElement.call( this );

	var dom = document.createElement( 'span' );
	dom.className = 'Text';
	dom.style.cursor = 'default';
	dom.style.display = 'inline-block';
	dom.style.verticalAlign = 'middle';

	this.dom = dom;
	this.setValue( text );

	return this;

};

UIText.prototype = Object.create( UIElement.prototype );
UIText.prototype.constructor = UIText;

UIText.prototype.getValue = function () {

	return this.dom.textContent;

};

UIText.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.textContent = value;

	}

	return this;

};

export { UIText };