import { UINumber, UIRow, UIText } from './libs/ui.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

function SidebarMaterialNumberProperty( editor, property, name, range = [ - Infinity, Infinity ] ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const number = new UINumber().setWidth( '60px' ).setRange( range[ 0 ], range[ 1 ] ).onChange( onChange );
	container.add( number );

	let object = null;
	let material = null;

	function onChange() {

		if ( material[ property ] !== number.getValue() ) {

			editor.execute( new SetMaterialValueCommand( editor, object, property, number.getValue(), 0 /* TODO: currentMaterialSlot */ ) );

		}

	}

	function update() {

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = object.material;

		if ( property in material ) {

			number.setValue( material[ property ] );
			container.setDisplay( '' );

		} else {

			container.setDisplay( 'none' );

		}

	}

	//

	signals.objectSelected.add( function ( selected ) {

		object = selected;

		update();

	} );

	signals.materialChanged.add( update );

	return container;

}

export { SidebarMaterialNumberProperty };
