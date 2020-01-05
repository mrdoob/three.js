import { UIElement } from './UIElement.js';
import { UIText } from './UIText.js';
import { UIDiv } from './UIDiv.js';

var UITabbedPanel = function ( ) {

	UIElement.call( this );

	var dom = document.createElement( 'div' );

	this.dom = dom;

	this.setClass( 'TabbedPanel' );

	this.tabs = [];
	this.panels = [];

	this.tabsDiv = new UIDiv();
	this.tabsDiv.setClass( 'Tabs' );

	this.panelsDiv = new UIDiv();
	this.panelsDiv.setClass( 'Panels' );

	this.add( this.tabsDiv );
	this.add( this.panelsDiv );

	this.selected = '';

	return this;

};

UITabbedPanel.prototype = Object.create( UIElement.prototype );
UITabbedPanel.prototype.constructor = UITabbedPanel;

UITabbedPanel.prototype.select = function ( id ) {

	var tab;
	var panel;
	var scope = this;

	// Deselect current selection
	if ( this.selected && this.selected.length ) {

		tab = this.tabs.find( function ( item ) {

			return item.dom.id === scope.selected;

		} );
		panel = this.panels.find( function ( item ) {

			return item.dom.id === scope.selected;

		} );

		if ( tab ) {

			tab.removeClass( 'selected' );

		}

		if ( panel ) {

			panel.setDisplay( 'none' );

		}

	}

	tab = this.tabs.find( function ( item ) {

		return item.dom.id === id;

	} );
	panel = this.panels.find( function ( item ) {

		return item.dom.id === id;

	} );

	if ( tab ) {

		tab.addClass( 'selected' );

	}

	if ( panel ) {

		panel.setDisplay( '' );

	}

	this.selected = id;

	return this;

};

UITabbedPanel.prototype.addTab = function ( id, label, items ) {

	var tab = new Tab( label, this );
	tab.setId( id );
	this.tabs.push( tab );
	this.tabsDiv.add( tab );

	var panel = new UIDiv();
	panel.setId( id );
	panel.add( items );
	panel.setDisplay( 'none' );
	this.panels.push( panel );
	this.panelsDiv.add( panel );

	this.select( id );

};

var Tab = function ( text, parent ) {

	UIText.call( this, text );
	this.parent = parent;

	this.setClass( 'Tab' );

	var scope = this;

	this.dom.addEventListener( 'click', function () {

		scope.parent.select( scope.dom.id );

	} );

	return this;

};

Tab.prototype = Object.create( UIText.prototype );
Tab.prototype.constructor = Tab;

export { UITabbedPanel };