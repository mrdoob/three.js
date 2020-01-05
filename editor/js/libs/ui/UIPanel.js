import { UIElement } from './UIElement.js';

var UIPanel = function () {

	UIElement.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Panel';

	this.dom = dom;

	return this;

};

UIPanel.prototype = Object.create( UIElement.prototype );
UIPanel.prototype.constructor = UIPanel;

export { UIPanel };