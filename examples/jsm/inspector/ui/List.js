
export class List {

	constructor( ...headers ) {

		this.headers = headers;
		this.children = [];
		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'list-container';
		this.domElement.style.padding = '10px';
		this.id = `list-${Math.random().toString( 36 ).substr( 2, 9 )}`;
		this.domElement.dataset.listId = this.id;

		this.gridStyleElement = document.createElement( 'style' );
		this.domElement.appendChild( this.gridStyleElement );

		const headerRow = document.createElement( 'div' );
		headerRow.className = 'list-header';
		this.headers.forEach( headerText => {

			const headerCell = document.createElement( 'div' );
			headerCell.className = 'list-header-cell';
			headerCell.textContent = headerText;
			headerRow.appendChild( headerCell );

		} );
		this.domElement.appendChild( headerRow );

	}

	setGridStyle( gridTemplate ) {

		this.gridStyleElement.textContent = `
[data-list-id="${this.id}"] > .list-header,
[data-list-id="${this.id}"] .list-item-row {
	grid-template-columns: ${gridTemplate};
}
`;

	}

	add( item ) {

		if ( item.parent !== null ) {

			item.parent.remove( item );

		}

		item.domElement.classList.add( 'header-wrapper', 'section-start' );
		item.parent = this;

		this.children.push( item );
		this.domElement.appendChild( item.domElement );

	}

	remove( item ) {

		const index = this.children.indexOf( item );

		if ( index !== - 1 ) {

			this.children.splice( index, 1 );
			this.domElement.removeChild( item.domElement );

			item.parent = null;

		}

		return this;

	}

}
