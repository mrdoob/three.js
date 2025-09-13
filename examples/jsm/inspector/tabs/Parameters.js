import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { createValueSpan } from '../ui/utils.js';
import { ValueNumber, ValueSlider, ValueSelect, ValueCheckbox } from '../ui/Values.js';

class ParametersGroup {

	constructor( parameters, name ) {

		this.parameters = parameters;
		this.name = name;

		this.item = new Item( name );

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

		}

		return item;

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
		this.item.add( subItem );

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

		editor.name = ( name ) => description.textContent = name;

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
		this.item.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		editor.name = ( name ) => description.textContent = name;

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
		this.item.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		editor.name = ( name ) => description.textContent = name;

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
		this.item.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		editor.name = ( name ) => description.textContent = name;

		return editor;

	}

}

class Parameters extends Tab {

	constructor() {

		super( 'Parameters' );

		const paramList = new List( 'Property', 'Value' );
		paramList.domElement.classList.add( 'parameters' );
		paramList.setGridStyle( '.5fr 1fr' );
		paramList.domElement.style.minWidth = '300px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( paramList.domElement );
		this.content.appendChild( scrollWrapper );

		this.paramList = paramList;

	}

	createGroup( name ) {

		const group = new ParametersGroup( this.parameters, name );

		this.paramList.add( group.item );

		return group;

	}

}

export { Parameters };
