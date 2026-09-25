export class Item {

	constructor( ...data ) {

		this.children = [];
		this.isOpen = true;
		this.isCollapsible = false;
		this.childrenContainer = null;
		this.parent = null;
		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'list-item-wrapper';
		this.itemRow = document.createElement( 'div' );
		this.itemRow.className = 'list-item-row';

		this.userData = {};

		this.data = [];
		data.forEach( ( cellData, index ) => {

			const cell = document.createElement( 'div' );
			cell.className = 'list-item-cell';
			this.itemRow.appendChild( cell );

			this.setValue( index, cellData );

		} );

		this.domElement.appendChild( this.itemRow );

		// Bindings

		this.onItemClick = this.onItemClick.bind( this );

	}

	onItemClick( e ) {

		if ( e.target.closest( 'button, a, input, label' ) ) return;

		this.toggle();

	}

	add( item, index = this.children.length ) {

		if ( item.parent !== null ) {

			item.parent.remove( item );

		}

		item.parent = this;

		this.children.splice( index, 0, item );

		this.itemRow.classList.add( 'collapsible' );

		if ( ! this.childrenContainer ) {

			this.childrenContainer = document.createElement( 'div' );
			this.childrenContainer.className = 'list-children-container';
			this.childrenContainer.classList.toggle( 'closed', ! this.isOpen );
			this.domElement.appendChild( this.childrenContainer );
			this.itemRow.addEventListener( 'click', this.onItemClick );

		}

		this.childrenContainer.insertBefore(
			item.domElement,
			this.childrenContainer.children[ index ] || null
		);

		this.updateToggler();
		return this;

	}

	remove( item ) {

		const index = this.children.indexOf( item );

		if ( index !== - 1 ) {

			this.children.splice( index, 1 );
			this.childrenContainer.removeChild( item.domElement );

			item.parent = null;

			if ( this.children.length === 0 ) {

				this.itemRow.classList.remove( 'collapsible' );
				this.itemRow.removeEventListener( 'click', this.onItemClick );

				this.childrenContainer.remove();
				this.childrenContainer = null;

			}

			this.updateToggler();

		}

		return this;

	}

	updateToggler() {

		const firstCell = this.itemRow.querySelector( '.list-item-cell:first-child' );
		let toggler = this.itemRow.querySelector( '.item-toggler' );

		if ( this.children.length > 0 || this.isCollapsible ) {

			if ( ! toggler ) {

				toggler = document.createElement( 'span' );
				toggler.className = 'item-toggler';
				firstCell.prepend( toggler );

			}

			if ( this.isOpen ) {

				this.itemRow.classList.add( 'open' );

			}

		} else if ( toggler ) {

			toggler.remove();

		}

	}

	setCollapsible( collapsible ) {

		this.isCollapsible = collapsible;

		if ( collapsible ) {

			this.itemRow.classList.add( 'collapsible' );

			if ( ! this.childrenContainer ) {

				this.childrenContainer = document.createElement( 'div' );
				this.childrenContainer.className = 'list-children-container';
				this.childrenContainer.classList.toggle( 'closed', ! this.isOpen );
				this.domElement.appendChild( this.childrenContainer );
				this.itemRow.addEventListener( 'click', this.onItemClick );

			}

		} else {

			this.itemRow.classList.remove( 'collapsible' );

		}

		this.updateToggler();

		return this;

	}

	toggle() {

		this.isOpen = ! this.isOpen;
		this.itemRow.classList.toggle( 'open', this.isOpen );

		if ( this.childrenContainer ) {

			this.childrenContainer.classList.toggle( 'closed', ! this.isOpen );

		}

		return this;

	}

	close() {

		if ( this.isOpen ) {

			this.toggle();

		}

		return this;

	}

	show() {

		this.domElement.style.display = '';

		return this;

	}

	hide() {

		this.domElement.style.display = 'none';

		return this;

	}

	setValue( index, value ) {

		this.data[ index ] = value;

		const cell = this.itemRow.children[ index ];

		if ( cell ) {

			const toggler = cell.querySelector( '.item-toggler' );

			cell.innerHTML = '';

			if ( toggler ) {

				cell.appendChild( toggler );

			}

			if ( value instanceof HTMLElement ) {

				cell.appendChild( value );

			} else {

				cell.append( String( value ) );

			}

		}

		return this;

	}

	getValue( index ) {

		return this.data[ index ];

	}

}
