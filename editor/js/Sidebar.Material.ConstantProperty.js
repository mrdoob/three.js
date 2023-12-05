import { UIRow, UISelect, UIText } from './libs/ui.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

function SidebarMaterialConstantProperty( editor, property, name, options ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const constant = new UISelect().setOptions( options ).onChange( onChange );
	container.add( constant );

	let object = null;
	let materialSlot = null;
	let material = null;

	function onChange() {

		const value = parseInt( constant.getValue() );

		if ( material[ property ] !== value ) {

			editor.execute( new SetMaterialValueCommand( editor, object, property, value, materialSlot ) );

		}

	}

	function update( currentObject, currentMaterialSlot = 0 ) {

		object = currentObject;
		materialSlot = currentMaterialSlot;

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = editor.getObjectMaterial( object, materialSlot );

		if ( property in material ) {

			constant.setValue( material[ property ] );
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

export { SidebarMaterialConstantProperty };
