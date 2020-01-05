import { UIElement } from './UIElement.js';

var UIColor = function () {

	UIElement.call( this );

	var dom = document.createElement( 'input' );
	dom.className = 'Color';
	dom.style.width = '64px';
	dom.style.height = '17px';
	dom.style.border = '0px';
	dom.style.padding = '2px';
	dom.style.backgroundColor = 'transparent';

	try {

		dom.type = 'color';
		dom.value = '#ffffff';

	} catch ( exception ) {}

	this.dom = dom;

	return this;

};

UIColor.prototype = Object.create( UIElement.prototype );
UIColor.prototype.constructor = UIColor;

UIColor.prototype.getValue = function () {

	return this.dom.value;

};

UIColor.prototype.getHexValue = function () {

	return parseInt( this.dom.value.substr( 1 ), 16 );

};

UIColor.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UIColor.prototype.setHexValue = function ( hex ) {

	this.dom.value = '#' + ( '000000' + hex.toString( 16 ) ).slice( - 6 );

	return this;

};

export { UIColor };