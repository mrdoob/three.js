/**
 * @author TatumCreative (Greg Tatum) / http://gregtatum.com/
 */

var twoPi = Math.PI * 2;

function updateGroupGeometry( mesh, geometry ) {

	if ( geometry.isGeometry ) {

		geometry = new THREE.BufferGeometry().fromGeometry( geometry );

		console.warn( 'THREE.GeometryBrowser: Converted Geometry to BufferGeometry.' );

	}

	mesh.children[ 0 ].geometry.dispose();
	mesh.children[ 1 ].geometry.dispose();

	mesh.children[ 0 ].geometry = new THREE.WireframeGeometry( geometry );
	mesh.children[ 1 ].geometry = geometry;

	// these do not update nicely together if shared

}

function CustomSinCurve( scale ) {

	THREE.Curve.call( this );

	this.scale = ( scale === undefined ) ? 1 : scale;

}

CustomSinCurve.prototype = Object.create( THREE.Curve.prototype );
CustomSinCurve.prototype.constructor = CustomSinCurve;

CustomSinCurve.prototype.getPoint = function ( t ) {

	var tx = t * 3 - 1.5;
	var ty = Math.sin( 2 * Math.PI * t );
	var tz = 0;

	return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

};

// heart shape

var x = 0, y = 0;

var heartShape = new THREE.Shape();

heartShape.moveTo( x + 5, y + 5 );
heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7, x - 6, y + 7 );
heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

var guis = {

	BoxBufferGeometry: function ( mesh ) {

		var data = {
			width: 15,
			height: 15,
			depth: 15,
			widthSegments: 1,
			heightSegments: 1,
			depthSegments: 1
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.BoxBufferGeometry(
					data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments
				)
			);

		}

		var folder = gui.addFolder( 'THREE.BoxBufferGeometry' );

		folder.add( data, 'width', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'depth', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'widthSegments', 1, 10 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 10 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'depthSegments', 1, 10 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	BoxGeometry: function ( mesh ) {

		var data = {
			width: 15,
			height: 15,
			depth: 15,
			widthSegments: 1,
			heightSegments: 1,
			depthSegments: 1
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.BoxGeometry(
					data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments
				)
			);

		}

		var folder = gui.addFolder( 'THREE.BoxGeometry' );

		folder.add( data, 'width', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'depth', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'widthSegments', 1, 10 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 10 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'depthSegments', 1, 10 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	CylinderBufferGeometry: function ( mesh ) {

		var data = {
			radiusTop: 5,
			radiusBottom: 5,
			height: 10,
			radialSegments: 8,
			heightSegments: 1,
			openEnded: false,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.CylinderBufferGeometry(
					data.radiusTop,
					data.radiusBottom,
					data.height,
					data.radialSegments,
					data.heightSegments,
					data.openEnded,
					data.thetaStart,
					data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.CylinderBufferGeometry' );

		folder.add( data, 'radiusTop', 0, 30 ).onChange( generateGeometry );
		folder.add( data, 'radiusBottom', 0, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 50 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 3, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'openEnded' ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );


		generateGeometry();

	},

	CylinderGeometry: function ( mesh ) {

		var data = {
			radiusTop: 5,
			radiusBottom: 5,
			height: 10,
			radialSegments: 8,
			heightSegments: 1,
			openEnded: false,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.CylinderGeometry(
					data.radiusTop,
					data.radiusBottom,
					data.height,
					data.radialSegments,
					data.heightSegments,
					data.openEnded,
					data.thetaStart,
					data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.CylinderGeometry' );

		folder.add( data, 'radiusTop', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'radiusBottom', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 50 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 3, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'openEnded' ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );


		generateGeometry();

	},

	ConeBufferGeometry: function ( mesh ) {

		var data = {
			radius: 5,
			height: 10,
			radialSegments: 8,
			heightSegments: 1,
			openEnded: false,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.ConeBufferGeometry(
					data.radius,
					data.height,
					data.radialSegments,
					data.heightSegments,
					data.openEnded,
					data.thetaStart,
					data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.ConeBufferGeometry' );

		folder.add( data, 'radius', 0, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 50 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 3, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'openEnded' ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );


		generateGeometry();

	},

	ConeGeometry: function ( mesh ) {

		var data = {
			radius: 5,
			height: 10,
			radialSegments: 8,
			heightSegments: 1,
			openEnded: false,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.ConeGeometry(
					data.radius,
					data.height,
					data.radialSegments,
					data.heightSegments,
					data.openEnded,
					data.thetaStart,
					data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.ConeGeometry' );

		folder.add( data, 'radius', 0, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 50 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 3, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 64 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'openEnded' ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );


		generateGeometry();

	},


	CircleBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			segments: 32,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.CircleBufferGeometry(
					data.radius, data.segments, data.thetaStart, data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.CircleBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'segments', 0, 128 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	CircleGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			segments: 32,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.CircleGeometry(
					data.radius, data.segments, data.thetaStart, data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.CircleGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'segments', 0, 128 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	DodecahedronGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.DodecahedronGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.DodecahedronGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	DodecahedronBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.DodecahedronBufferGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.DodecahedronBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	IcosahedronGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.IcosahedronGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.IcosahedronGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	IcosahedronBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.IcosahedronBufferGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.IcosahedronBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	LatheBufferGeometry: function ( mesh ) {

		var points = [];

		for ( var i = 0; i < 10; i ++ ) {

			points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );

		}

		var data = {
			segments: 12,
			phiStart: 0,
			phiLength: twoPi
		};

		function generateGeometry() {

			var geometry = new THREE.LatheBufferGeometry(
				points, data.segments, data.phiStart, data.phiLength
			);

			updateGroupGeometry( mesh, geometry );

		}

		var folder = gui.addFolder( 'THREE.LatheBufferGeometry' );

		folder.add( data, 'segments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'phiStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'phiLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	LatheGeometry: function ( mesh ) {

		var points = [];

		for ( var i = 0; i < 10; i ++ ) {

			points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );

		}

		var data = {
			segments: 12,
			phiStart: 0,
			phiLength: twoPi
		};

		function generateGeometry() {

			var geometry = new THREE.LatheGeometry(
				points, data.segments, data.phiStart, data.phiLength
			);

			updateGroupGeometry( mesh, geometry );

		}

		var folder = gui.addFolder( 'THREE.LatheGeometry' );

		folder.add( data, 'segments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'phiStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'phiLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	OctahedronGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.OctahedronGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.OctahedronGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	OctahedronBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.OctahedronBufferGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.OctahedronBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	PlaneBufferGeometry: function ( mesh ) {

		var data = {
			width: 10,
			height: 10,
			widthSegments: 1,
			heightSegments: 1
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.PlaneBufferGeometry(
					data.width, data.height, data.widthSegments, data.heightSegments
				)
			);

		}

		var folder = gui.addFolder( 'THREE.PlaneBufferGeometry' );

		folder.add( data, 'width', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'widthSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	PlaneGeometry: function ( mesh ) {

		var data = {
			width: 10,
			height: 10,
			widthSegments: 1,
			heightSegments: 1
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.PlaneGeometry(
					data.width, data.height, data.widthSegments, data.heightSegments
				)
			);

		}

		var folder = gui.addFolder( 'THREE.PlaneGeometry' );

		folder.add( data, 'width', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'widthSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	RingBufferGeometry: function ( mesh ) {

		var data = {
			innerRadius: 5,
			outerRadius: 10,
			thetaSegments: 8,
			phiSegments: 8,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.RingBufferGeometry(
					data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.RingBufferGeometry' );

		folder.add( data, 'innerRadius', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'outerRadius', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'thetaSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'phiSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	RingGeometry: function ( mesh ) {

		var data = {
			innerRadius: 5,
			outerRadius: 10,
			thetaSegments: 8,
			phiSegments: 8,
			thetaStart: 0,
			thetaLength: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.RingGeometry(
					data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.RingGeometry' );

		folder.add( data, 'innerRadius', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'outerRadius', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'thetaSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'phiSegments', 1, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	SphereBufferGeometry: function ( mesh ) {

		var data = {
			radius: 15,
			widthSegments: 8,
			heightSegments: 6,
			phiStart: 0,
			phiLength: twoPi,
			thetaStart: 0,
			thetaLength: Math.PI
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.SphereBufferGeometry(
					data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.SphereBufferGeometry' );

		folder.add( data, 'radius', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'widthSegments', 3, 32 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 2, 32 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'phiStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'phiLength', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	SphereGeometry: function ( mesh ) {

		var data = {
			radius: 15,
			widthSegments: 8,
			heightSegments: 6,
			phiStart: 0,
			phiLength: twoPi,
			thetaStart: 0,
			thetaLength: Math.PI
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.SphereGeometry(
					data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength
				)
			);

		}

		var folder = gui.addFolder( 'THREE.SphereGeometry' );

		folder.add( data, 'radius', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'widthSegments', 3, 32 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'heightSegments', 2, 32 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'phiStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'phiLength', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaStart', 0, twoPi ).onChange( generateGeometry );
		folder.add( data, 'thetaLength', 0, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	TetrahedronGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TetrahedronGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.TetrahedronGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TetrahedronBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			detail: 0
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TetrahedronBufferGeometry(
					data.radius, data.detail
				)
			);

		}

		var folder = gui.addFolder( 'THREE.TetrahedronBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'detail', 0, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TextGeometry: function ( mesh ) {

		var data = {
			text: "TextGeometry",
			size: 5,
			height: 2,
			curveSegments: 12,
			font: "helvetiker",
			weight: "regular",
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 0.5,
			bevelOffset: 0.0,
			bevelSegments: 3
		};

		var fonts = [
			"helvetiker",
			"optimer",
			"gentilis",
			"droid/droid_serif"
		];

		var weights = [
			"regular", "bold"
		];

		function generateGeometry() {

			var loader = new THREE.FontLoader();
			loader.load( '../../examples/fonts/' + data.font + '_' + data.weight + '.typeface.json', function ( font ) {

				var geometry = new THREE.TextGeometry( data.text, {
					font: font,
					size: data.size,
					height: data.height,
					curveSegments: data.curveSegments,
					bevelEnabled: data.bevelEnabled,
					bevelThickness: data.bevelThickness,
					bevelSize: data.bevelSize,
					bevelOffset: data.bevelOffset,
					bevelSegments: data.bevelSegments
				} );
				geometry.center();

				updateGroupGeometry( mesh, geometry );

			} );

		}

		//Hide the wireframe
		mesh.children[ 0 ].visible = false;

		var folder = gui.addFolder( 'THREE.TextGeometry' );

		folder.add( data, 'text' ).onChange( generateGeometry );
		folder.add( data, 'size', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'curveSegments', 1, 20 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'font', fonts ).onChange( generateGeometry );
		folder.add( data, 'weight', weights ).onChange( generateGeometry );
		folder.add( data, 'bevelEnabled' ).onChange( generateGeometry );
		folder.add( data, 'bevelThickness', 0.1, 3 ).onChange( generateGeometry );
		folder.add( data, 'bevelSize', 0, 3 ).onChange( generateGeometry );
		folder.add( data, 'bevelOffset', -0.5, 1.5 ).onChange( generateGeometry );
		folder.add( data, 'bevelSegments', 0, 8 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TextBufferGeometry: function ( mesh ) {

		var data = {
			text: "TextBufferGeometry",
			size: 5,
			height: 2,
			curveSegments: 12,
			font: "helvetiker",
			weight: "regular",
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 0.5,
			bevelOffset: 0.0,
			bevelSegments: 3
		};

		var fonts = [
			"helvetiker",
			"optimer",
			"gentilis",
			"droid/droid_serif"
		];

		var weights = [
			"regular", "bold"
		];

		function generateGeometry() {

			var loader = new THREE.FontLoader();
			loader.load( '../../examples/fonts/' + data.font + '_' + data.weight + '.typeface.json', function ( font ) {

				var geometry = new THREE.TextBufferGeometry( data.text, {
					font: font,
					size: data.size,
					height: data.height,
					curveSegments: data.curveSegments,
					bevelEnabled: data.bevelEnabled,
					bevelThickness: data.bevelThickness,
					bevelSize: data.bevelSize,
					bevelOffset: data.bevelOffset,
					bevelSegments: data.bevelSegments
				} );
				geometry.center();

				updateGroupGeometry( mesh, geometry );

			} );

		}

		//Hide the wireframe
		mesh.children[ 0 ].visible = false;

		var folder = gui.addFolder( 'THREE.TextBufferGeometry' );

		folder.add( data, 'text' ).onChange( generateGeometry );
		folder.add( data, 'size', 1, 30 ).onChange( generateGeometry );
		folder.add( data, 'height', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'curveSegments', 1, 20 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'font', fonts ).onChange( generateGeometry );
		folder.add( data, 'weight', weights ).onChange( generateGeometry );
		folder.add( data, 'bevelEnabled' ).onChange( generateGeometry );
		folder.add( data, 'bevelThickness', 0.1, 3 ).onChange( generateGeometry );
		folder.add( data, 'bevelSize', 0, 3 ).onChange( generateGeometry );
		folder.add( data, 'bevelOffset', -0.5, 1.5 ).onChange( generateGeometry );
		folder.add( data, 'bevelSegments', 0, 8 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TorusBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			tube: 3,
			radialSegments: 16,
			tubularSegments: 100,
			arc: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TorusBufferGeometry(
					data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc
				)
			);

		}

		var folder = gui.addFolder( 'THREE.TorusBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'tube', 0.1, 10 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 2, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'tubularSegments', 3, 200 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'arc', 0.1, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	TorusGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			tube: 3,
			radialSegments: 16,
			tubularSegments: 100,
			arc: twoPi
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TorusGeometry(
					data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc
				)
			);

		}

		var folder = gui.addFolder( 'THREE.TorusGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'tube', 0.1, 10 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 2, 30 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'tubularSegments', 3, 200 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'arc', 0.1, twoPi ).onChange( generateGeometry );

		generateGeometry();

	},

	TorusKnotBufferGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			tube: 3,
			tubularSegments: 64,
			radialSegments: 8,
			p: 2,
			q: 3
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TorusKnotBufferGeometry(
					data.radius, data.tube, data.tubularSegments, data.radialSegments,
					data.p, data.q
				)
			);

		}

		var folder = gui.addFolder( 'THREE.TorusKnotBufferGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'tube', 0.1, 10 ).onChange( generateGeometry );
		folder.add( data, 'tubularSegments', 3, 300 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 3, 20 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'p', 1, 20 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'q', 1, 20 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TorusKnotGeometry: function ( mesh ) {

		var data = {
			radius: 10,
			tube: 3,
			tubularSegments: 64,
			radialSegments: 8,
			p: 2,
			q: 3
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TorusKnotGeometry(
					data.radius, data.tube, data.tubularSegments, data.radialSegments,
					data.p, data.q
				)
			);

		}

		var folder = gui.addFolder( 'THREE.TorusKnotGeometry' );

		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'tube', 0.1, 10 ).onChange( generateGeometry );
		folder.add( data, 'tubularSegments', 3, 300 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 3, 20 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'p', 1, 20 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'q', 1, 20 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	ParametricBufferGeometry: function ( mesh ) {

		var data = {
			slices: 25,
			stacks: 25
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.ParametricBufferGeometry( THREE.ParametricGeometries.klein, data.slices, data.stacks )
			);

		}

		var folder = gui.addFolder( 'THREE.ParametricBufferGeometry' );

		folder.add( data, 'slices', 1, 100 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'stacks', 1, 100 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	ParametricGeometry: function ( mesh ) {

		var data = {
			slices: 25,
			stacks: 25
		};

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.ParametricGeometry( THREE.ParametricGeometries.klein, data.slices, data.stacks )
			);

		}

		var folder = gui.addFolder( 'THREE.ParametricGeometry' );

		folder.add( data, 'slices', 1, 100 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'stacks', 1, 100 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TubeGeometry: function ( mesh ) {

		var data = {
			segments: 20,
			radius: 2,
			radialSegments: 8
		};

		var path = new CustomSinCurve( 10 );

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TubeGeometry( path, data.segments, data.radius, data.radialSegments, false )
			);

		}

		var folder = gui.addFolder( 'THREE.TubeGeometry' );

		folder.add( data, 'segments', 1, 100 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'radius', 1, 10 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 1, 20 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	TubeBufferGeometry: function ( mesh ) {

		var data = {
			segments: 20,
			radius: 2,
			radialSegments: 8
		};

		var path = new CustomSinCurve( 10 );

		function generateGeometry() {

			updateGroupGeometry( mesh,
				new THREE.TubeBufferGeometry( path, data.segments, data.radius, data.radialSegments, false )
			);

		}

		var folder = gui.addFolder( 'THREE.TubeBufferGeometry' );

		folder.add( data, 'segments', 1, 100 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'radius', 1, 10 ).onChange( generateGeometry );
		folder.add( data, 'radialSegments', 1, 20 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	ShapeGeometry: function ( mesh ) {

		var data = {
			segments: 12
		};

		function generateGeometry() {

			var geometry = new THREE.ShapeGeometry( heartShape, data.segments );
			geometry.center();

			updateGroupGeometry( mesh, geometry );

		}

		var folder = gui.addFolder( 'THREE.ShapeGeometry' );
		folder.add( data, 'segments', 1, 100 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	ShapeBufferGeometry: function ( mesh ) {

		var data = {
			segments: 12
		};

		function generateGeometry() {

			var geometry = new THREE.ShapeBufferGeometry( heartShape, data.segments );
			geometry.center();

			updateGroupGeometry( mesh, geometry );

		}

		var folder = gui.addFolder( 'THREE.ShapeBufferGeometry' );
		folder.add( data, 'segments', 1, 100 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	ExtrudeGeometry: function ( mesh ) {

		var data = {
			steps: 2,
			depth: 16,
			bevelEnabled: true,
			bevelThickness: 1,
			bevelSize: 1,
			bevelOffset: 0,
			bevelSegments: 1
		};

		var length = 12, width = 8;

		var shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, width );
		shape.lineTo( length, width );
		shape.lineTo( length, 0 );
		shape.lineTo( 0, 0 );

		function generateGeometry() {

			var geometry = new THREE.ExtrudeGeometry( shape, data );
			geometry.center();

			updateGroupGeometry( mesh, geometry );

		}

		var folder = gui.addFolder( 'THREE.ExtrudeGeometry' );

		folder.add( data, 'steps', 1, 10 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'depth', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'bevelThickness', 1, 5 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'bevelSize', 0, 5 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'bevelOffset', -4, 5 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'bevelSegments', 1, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	},

	ExtrudeBufferGeometry: function ( mesh ) {

		var data = {
			steps: 2,
			depth: 16,
			bevelEnabled: true,
			bevelThickness: 1,
			bevelSize: 1,
			bevelOffset: 0,
			bevelSegments: 1
		};

		var length = 12, width = 8;

		var shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, width );
		shape.lineTo( length, width );
		shape.lineTo( length, 0 );
		shape.lineTo( 0, 0 );

		function generateGeometry() {

			var geometry = new THREE.ExtrudeBufferGeometry( shape, data );
			geometry.center();

			updateGroupGeometry( mesh, geometry );

		}

		var folder = gui.addFolder( 'THREE.ExtrudeBufferGeometry' );

		folder.add( data, 'steps', 1, 10 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'depth', 1, 20 ).onChange( generateGeometry );
		folder.add( data, 'bevelThickness', 1, 5 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'bevelSize', 0, 5 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'bevelOffset', -4, 5 ).step( 1 ).onChange( generateGeometry );
		folder.add( data, 'bevelSegments', 1, 5 ).step( 1 ).onChange( generateGeometry );

		generateGeometry();

	}

};

function chooseFromHash( mesh ) {

	var selectedGeometry = window.location.hash.substring( 1 ) || "TorusGeometry";

	if ( guis[ selectedGeometry ] !== undefined ) {

		guis[ selectedGeometry ]( mesh );

	}

	if ( selectedGeometry === 'TextGeometry' || selectedGeometry === 'TextBufferGeometry' ) {

		return { fixed: true };

	}

	//No configuration options
	return {};

}
