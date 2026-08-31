class HistoryManager {

	constructor( tour ) {

		this.tour = tour;
		this.history = [];
		this.index = - 1;
		this.isUndoRedoAction = false;
		this.limit = 50;

	}

	pushState( hash ) {

		if ( this.isUndoRedoAction ) {

			this.isUndoRedoAction = false;
			return;

		}

		if ( this.index < this.history.length - 1 ) {

			this.history = this.history.slice( 0, this.index + 1 );

		}

		if ( this.history[ this.index ] !== hash ) {

			this.history.push( hash );
			if ( this.history.length > this.limit ) {

				this.history.shift();

			}

			this.index = this.history.length - 1;

		}

		this.updateButtons();

	}

	undo() {

		if ( this.index > 0 ) {

			this.index --;
			this.isUndoRedoAction = true;
			window.location.hash = this.history[ this.index ];
			this.updateButtons();

		}

	}

	redo() {

		if ( this.index < this.history.length - 1 ) {

			this.index ++;
			this.isUndoRedoAction = true;
			window.location.hash = this.history[ this.index ];
			this.updateButtons();

		}

	}

	updateButtons() {

		const undoBtn = this.tour.dom.tabsBar.querySelector( '.playground-undo-btn' );
		const redoBtn = this.tour.dom.tabsBar.querySelector( '.playground-redo-btn' );

		if ( undoBtn ) {

			undoBtn.disabled = this.index <= 0;

		}

		if ( redoBtn ) {

			redoBtn.disabled = this.index >= this.history.length - 1;

		}

	}

}

export { HistoryManager };
