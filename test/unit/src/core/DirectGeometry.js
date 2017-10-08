/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "DirectGeometry" );

QUnit.test( "computeGroups", function ( assert ) {

	var a = new THREE.DirectGeometry();
	var b = new THREE.Geometry();
	var expected = [
		{ start: 0, materialIndex: 0, count: 3 },
		{ start: 3, materialIndex: 1, count: 3 },
		{ start: 6, materialIndex: 2, count: 6 }
	];

	// we only care for materialIndex
	b.faces.push(
		new THREE.Face3( 0, 0, 0, undefined, undefined, 0 ),
		new THREE.Face3( 0, 0, 0, undefined, undefined, 1 ),
		new THREE.Face3( 0, 0, 0, undefined, undefined, 2 ),
		new THREE.Face3( 0, 0, 0, undefined, undefined, 2 )
	);

	a.computeGroups( b );

	assert.deepEqual( a.groups, expected, "Groups are as expected" );

} );

QUnit.test( "fromGeometry", function ( assert ) {

	var a = new THREE.DirectGeometry();

	var asyncDone = assert.async(); // tell QUnit when we're done with async stuff

	var loader = new THREE.JSONLoader();
	loader.load( "../../examples/models/skinned/simple/simple.js", function ( geometry ) {

		a.fromGeometry( geometry );

		var tmp = new THREE.DirectGeometry();
		tmp.computeGroups( geometry );
		assert.deepEqual( a.groups, tmp.groups, "Check groups" );

		var morphTargets = geometry.morphTargets;
		var morphTargetsLength = morphTargets.length;

		var morphTargetsPosition;

		if ( morphTargetsLength > 0 ) {

			morphTargetsPosition = [];

			for ( var i = 0; i < morphTargetsLength; i ++ ) {

				morphTargetsPosition[ i ] = [];

			}

			morphTargets.position = morphTargetsPosition;

		}

		var morphNormals = geometry.morphNormals;
		var morphNormalsLength = morphNormals.length;

		var morphTargetsNormal;

		if ( morphNormalsLength > 0 ) {

			morphTargetsNormal = [];

			for ( var i = 0; i < morphNormalsLength; i ++ ) {

				morphTargetsNormal[ i ] = [];

			}

			morphTargets.normal = morphTargetsNormal;

		}

		var vertices = [];
		var normals = [];
		var colors = [];
		var uvs = [];
		var uvs2 = [];
		var skinIndices = [];
		var skinWeights = [];

		var hasFaceVertexUv = geometry.faceVertexUvs[ 0 ] && geometry.faceVertexUvs[ 0 ].length > 0;
		var hasFaceVertexUv2 = geometry.faceVertexUvs[ 1 ] && geometry.faceVertexUvs[ 1 ].length > 0;

		var hasSkinIndices = geometry.skinIndices.length === geometry.vertices.length;
		var hasSkinWeights = geometry.skinWeights.length === geometry.vertices.length;

		for ( var i = 0; i < geometry.faces.length; i ++ ) {

			var face = geometry.faces[ i ];

			vertices.push(
				geometry.vertices[ face.a ],
				geometry.vertices[ face.b ],
				geometry.vertices[ face.c ]
			);

			var vertexNormals = face.vertexNormals;

			if ( vertexNormals.length === 3 ) {

				normals.push( vertexNormals[ 0 ], vertexNormals[ 1 ], vertexNormals[ 2 ] );

			} else {

				normals.push( face.normal, face.normal, face.normal );

			}

			var vertexColors = face.vertexColors;

			if ( vertexColors.length === 3 ) {

				colors.push( vertexColors[ 0 ], vertexColors[ 1 ], vertexColors[ 2 ] );

			} else {

				colors.push( face.color, face.color, face.color );

			}

			if ( hasFaceVertexUv === true ) {

				var vertexUvs = geometry.faceVertexUvs[ 0 ][ i ];

				if ( vertexUvs !== undefined ) {

					uvs.push( vertexUvs[ 0 ], vertexUvs[ 1 ], vertexUvs[ 2 ] );

				} else {

					uvs.push( new Vector2(), new Vector2(), new Vector2() );

				}

			}

			if ( hasFaceVertexUv2 === true ) {

				var vertexUvs = geometry.faceVertexUvs[ 1 ][ i ];

				if ( vertexUvs !== undefined ) {

					uvs2.push( vertexUvs[ 0 ], vertexUvs[ 1 ], vertexUvs[ 2 ] );

				} else {

					uvs2.push( new Vector2(), new Vector2(), new Vector2() );

				}

			}

			// morphs

			for ( var j = 0; j < morphTargetsLength; j ++ ) {

				var morphTarget = morphTargets[ j ].vertices;

				morphTargetsPosition[ j ].push(
					morphTarget[ face.a ],
					morphTarget[ face.b ],
					morphTarget[ face.c ]
				);

			}

			for ( var j = 0; j < morphNormalsLength; j ++ ) {

				var morphNormal = morphNormals[ j ].vertexNormals[ i ];

				morphTargetsNormal[ j ].push( morphNormal.a, morphNormal.b, morphNormal.c );

			}

			// skins

			if ( hasSkinIndices ) {

				skinIndices.push(
					geometry.skinIndices[ face.a ],
					geometry.skinIndices[ face.b ],
					geometry.skinIndices[ face.c ]
				);

			}

			if ( hasSkinWeights ) {

				skinWeights.push(
					geometry.skinWeights[ face.a ],
					geometry.skinWeights[ face.b ],
					geometry.skinWeights[ face.c ]
				);

			}

		}

		assert.deepEqual( a.vertices, vertices, "Vertices are identical" );
		assert.deepEqual( a.normals, normals, "Normals are identical" );
		assert.deepEqual( a.colors, colors, "Colors are identical" );
		assert.deepEqual( a.uvs, uvs, "UV coordinates are identical" );
		assert.deepEqual( a.uvs2, uvs2, "UV(2) coordinates are identical" );
		assert.deepEqual( a.skinIndices, skinIndices, "SkinIndices are identical" );
		assert.deepEqual( a.skinWeights, skinWeights, "SkinWeights are identical" );
		assert.deepEqual( a.morphTargetsPosition, morphTargetsPosition, "MorphTargets (Position) are identical" );
		assert.deepEqual( a.morphTargetsNormal, morphTargetsNormal, "MorphTargets (Normals) are identical" );

		asyncDone();

	} );

} );
