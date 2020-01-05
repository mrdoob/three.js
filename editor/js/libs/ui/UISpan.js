import { UIElement } from './UIElement.js';

var UISpan = function () {

	UIElement.call( this );

	this.dom = document.createElement( 'span' );

	return this;

};

UISpan.prototype = Object.create( UIElement.prototype );
UISpan.prototype.constructor = UISpan;

export { UISpan };