import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { UIDiv, UIRow, UIText, UINumber, UIInteger, UIInput, UICheckbox } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function GeometryParametersPanel( editor, object ) {

	const strings = editor.strings;

	const container = new UIDiv();

	const geometry = object.geometry;
	const parameters = geometry.parameters.options;

	// text

	const textRow = new UIRow();
	const text = new UIInput().setValue( parameters.text ).onChange( update );

	textRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/text' ) ).setClass( 'Label' ) );
	textRow.add( text );

	container.add( textRow );

	// size

	const sizeRow = new UIRow();
	const size = new UINumber().setPrecision( 3 ).setValue( parameters.size ).onChange( update );

	sizeRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/size' ) ).setClass( 'Label' ) );
	sizeRow.add( size );

	container.add( sizeRow );

	// depth

	const depthRow = new UIRow();
	const depth = new UINumber().setPrecision( 3 ).setValue( parameters.depth ).onChange( update );

	depthRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/depth' ) ).setClass( 'Label' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// curveSegments

	const curveSegmentsRow = new UIRow();
	const curveSegments = new UIInteger( parameters.curveSegments ).setRange( 1, Infinity ).onChange( update );

	curveSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/curveseg' ) ).setClass( 'Label' ) );
	curveSegmentsRow.add( curveSegments );

	container.add( curveSegmentsRow );


	// scale

	const scaleRow = new UIRow();
	const scale = new UINumber().setPrecision( 4 ).setValue( parameters.scale ).onChange( update );

	scaleRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/scale' ) ).setClass( 'Label' ) );
	scaleRow.add( scale );

	container.add( scaleRow );

	// bevelEnabled

	const bevelEnabledRow = new UIRow();
	const bevelEnabled = new UICheckbox( parameters.bevelEnabled ).onChange( update );

	bevelEnabledRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/bevelenabled' ) ).setClass( 'Label' ) );
	bevelEnabledRow.add( bevelEnabled );

	container.add( bevelEnabledRow );

	// bevelThickness

	const bevelThicknessRow = new UIRow();
	const bevelThickness = new UINumber( parameters.bevelThickness ).setPrecision( 3 ).setRange( 0, Infinity ).onChange( update );

	bevelThicknessRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/bevelthickness' ) ).setClass( 'Label' ) );
	bevelThicknessRow.add( bevelThickness );

	container.add( bevelThicknessRow );

	// bevelSize

	const bevelSizeRow = new UIRow();
	const bevelSize = new UINumber( parameters.bevelSize ).setRange( 0, Infinity ).onChange( update );

	bevelSizeRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/bevelsize' ) ).setClass( 'Label' ) );
	bevelSizeRow.add( bevelSize );

	container.add( bevelSizeRow );

	// bevelOffset

	const bevelOffsetRow = new UIRow();
	const bevelOffset = new UINumber( parameters.bevelOffset ).setRange( 0, Infinity ).onChange( update );

	bevelOffsetRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/bevelOffset' ) ).setClass( 'Label' ) );
	bevelOffsetRow.add( bevelOffset );

	container.add( bevelOffsetRow );


	// bevelSegments

	const bevelSegmentsRow = new UIRow();
	const bevelSegments = new UIInteger( parameters.bevelSegments ).setRange( 0, Infinity ).onChange( update );

	bevelSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/text_geometry/bevelseg' ) ).setClass( 'Label' ) );
	bevelSegmentsRow.add( bevelSegments );

	container.add( bevelSegmentsRow );

	function update() {

		const options = {

			text: text.getValue(),
			font: parameters.font,

			size: size.getValue(),
			depth: depth.getValue(),
			curveSegments: curveSegments.getValue(),

			bevelEnabled: bevelEnabled.getValue(),
			bevelThickness: bevelThickness.getValue(),
			bevelSize: bevelSize.getValue(),
			bevelOffset: bevelOffset.getValue(),
			bevelSegments: bevelSegments.getValue(),

			scale: scale.getValue(),

		};

		const geometry = new TextGeometry( options.text, options );

		editor.execute( new SetGeometryCommand( editor, object, geometry ) );

	}

	return container;

}

export { GeometryParametersPanel };

