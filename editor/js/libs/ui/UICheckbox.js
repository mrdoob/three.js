import { UIElement } from './UIElement.js';

var UICheckbox = function ( boolean ) {

	UIElement.call( this );

	var dom = document.createElement( 'input' );
	dom.className = 'Checkbox';
	dom.type = 'checkbox';

	this.dom = dom;
	this.setValue( boolean );

	return this;

};

UICheckbox.prototype = Object.create( UIElement.prototype );
UICheckbox.prototype.constructor = UICheckbox;

UICheckbox.prototype.getValue = function () {

	return this.dom.checked;

};

UICheckbox.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.checked = value;

	}

	return this;

};

export { UICheckbox };