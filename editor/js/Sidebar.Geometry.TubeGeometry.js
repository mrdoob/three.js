/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.TubeGeometry = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;
	
	var pHeight = 5; //"magnitude"
	var pRadius = pHeight/4; //radius of the helix (overall shape)
	var pNumberLoops = 4;
	var pTubularSegments = 30*pNumberLoops;
	
	
	
	//radius
	var helixRadiusRow = new UI.Row();
	var helixRadius = new UI.Number( parameters.helixRadius ).setRange(0, Infinity).onChange( update );
	helixRadiusRow.add( new UI.Text( 'Helix Radius' ).setWidth( '90px' ) );
	helixRadiusRow.add( helixRadius );
	container.add( helixRadiusRow );

	// height
	var heightRow = new UI.Row();
	var height = new UI.Number( parameters.height ).onChange( update );
	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );
	container.add( heightRow );

	//numberLoops
	var numberLoopsRow = new UI.Row();
	var numberLoops = new UI.Number( parameters.numberLoops ).setRange( 0.5, 50 ).onChange( update );
	numberLoopsRow.add( new UI.Text( 'Number of Loops' ).setWidth( '90px' ) );
	numberLoopsRow.add( numberLoops );
	container.add( numberLoopsRow );

	//tubularSegments 
	var tubularSegmentsRow = new UI.Row();
	var tubularSegments = new UI.Integer( parameters.segments ).setRange( 1, Infinity ).onChange( update );
	tubularSegmentsRow.add( new UI.Text( 'Tubular Segments' ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );
	container.add( tubularSegmentsRow );

	//tube
	var tubeRow = new UI.Row();
	var tube = new UI.Number( parameters.radius ).setRange(0.00001, Infinity).onChange( update );
	tubeRow.add( new UI.Text( 'Tube Radius' ).setWidth( '90px' ) );
	tubeRow.add( tube );
	container.add( tubeRow );

	//radialSegments
	var radialSegmentsRow = new UI.Row();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );
	radialSegmentsRow.add( new UI.Text( 'Radial Segments' ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );
	container.add( radialSegmentsRow );

	function update() {
		var customHelixCurve = THREE.Curve.create(
			function ( scale ) { //custom curve constructor
					this.scale = (scale === undefined) ? 1 : scale;
			},

			function ( t ) { //getPoint: t is between 0-1
					var tx = helixRadius.getValue() * Math.cos(t * numberLoops.getValue() * 2 * Math.PI);
							tz = helixRadius.getValue() * Math.sin(t * numberLoops.getValue() * 2 * Math.PI);
							ty = t*height.getValue();

					return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
			}
		);

		var path = new customHelixCurve( 1 );

		var helixGeometry = new THREE.TubeGeometry(
			path,  													//path
			tubularSegments.getValue(),    //tube segments
			tube.getValue(),     					//radius
			radialSegments.getValue(),     //radiusSegments
			false  												//closed
		);
		
		//ARROW:		
		var arrowObject = object.children[0];
		
		var origin = path.getPoint(1);
		var prevPathPoint = path.getPoint(0.99999);
		var dir = new THREE.Vector3( );
		dir.subVectors( origin, prevPathPoint );
		
		var headLength = tube.getValue()*4;
		var headWidth = tube.getValue()*4;
		var length = headLength/2;
		arrowObject.setLength(length, headLength,headWidth);
		arrowObject.setDirection(dir);
		arrowObject.position.copy(origin);
		
		
		helixGeometry.parameters.height=height.getValue();
		helixGeometry.parameters.helixRadius=helixRadius.getValue();
		helixGeometry.parameters.numberLoops=numberLoops.getValue();
		
		editor.execute( new SetGeometryCommand( object, helixGeometry ) );
	}

	return container;
};

Sidebar.Geometry.BufferTubeGeometry = Sidebar.Geometry.TubeGeometry;
