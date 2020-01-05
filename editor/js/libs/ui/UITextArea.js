import { UIElement } from './UIElement.js';

var UITextArea = function () {

	UIElement.call( this );

	var dom = document.createElement( 'textarea' );
	dom.className = 'TextArea';
	dom.style.padding = '2px';
	dom.spellcheck = false;

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

		if ( event.keyCode === 9 ) {

			event.preventDefault();

			var cursor = dom.selectionStart;

			dom.value = dom.value.substring( 0, cursor ) + '\t' + dom.value.substring( cursor );
			dom.selectionStart = cursor + 1;
			dom.selectionEnd = dom.selectionStart;

		}

	}, false );

	this.dom = dom;

	return this;

};

UITextArea.prototype = Object.create( UIElement.prototype );
UITextArea.prototype.constructor = UITextArea;

UITextArea.prototype.getValue = function () {

	return this.dom.value;

};

UITextArea.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

export { UITextArea };