import { UINumber, UIRow, UIText } from './libs/ui.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

function SidebarMaterialNumberProperty( editor, property, name, range = [ - Infinity, Infinity ], precision = 2 ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setClass( 'Label' ) );

	const number = new UINumber().setWidth( '60px' ).setRange( range[ 0 ], range[ 1 ] ).setPrecision( precision ).onChange( onChange );
	container.add( number );

	let object = null;
	let materialSlot = null;
	let material = null;

	function onChange() {

		if ( material[ property ] !== number.getValue() ) {

			editor.execute( new SetMaterialValueCommand( editor, object, property, number.getValue(), materialSlot ) );

		}

	}

	function update( currentObject, currentMaterialSlot = 0 ) {

		object = currentObject;
		materialSlot = currentMaterialSlot;

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = editor.getObjectMaterial( object, materialSlot );

		if ( property in material ) {

			number.setValue( material[ property ] );
			container.setDisplay( '' );

		} else {

			container.setDisplay( 'none' );

		}

	}

	//

	signals.objectSelected.add( update );
	signals.materialChanged.add( update );

	return container;

}

export { SidebarMaterialNumberProperty };
