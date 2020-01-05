import { UIElement } from './UIElement.js';

var UIListbox = function ( ) {

	UIElement.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Listbox';
	dom.tabIndex = 0;

	this.dom = dom;
	this.items = [];
	this.listitems = [];
	this.selectedIndex = 0;
	this.selectedValue = null;

	return this;

};

UIListbox.prototype = Object.create( UIElement.prototype );
UIListbox.prototype.constructor = UIListbox;

UIListbox.prototype.setItems = function ( items ) {

	if ( Array.isArray( items ) ) {

		this.items = items;

	}

	this.render();

};

UIListbox.prototype.render = function ( ) {

	while ( this.listitems.length ) {

		var item = this.listitems[ 0 ];

		item.dom.remove();

		this.listitems.splice( 0, 1 );

	}

	for ( var i = 0; i < this.items.length; i ++ ) {

		var item = this.items[ i ];

		var listitem = new ListboxItem( this );
		listitem.setId( item.id || `Listbox-${i}` );
		listitem.setTextContent( item.name || item.type );
		this.add( listitem );

	}

};

// Assuming user passes valid list items
UIListbox.prototype.add = function () {

	var items = Array.from( arguments );

	this.listitems = this.listitems.concat( items );

	UIElement.prototype.add.apply( this, items );

};

UIListbox.prototype.selectIndex = function ( index ) {

	if ( index >= 0 && index < this.items.length ) {

		this.setValue( this.listitems[ index ].getId() );

	}

	this.selectedIndex = index;

};

UIListbox.prototype.getValue = function () {

	return this.selectedValue;

};

UIListbox.prototype.setValue = function ( value ) {

	for ( var i = 0; i < this.listitems.length; i ++ ) {

		var element = this.listitems[ i ];

		if ( element.getId() === value ) {

			element.addClass( 'active' );

		} else {

			element.removeClass( 'active' );

		}

	}

	this.selectedValue = value;

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );
	this.dom.dispatchEvent( changeEvent );

};

// Listbox Item
var ListboxItem = function ( parent ) {

	UIElement.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'ListboxItem';

	this.parent = parent;
	this.dom = dom;

	var scope = this;

	function onClick() {

		if ( scope.parent ) {

			scope.parent.setValue( scope.getId( ) );

		}

	}

	dom.addEventListener( 'click', onClick, false );

	return this;

};

ListboxItem.prototype = Object.create( UIElement.prototype );
ListboxItem.prototype.constructor = ListboxItem;

export { UIListbox };