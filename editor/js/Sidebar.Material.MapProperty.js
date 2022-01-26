import * as THREE from 'three';

import { UICheckbox, UINumber, UIRow, UIText } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';
import { SetMaterialVectorCommand } from './commands/SetMaterialVectorCommand.js';

function SidebarMaterialMapProperty( editor, property, name ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const enabled = new UICheckbox( false ).setMarginRight( '8px' ).onChange( onChange );
	container.add( enabled );

	const map = new UITexture().onChange( onMapChange );
	container.add( map );

	const mapType = property.replace( 'Map', '' );

	let intensity;

	if ( property === 'aoMap' ) {

		intensity = new UINumber().setWidth( '30px' ).onChange( onIntensityChange );
		container.add( intensity );

	}

	let scale;

	if ( property === 'bumpMap' || property === 'displacementMap' ) {

		scale = new UINumber().setWidth( '30px' ).onChange( onScaleChange );
		container.add( scale );

	}

	let scaleX, scaleY;

	if ( property === 'normalMap' || property === 'clearcoatNormalMap' ) {

		scaleX = new UINumber().setWidth( '30px' ).onChange( onScaleXYChange );
		container.add( scaleX );

		scaleY = new UINumber().setWidth( '30px' ).onChange( onScaleXYChange );
		container.add( scaleY );

	}

	let object = null;
	let material = null;

	function onChange() {

		const newMap = enabled.getValue() ? map.getValue() : null;

		if ( material[ property ] !== newMap ) {

			if ( newMap !== null ) {

				const geometry = object.geometry;

				if ( geometry.hasAttribute( 'uv' ) === false ) console.warn( 'Geometry doesn\'t have uvs:', geometry );

				if ( property === 'envMap' ) newMap.mapping = THREE.EquirectangularReflectionMapping;

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

		enabled.setDisabled( false );

		onChange();

	}

	function onIntensityChange() {

		if ( material[ `${ property }Intensity` ] !== intensity.getValue() ) {

			editor.execute( new SetMaterialValueCommand( editor, object, `${ property }Intensity`, intensity.getValue(), 0 /* TODO: currentMaterialSlot */ ) );

		}

	}

	function onScaleChange() {

		if ( material[ `${ mapType }Scale` ] !== scale.getValue() ) {

			editor.execute( new SetMaterialValueCommand( editor, object, `${ mapType }Scale`, scale.getValue(), 0 /* TODO: currentMaterialSlot */ ) );

		}

	}

	function onScaleXYChange() {

		const value = [ scaleX.getValue(), scaleY.getValue() ];

		if ( material[ `${ mapType }Scale` ].x !== value[ 0 ] || material[ `${ mapType }Scale` ].y !== value[ 1 ] ) {

			editor.execute( new SetMaterialVectorCommand( editor, object, `${ mapType }Scale`, value, 0 /* TODOL currentMaterialSlot */ ) );

		}

	}

	function update() {

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = object.material;

		if ( property in material ) {

			if ( material[ property ] !== null ) {

				map.setValue( material[ property ] );

			}

			enabled.setValue( material[ property ] !== null );
			enabled.setDisabled( map.getValue() === null );

			if ( intensity !== undefined ) {

				intensity.setValue( material[ `${ property }Intensity` ] );

			}

			if ( scale !== undefined ) {

				scale.setValue( material[ `${ mapType }Scale` ] );

			}

			if ( scaleX !== undefined ) {

				scaleX.setValue( material[ `${ mapType }Scale` ].x );
				scaleY.setValue( material[ `${ mapType }Scale` ].y );

			}

			container.setDisplay( '' );

		} else {

			container.setDisplay( 'none' );

		}

	}

	//

	signals.objectSelected.add( function ( selected ) {

		object = selected;

		map.setValue( null );

		update();

	} );

	signals.materialChanged.add( update );

	return container;

}

export { SidebarMaterialMapProperty };
