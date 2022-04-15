class SelectPlugin {

	constructor( editor ) {

		this.editor = editor;
		this.config = editor.config;
		this.signals = editor.signals;
		this.selected = null;
		this.disabled = false;

		// signals

		const signals = editor.signals;
		signals.intersects.add( ( intersects ) => {

			console.log( 'SelectPlugin intersects: ', intersects );

			if ( intersects.length > 0 ) {

				const object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					this.select( object.userData.object );

				} else {

					this.select( object );

				}

			} else {

				this.select( null );

			}

		} );

	}

	select( object ) {

		if ( this.disabled === true ) return;

		if ( this.selected === object ) return;

		var uuid = null;

		if ( object !== null ) {

			uuid = object.uuid;

		}

		this.selected = object;

		this.config.setKey( 'selected', uuid );
		this.signals.objectSelected.dispatch( object );

	}

	deselect() {

		this.select( null );

	}

}

export { SelectPlugin };
