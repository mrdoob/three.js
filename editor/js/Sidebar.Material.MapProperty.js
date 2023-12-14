import * as THREE from 'three';

import { UICheckbox, UIDiv, UINumber, UIRow, UIText } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';
import { SetMaterialMapCommand } from './commands/SetMaterialMapCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';
import { SetMaterialRangeCommand } from './commands/SetMaterialRangeCommand.js';
import { SetMaterialVectorCommand } from './commands/SetMaterialVectorCommand.js';

function SidebarMaterialMapProperty( editor, property, name ) {

	const signals = editor.signals;

	const container = new UIRow();
	container.add( new UIText( name ).setWidth( '90px' ) );

	const enabled = new UICheckbox( false ).setMarginRight( '8px' ).onChange( onChange );
	container.add( enabled );

	const map = new UITexture( editor ).onChange( onMapChange );
	container.add( map );

	const mapType = property.replace( 'Map', '' );

	const colorMaps = [ 'map', 'emissiveMap', 'sheenColorMap', 'specularColorMap', 'envMap' ];

	let intensity;

	if ( property === 'aoMap' ) {

		intensity = new UINumber( 1 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( onIntensityChange );
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

	let rangeMin, rangeMax;

	if ( property === 'iridescenceThicknessMap' ) {

		const range = new UIDiv().setMarginLeft( '3px' );
		container.add( range );

		const rangeMinRow = new UIRow().setMarginBottom( '0px' ).setStyle( 'min-height', '0px' );
		range.add( rangeMinRow );

		rangeMinRow.add( new UIText( 'min:' ).setWidth( '35px' ) );

		rangeMin = new UINumber().setWidth( '40px' ).onChange( onRangeChange );
		rangeMinRow.add( rangeMin );

		const rangeMaxRow = new UIRow().setMarginBottom( '6px' ).setStyle( 'min-height', '0px' );
		range.add( rangeMaxRow );

		rangeMaxRow.add( new UIText( 'max:' ).setWidth( '35px' ) );

		rangeMax = new UINumber().setWidth( '40px' ).onChange( onRangeChange );
		rangeMaxRow.add( rangeMax );

		// Additional settings for iridescenceThicknessMap
		// Please add conditional if more maps are having a range property
		rangeMin.setPrecision( 0 ).setRange( 0, Infinity ).setNudge( 1 ).setStep( 10 ).setUnit( 'nm' );
		rangeMax.setPrecision( 0 ).setRange( 0, Infinity ).setNudge( 1 ).setStep( 10 ).setUnit( 'nm' );

	}

	let object = null;
	let materialSlot = null;
	let material = null;

	function onChange() {

		const newMap = enabled.getValue() ? map.getValue() : null;

		if ( material[ property ] !== newMap ) {

			if ( newMap !== null ) {

				const geometry = object.geometry;

				if ( geometry.hasAttribute( 'uv' ) === false ) console.warn( 'Geometry doesn\'t have uvs:', geometry );

				if ( property === 'envMap' ) newMap.mapping = THREE.EquirectangularReflectionMapping;

			}

			editor.execute( new SetMaterialMapCommand( editor, object, property, newMap, materialSlot ) );

		}

	}

	function onMapChange( texture ) {

		if ( texture !== null ) {

			if ( colorMaps[ property ] !== undefined && texture.isDataTexture !== true && texture.colorSpace !== THREE.SRGBColorSpace ) {

				texture.colorSpace = THREE.SRGBColorSpace;
				material.needsUpdate = true;

			}

		}

		enabled.setDisabled( false );

		onChange();

	}

	function onIntensityChange() {

		if ( material[ `${ property }Intensity` ] !== intensity.getValue() ) {

			editor.execute( new SetMaterialValueCommand( editor, object, `${ property }Intensity`, intensity.getValue(), materialSlot ) );

		}

	}

	function onScaleChange() {

		if ( material[ `${ mapType }Scale` ] !== scale.getValue() ) {

			editor.execute( new SetMaterialValueCommand( editor, object, `${ mapType }Scale`, scale.getValue(), materialSlot ) );

		}

	}

	function onScaleXYChange() {

		const value = [ scaleX.getValue(), scaleY.getValue() ];

		if ( material[ `${ mapType }Scale` ].x !== value[ 0 ] || material[ `${ mapType }Scale` ].y !== value[ 1 ] ) {

			editor.execute( new SetMaterialVectorCommand( editor, object, `${ mapType }Scale`, value, materialSlot ) );

		}

	}

	function onRangeChange() {

		const value = [ rangeMin.getValue(), rangeMax.getValue() ];

		if ( material[ `${ mapType }Range` ][ 0 ] !== value[ 0 ] || material[ `${ mapType }Range` ][ 1 ] !== value[ 1 ] ) {

			editor.execute( new SetMaterialRangeCommand( editor, object, `${ mapType }Range`, value[ 0 ], value[ 1 ], materialSlot ) );

		}

	}

	function update( currentObject, currentMaterialSlot = 0 ) {

		object = currentObject;
		materialSlot = currentMaterialSlot;

		if ( object === null ) return;
		if ( object.material === undefined ) return;

		material = editor.getObjectMaterial( object, materialSlot );

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

			if ( rangeMin !== undefined ) {

				rangeMin.setValue( material[ `${ mapType }Range` ][ 0 ] );
				rangeMax.setValue( material[ `${ mapType }Range` ][ 1 ] );

			}

			container.setDisplay( '' );

		} else {

			container.setDisplay( 'none' );

		}

	}

	//

	signals.objectSelected.add( function ( selected ) {

		map.setValue( null );

		update( selected );

	} );

	signals.materialChanged.add( update );

	return container;

}

export { SidebarMaterialMapProperty };
