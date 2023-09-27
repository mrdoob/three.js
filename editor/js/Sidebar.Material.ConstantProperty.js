import { UIRow, UISelect, UIText } from './libs/ui.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

function SidebarMaterialConstantProperty( editor, property, name, options ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const constant = new UISelect().setOptions( options ).onChange( onChange );
	container.add( constant );

	let object = null;
	let material = null;

	function onChange() {

		const value = parseInt( constant.getValue() );

		if ( material[ property ] !== value ) {

			editor.execute( new SetMaterialValueCommand( editor, object, property, value, 0 /* TODO: currentMaterialSlot */ ) );

		}

	}

	function update() {

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = object.material;

		if ( property in material ) {

			constant.setValue( material[ property ] );
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

export { SidebarMaterialConstantProperty };
