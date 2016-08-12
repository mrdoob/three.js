(function () {

	'use strict';

	var parameters = {
		radius: 10,
		widthSegments: 20,
		heightSegments: 30,
		phiStart: 0.5,
		phiLength: 1.0,
		thetaStart: 0.4,
		thetaLength: 2.0,
	};

	var geometries;

	QUnit.module( "Extras - Geometries - SphereBufferGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.SphereBufferGeometry(),
				new THREE.SphereBufferGeometry( parameters.radius ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart, parameters.thetaLength ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

	function computeFaceAdjacency(geometry) {

		var inverse = new Map();
		var neighbors = new Map();

		// For each face, look at each vertex and
		// associate the face with that vertex.
		for ( var face of geometry.faces ) {

			var faceVertices = [ "a", "b", "c" ];

			for (var vertexIndex of faceVertices) {

				var vertex = face[ vertexIndex ];

				if ( ! (inverse.has( vertex ) ) ) {

					inverse.set( vertex, [] );

				}

				inverse.get( vertex ).push( face );
			}
		}

		for ( face of geometry.faces ) {

			neighbors.set(face, []);

		}

		for ( var face of geometry.faces ) {

			var faceVertices = [ "a", "b", "c" ];
			var adjacents = new Map();

			for ( var vertexIndex of faceVertices ) {

				var vertex = face[vertexIndex];

				for ( var adjacentFace of inverse.get(vertex) ) {

					if ( !adjacents.has(adjacentFace) ) {

						adjacents.set( adjacentFace, 0 );

					}

					adjacents.set( adjacentFace, adjacents.get( adjacentFace ) + 1 );
				}

			}

			for ( var entry of adjacents ) {

				var adjacentFace = entry[ 0 ];
				var count = entry[ 1 ];

				if ( count === 2 ) {

					neighbors.get( face ).push( adjacentFace );

				}

			}

		}

		return neighbors;

	}

	QUnit.test( "A closed sphere should have all faces have exactly 3 neighbors", function( assert ) {
 
		var sphere = new THREE.SphereGeometry();
		var neighborsMap = computeFaceAdjacency(sphere);

		for ( var face of sphere.faces ) {
			assert.equal(neighborsMap.get(face).length, 3, "Expected face to have three neighbors");
		}
    });

})();
