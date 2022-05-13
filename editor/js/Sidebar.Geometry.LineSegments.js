import { UIRow, UINumber, UIText, UIButton } from './libs/ui.js';
/**
 * LineSegments Geometry function to visualize and update cell configuration.
 */
function GeometryParametersPanel( editor, object ) {

	var signals = editor.signals;
	var container = new UIRow();

	// set lattice a,b, and c vectors based on the LineSegments vertices
	const vertices = object.geometry.vertices;
	const a = vertices[ 1 ].sub( vertices[ 0 ] ).toArray();
	const b = vertices[ 3 ].sub( vertices[ 0 ] ).toArray();
	const c = vertices[ 17 ].sub( vertices[ 0 ] ).toArray();

	// lattice a vector
	var aRow = new UIRow();
	var aX = new UINumber( a[ 0 ] ).setWidth( '50px' );
	var aY = new UINumber( a[ 1 ] ).setWidth( '50px' );
	var aZ = new UINumber( a[ 2 ] ).setWidth( '50px' );
	aRow.add( new UIText( 'Lattice "a"' ).setWidth( '90px' ) );
	aRow.add( aX, aY, aZ );
	container.add( aRow );

	// lattice b vector
	var bRow = new UIRow();
	var bX = new UINumber( b[ 0 ] ).setWidth( '50px' );
	var bY = new UINumber( b[ 1 ] ).setWidth( '50px' );
	var bZ = new UINumber( b[ 2 ] ).setWidth( '50px' );
	bRow.add( new UIText( 'Lattice "b"' ).setWidth( '90px' ) );
	bRow.add( bX, bY, bZ );
	container.add( bRow );

	// lattice c vector
	var cRow = new UIRow();
	var cX = new UINumber( c[ 0 ] ).setWidth( '50px' );
	var cY = new UINumber( c[ 1 ] ).setWidth( '50px' );
	var cZ = new UINumber( c[ 2 ] ).setWidth( '50px' );
	cRow.add( new UIText( 'Lattice "c"' ).setWidth( '90px' ) );
	cRow.add( cX, cY, cZ );
	container.add( cRow );

	const applyButton = new UIButton( 'Apply Edits' ).onClick( () => update( object ) );
	container.add( applyButton );

	function update( object ) {

		container.setDisplay( 'block' );
		const cell = {
			ax: aX.getValue(),
			ay: aY.getValue(),
			az: aZ.getValue(),
			bx: bX.getValue(),
			by: bY.getValue(),
			bz: bZ.getValue(),
			cx: cX.getValue(),
			cy: cY.getValue(),
			cz: cZ.getValue(),
		};
		const vertices = [
			[ 0, 0, 0 ],
			[ cell.ax, cell.ay, cell.az ],
			[ cell.bx, cell.by, cell.bz ],
			[ ( cell.ax + cell.bx ), ( cell.ay + cell.by ), ( cell.az + cell.bz ) ],
			[ cell.cx, cell.cy, cell.cz ],
			[ ( cell.cx + cell.ax ), ( cell.cy + cell.ay ), ( cell.cz + cell.az ) ],
			[ ( cell.cx + cell.bx ), ( cell.cy + cell.by ), ( cell.cz + cell.bz ) ],
			[ ( cell.cx + cell.ax + cell.bx ), ( cell.cy + cell.ay + cell.by ), ( cell.cz + cell.az + cell.bz ) ]
		];

		// edges of the cell forming a continuous line
		const edges = [ 0, 1, 0, 2, 1, 3, 2, 3, 4, 5, 4, 6, 5, 7, 6, 7, 0, 4, 1, 5, 2, 6, 3, 7 ];

		const newGeometry = new THREE.Geometry();

		edges.forEach( edge => newGeometry.vertices.push( new THREE.Vector3( vertices[ edge ][ 0 ], vertices[ edge ][ 1 ], vertices[ edge ][ 2 ] ) ) );

		editor.execute( new SetGeometryCommand( object, newGeometry ) );

	}

	return container;

}

Sidebar.Geometry.LineSegments = GeometryParametersPanel;

export { GeometryParametersPanel };
