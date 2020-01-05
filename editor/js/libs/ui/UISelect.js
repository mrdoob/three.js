import { UIElement } from './UIElement.js';

var UISelect = function () {

	UIElement.call( this );

	var dom = document.createElement( 'select' );
	dom.className = 'Select';
	dom.style.padding = '2px';

	this.dom = dom;

	return this;

};

UISelect.prototype = Object.create( UIElement.prototype );
UISelect.prototype.constructor = UISelect;

UISelect.prototype.setMultiple = function ( boolean ) {

	this.dom.multiple = boolean;

	return this;

};

UISelect.prototype.setOptions = function ( options ) {

	var selected = this.dom.value;

	while ( this.dom.children.length > 0 ) {

		this.dom.removeChild( this.dom.firstChild );

	}

	for ( var key in options ) {

		var option = document.createElement( 'option' );
		option.value = key;
		option.innerHTML = options[ key ];
		this.dom.appendChild( option );

	}

	this.dom.value = selected;

	return this;

};

UISelect.prototype.getValue = function () {

	return this.dom.value;

};

UISelect.prototype.setValue = function ( value ) {

	value = String( value );

	if ( this.dom.value !== value ) {

		this.dom.value = value;

	}

	return this;

};

export { UISelect };