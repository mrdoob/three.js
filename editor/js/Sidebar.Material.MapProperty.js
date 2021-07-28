import * as THREE from '../../build/three.module.js';

import { UICheckbox, UIRow, UIText } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';

function SidebarMaterialMapProperty( editor, property, name ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const enabled = new UICheckbox( false ).onChange( onChange );
	container.add( enabled );

	const map = new UITexture().onChange( onMapChange );
	container.add( map );

	let object = null;
	let material = null;

	function onChange() {

		const newMap = enabled.getValue() ? map.getValue() : null;

		if ( material[ 'property' ] !== newMap ) {

			const geometry = object.geometry;

			if ( newMap !== null && geometry.isBufferGeometry && geometry.attributes.uv === undefined ) {

				console.warn( 'Geometry doesn\'t have uvs:', geometry );

			}

			editor.execute( new SetMaterialMapCommand( editor, object, property, newMap, 0 /* TODO: currentMaterialSlot */ ) );

		}

	}

	function onMapChange( texture ) {

		if ( texture !== null ) {

			if ( texture.isDataTexture !== true && texture.encoding !== THREE.sRGBEncoding ) {

				texture.encoding = THREE.sRGBEncoding;
				material.needsUpdate = true;

			}

		}

		onChange();

	}

	function update() {

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = object.material;

		if ( property in material ) {

			enabled.setValue( material[ property ] !== null );
			if ( enabled.getValue() ) map.setValue( material[ property ] );
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

export { SidebarMaterialMapProperty };
