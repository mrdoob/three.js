import { UIElement } from './UIElement.js';

var UIHorizontalRule = function () {

	UIElement.call( this );

	var dom = document.createElement( 'hr' );
	dom.className = 'HorizontalRule';

	this.dom = dom;

	return this;

};

UIHorizontalRule.prototype = Object.create( UIElement.prototype );
UIHorizontalRule.prototype.constructor = UIHorizontalRule;

export { UIHorizontalRule };