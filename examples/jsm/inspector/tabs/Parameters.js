import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { createValueSpan, info } from '../ui/utils.js';
import { ValueString, ValueNumber, ValueSlider, ValueSelect, ValueCheckbox, ValueColor, ValueButton } from '../ui/Values.js';

class ParametersGroup {

	constructor( parameters, name ) {

		this.parameters = parameters;

		this.paramList = new Item( name );
		this.paramList.setCollapsible( true );

		this.objects = [];

	}

	close() {

		this.paramList.close();

		return this;

	}

	name( name ) {

		this.paramList.setValue( 0, name );

		return this;

	}

	show() {

		this.paramList.show();

		return this;

	}

	hide() {

		this.paramList.hide();

		return this;

	}

	add( object, property, ...params ) {

		const value = object[ property ];
		const type = typeof value;

		let item = null;

		if ( typeof params[ 0 ] === 'object' ) {

			item = this.addSelect( object, property, params[ 0 ] );

		} else if ( type === 'number' ) {

			if ( params.length >= 2 ) {

				item = this.addSlider( object, property, ...params );

			} else {

				item = this.addNumber( object, property, ...params );

			}

		} else if ( type === 'boolean' ) {

			item = this.addBoolean( object, property );

		} else if ( type === 'string' ) {

			item = this.addString( object, property );

		} else if ( type === 'function' ) {

			item = this.addButton( object, property, ...params );

		}

		return item;

	}

	_addInfo( editor, itemNode ) {

		editor.info = ( text ) => {

			info( itemNode, text );
			return editor;

		};

	}

	_addParameter( object, property, editor, subItem ) {

		subItem.data[ 0 ].title = property;

		editor.name = ( name ) => {

			subItem.data[ 0 ].title = name;

			if ( subItem.data[ 0 ].childNodes.length > 0 && subItem.data[ 0 ].firstChild.nodeType === 3 /* Node.TEXT_NODE */ ) {

				subItem.data[ 0 ].firstChild.textContent = name;

			} else {

				subItem.data[ 0 ].insertBefore( document.createTextNode( name ), subItem.data[ 0 ].firstChild );

			}

			return editor;

		};

		this._addInfo( editor, subItem.data[ 0 ] );

		editor.listen = () => {

			const update = () => {

				const value = editor.getValue();
				const propertyValue = object[ property ];

				if ( value !== propertyValue ) {

					editor.setValue( propertyValue );

				}

				requestAnimationFrame( update );

			};

			requestAnimationFrame( update );

			return editor;

		};


		this._registerParameter( object, property, editor, subItem );

	}

	_registerParameter( object, property, editor, subItem ) {

		this.objects.push( { object: object, key: property, editor: editor, subItem: subItem } );

		editor.addEventListener( 'show', () => subItem.show() );
		editor.addEventListener( 'hide', () => subItem.hide() );

	}

	addString( object, property ) {

		const value = object[ property ];

		const editor = new ValueString( { value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addFolder( name ) {

		const group = new ParametersGroup( this.parameters, name );

		this.paramList.add( group.paramList );

		return group;

	}

	addBoolean( object, property ) {

		const value = object[ property ];

		const editor = new ValueCheckbox( { value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		// extends logic to toggle checkbox when clicking on the row

		const itemRow = subItem.domElement.firstChild;

		itemRow.classList.add( 'actionable' );
		itemRow.addEventListener( 'click', ( e ) => {

			if ( e.target.closest( 'label' ) ) return;

			const checkbox = itemRow.querySelector( 'input[type="checkbox"]' );

			if ( checkbox ) {

				checkbox.checked = ! checkbox.checked;
				checkbox.dispatchEvent( new Event( 'change' ) );

			}

		} );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addSelect( object, property, options ) {

		const value = object[ property ];

		const editor = new ValueSelect( { options, value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addColor( object, property ) {

		const value = object[ property ];

		const editor = new ValueColor( { value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addSlider( object, property, min = 0, max = 1, step = 0.01 ) {

		const value = object[ property ];

		const editor = new ValueSlider( { value, min, max, step } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addNumber( object, property, ...params ) {

		const value = object[ property ];
		const [ min, max ] = params;

		const editor = new ValueNumber( { value, min, max } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addButton( object, property ) {

		const value = object[ property ];

		const editor = new ValueButton( { text: property, value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const subItem = new Item( editor.domElement );
		subItem.itemRow.childNodes[ 0 ].style.gridColumn = '1 / -1';
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		editor.name = ( name ) => {

			const buttonNode = editor.domElement.childNodes[ 0 ];

			if ( buttonNode.childNodes.length > 0 && buttonNode.firstChild.nodeType === 3 /* Node.TEXT_NODE */ ) {

				buttonNode.firstChild.textContent = name;

			} else {

				buttonNode.insertBefore( document.createTextNode( name ), buttonNode.firstChild );

			}

			return editor;

		};

		this._addInfo( editor, editor.domElement.childNodes[ 0 ] );

		this._registerParameter( object, property, editor, subItem );

		return editor;

	}

}

class Parameters extends Tab {

	constructor( options = {} ) {

		super( options.name || 'Parameters', options );

		const paramList = new List( 'Property', 'Value' );
		paramList.domElement.classList.add( 'parameters' );
		paramList.setGridStyle( 'minmax(0, .5fr) minmax(0, 1fr)' );
		paramList.domElement.style.minWidth = '300px';

		this.filterText = '';
		this.openStates = null;

		if ( options.filter !== false ) this.buildHeader();

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( paramList.domElement );
		this.content.appendChild( scrollWrapper );

		this.paramList = paramList;

		this.groups = [];

	}

	buildHeader() {

		const header = document.createElement( 'div' );
		header.className = 'toolbar';

		const filterInput = document.createElement( 'input' );
		filterInput.type = 'text';
		filterInput.className = 'parameters-filter-input';
		filterInput.placeholder = 'Filter...';
		filterInput.addEventListener( 'input', ( e ) => {

			this.filterText = e.target.value.trim().toLowerCase();
			this.applyFilter();

		} );

		header.appendChild( filterInput );
		this.content.appendChild( header );

	}

	applyFilter() {

		const items = this.groups.map( group => group.paramList );

		// open states of the folders, restored when the filter is cleared

		if ( this.filterText !== '' && this.openStates === null ) {

			this.openStates = new Map();

			for ( const item of items ) this._traverse( item, child => this.openStates.set( child, child.isOpen ) );

		}

		for ( const item of items ) this._filterItem( item, false );

		if ( this.filterText === '' && this.openStates !== null ) {

			for ( const [ item, isOpen ] of this.openStates ) {

				if ( item.isOpen !== isOpen ) item.toggle();

			}

			this.openStates = null;

		}

	}

	_filterItem( item, parentMatch ) {

		// items hidden by the app stay hidden

		if ( item.domElement.style.display === 'none' ) return false;

		const label = item.data[ 0 ];
		const name = typeof label === 'string' ? label : label.title || label.textContent;

		const match = parentMatch || name.toLowerCase().includes( this.filterText );

		let childMatch = false;

		for ( const child of item.children ) {

			if ( this._filterItem( child, match ) ) childMatch = true;

		}

		if ( childMatch && this.filterText !== '' && item.isOpen === false ) item.toggle();

		const visible = match || childMatch;

		item.domElement.classList.toggle( 'hidden', ! visible );

		return visible;

	}

	_traverse( item, callback ) {

		callback( item );

		for ( const child of item.children ) this._traverse( child, callback );

	}

	createGroup( name ) {

		const group = new ParametersGroup( this, name );

		this.paramList.add( group.paramList );
		this.groups.push( group );

		return group;

	}

}

export { Parameters };
