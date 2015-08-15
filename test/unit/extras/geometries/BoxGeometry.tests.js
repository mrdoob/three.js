(function () {

	'use strict';

	var parameters = {
		width: 10,
		height: 20,
		depth: 30,
		widthSegments: 2,
		heightSegments: 3,
		depthSegments: 4,
	};

	var geometries;
	var box, cube, boxWithSegments;

	QUnit.module( "Extras - Geometries - BoxGeometry", {

		beforeEach: function() {

			box = new THREE.BoxGeometry( parameters.width, parameters.height, parameters.depth );
			cube = new THREE.CubeGeometry( parameters.width, parameters.height, parameters.depth );
			boxWithSegments = new THREE.BoxGeometry( parameters.width, parameters.height, parameters.depth,
													 parameters.widthSegments, parameters.heightSegments, parameters.depthSegments );

			geometries = [ box, cube, boxWithSegments ];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
