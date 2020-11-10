import * as THREE from '../../build/three.module.js';

import { UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

function SidebarGeometryPlaneGeometry( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// width

	var widthRow = new UIRow();
	var width = new UINumber( parameters.width ).onChange( update );

	widthRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/width' ) ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UIRow();
	var height = new UINumber( parameters.height ).onChange( update );

	heightRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/height' ) ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// widthSegments

	var widthSegmentsRow = new UIRow();
	var widthSegments = new UIInteger( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/widthsegments' ) ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UIRow();
	var heightSegments = new UIInteger( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/plane_geometry/heightsegments' ) ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.PlaneBufferGeometry(
			width.getValue(),
			height.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue()
		) ) );

	}

	return container;

}

export { SidebarGeometryPlaneGeometry };
