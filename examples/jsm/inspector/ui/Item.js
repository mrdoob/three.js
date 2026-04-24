export class Item {

	constructor( ...data ) {

		this.children = [];
		this.isOpen = true;
		this.childrenContainer = null;
		this.parent = null;
		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'list-item-wrapper';
		this.itemRow = document.createElement( 'div' );
		this.itemRow.className = 'list-item-row';

		this.userData = {};

		this.data = data;
		this.data.forEach( ( cellData ) => {

			const cell = document.createElement( 'div' );
			cell.className = 'list-item-cell';
			if ( cellData instanceof HTMLElement ) {

				cell.appendChild( cellData );

			} else {

				cell.append( String( cellData ) );

			}

			this.itemRow.appendChild( cell );

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

		if ( this.children.length > 0 ) {

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

}
