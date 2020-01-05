import { UIElement } from './UIElement.js';

var UIRow = function () {

	UIElement.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Row';

	this.dom = dom;

	return this;

};

UIRow.prototype = Object.create( UIElement.prototype );
UIRow.prototype.constructor = UIRow;

export { UIRow };