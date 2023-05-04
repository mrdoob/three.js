import { UINumber, UIRow, UIText } from './libs/ui.js';
import { SetMaterialRangeCommand } from './commands/SetMaterialRangeCommand.js';

function SidebarMaterialRangeValueProperty( editor, property, name, isMin, range = [ - Infinity, Infinity ], precision = 2, step = 1, nudge = 0.01, unit = '' ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const number = new UINumber().setWidth( '60px' ).setRange( range[ 0 ], range[ 1 ] ).setPrecision( precision ).setStep( step ).setNudge( nudge ).setUnit( unit ).onChange( onChange );
	container.add( number );

	let object = null;
	let material = null;

	function onChange() {

		if ( material[ property ][ isMin ? 0 : 1 ] !== number.getValue() ) {

			const minValue = isMin ? number.getValue() : material[ property ][ 0 ];
			const maxValue = isMin ? material[ property ][ 1 ] : number.getValue();

			editor.execute( new SetMaterialRangeCommand( editor, object, property, minValue, maxValue, 0 /* TODO: currentMaterialSlot */ ) );

		}

	}

	function update() {

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = object.material;

		if ( property in material ) {

			number.setValue( material[ property ][ isMin ? 0 : 1 ] );
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

export { SidebarMaterialRangeValueProperty };
