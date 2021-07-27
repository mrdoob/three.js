import { UIColor, UINumber, UIRow, UIText } from './libs/ui.js';
import { SetMaterialColorCommand } from './commands/SetMaterialColorCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

function SidebarMaterialColorProperty( editor, property, name ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const color = new UIColor().onInput( onChange );
	container.add( color );

	let emissiveIntensity;

	if ( property === 'emissive' ) {

		emissiveIntensity = new UINumber( 1 ).setWidth( '30px' ).onChange( onChange );
		container.add( emissiveIntensity );

	}

	let object = null;
	let material = null;

	function onChange() {

		if ( material[ property ].getHex() !== color.getHexValue() ) {

			editor.execute( new SetMaterialColorCommand( editor, object, property, color.getHexValue(), /* TODO: currentMaterialSlot*/ 0 ) );

		}

		if ( emissiveIntensity !== undefined ) {

			if ( material.emissiveIntensity !== emissiveIntensity.getValue() ) {

				editor.execute( new SetMaterialValueCommand( editor, object, 'emissiveIntensity', emissiveIntensity.getValue(), /* TODO: currentMaterialSlot*/ 0 ) );

			}

		}

	}

	function update() {

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = object.material;

		if ( property in material ) {

			color.setHexValue( material[ property ].getHexString() );

			if ( emissiveIntensity !== undefined ) {

				emissiveIntensity.setValue( material.emissiveIntensity );

			}

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

export { SidebarMaterialColorProperty };
