import { UIElement } from './UIElement.js';

var UIInput = function ( text ) {

	UIElement.call( this );

	var dom = document.createElement( 'input' );
	dom.className = 'Input';
	dom.style.padding = '2px';
	dom.style.border = '1px solid transparent';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	}, false );

	this.dom = dom;
	this.setValue( text );

	return this;

};

UIInput.prototype = Object.create( UIElement.prototype );
UIInput.prototype.constructor = UIInput;

UIInput.prototype.getValue = function () {

	return this.dom.value;

};

UIInput.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

export { UIInput };