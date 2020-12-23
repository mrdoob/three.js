import {
	BufferGeometry,
	Face3,
	Geometry
} from '../../../build/three.module.js';

/**
 * Break faces with edges longer than maxEdgeLength
 */

var TessellateModifier = function ( maxEdgeLength = 0.1, maxIterations = 6, maxFaces = Infinity ) {

	this.maxEdgeLength = maxEdgeLength;
	this.maxIterations = maxIterations;
	this.maxFaces = maxFaces;

};

// Applies the "modify" pattern
TessellateModifier.prototype.modify = function ( geometry ) {

	const isBufferGeometry = geometry.isBufferGeometry;

	if ( isBufferGeometry ) {

		geometry = new Geometry().fromBufferGeometry( geometry );

	} else {

		geometry = geometry.clone();

	}

	geometry.mergeVertices( 6 );

	let finalized = false;
	let iteration = 0;
	const maxEdgeLengthSquared = this.maxEdgeLength * this.maxEdgeLength;

	let edge;

	while ( ! finalized && iteration < this.maxIterations && geometry.faces.length < this.maxFaces ) {

		const faces = [];
		const faceVertexUvs = [];

		finalized = true;
		iteration ++;

		for ( var i = 0, il = geometry.faceVertexUvs.length; i < il; i ++ ) {

			faceVertexUvs[ i ] = [];

		}

		for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {

			const face = geometry.faces[ i ];

			if ( face instanceof Face3 ) {

				const a = face.a;
				const b = face.b;
				const c = face.c;

				const va = geometry.vertices[ a ];
				const vb = geometry.vertices[ b ];
				const vc = geometry.vertices[ c ];

				const dab = va.distanceToSquared( vb );
				const dbc = vb.distanceToSquared( vc );
				const dac = va.distanceToSquared( vc );

				const limitReached = ( faces.length + il - i ) >= this.maxFaces;

				if ( ! limitReached && ( dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared ) ) {

					finalized = false;

					const m = geometry.vertices.length;

					const triA = face.clone();
					const triB = face.clone();

					if ( dab >= dbc && dab >= dac ) {

						var vm = va.clone();
						vm.lerp( vb, 0.5 );

						triA.a = a;
						triA.b = m;
						triA.c = c;

						triB.a = m;
						triB.b = b;
						triB.c = c;

						if ( face.vertexNormals.length === 3 ) {

							var vnm = face.vertexNormals[ 0 ].clone();
							vnm.lerp( face.vertexNormals[ 1 ], 0.5 );

							triA.vertexNormals[ 1 ].copy( vnm );
							triB.vertexNormals[ 0 ].copy( vnm );

						}

						if ( face.vertexColors.length === 3 ) {

							var vcm = face.vertexColors[ 0 ].clone();
							vcm.lerp( face.vertexColors[ 1 ], 0.5 );

							triA.vertexColors[ 1 ].copy( vcm );
							triB.vertexColors[ 0 ].copy( vcm );

						}

						edge = 0;

					} else if ( dbc >= dab && dbc >= dac ) {

						var vm = vb.clone();
						vm.lerp( vc, 0.5 );

						triA.a = a;
						triA.b = b;
						triA.c = m;

						triB.a = m;
						triB.b = c;
						triB.c = a;

						if ( face.vertexNormals.length === 3 ) {

							var vnm = face.vertexNormals[ 1 ].clone();
							vnm.lerp( face.vertexNormals[ 2 ], 0.5 );

							triA.vertexNormals[ 2 ].copy( vnm );

							triB.vertexNormals[ 0 ].copy( vnm );
							triB.vertexNormals[ 1 ].copy( face.vertexNormals[ 2 ] );
							triB.vertexNormals[ 2 ].copy( face.vertexNormals[ 0 ] );

						}

						if ( face.vertexColors.length === 3 ) {

							var vcm = face.vertexColors[ 1 ].clone();
							vcm.lerp( face.vertexColors[ 2 ], 0.5 );

							triA.vertexColors[ 2 ].copy( vcm );

							triB.vertexColors[ 0 ].copy( vcm );
							triB.vertexColors[ 1 ].copy( face.vertexColors[ 2 ] );
							triB.vertexColors[ 2 ].copy( face.vertexColors[ 0 ] );

						}

						edge = 1;

					} else {

						var vm = va.clone();
						vm.lerp( vc, 0.5 );

						triA.a = a;
						triA.b = b;
						triA.c = m;

						triB.a = m;
						triB.b = b;
						triB.c = c;

						if ( face.vertexNormals.length === 3 ) {

							var vnm = face.vertexNormals[ 0 ].clone();
							vnm.lerp( face.vertexNormals[ 2 ], 0.5 );

							triA.vertexNormals[ 2 ].copy( vnm );
							triB.vertexNormals[ 0 ].copy( vnm );

						}

						if ( face.vertexColors.length === 3 ) {

							var vcm = face.vertexColors[ 0 ].clone();
							vcm.lerp( face.vertexColors[ 2 ], 0.5 );

							triA.vertexColors[ 2 ].copy( vcm );
							triB.vertexColors[ 0 ].copy( vcm );

						}

						edge = 2;

					}

					faces.push( triA, triB );
					geometry.vertices.push( vm );

					for ( var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

						if ( geometry.faceVertexUvs[ j ].length ) {

							const uvs = geometry.faceVertexUvs[ j ][ i ];

							const uvA = uvs[ 0 ];
							const uvB = uvs[ 1 ];
							const uvC = uvs[ 2 ];

							// AB

							if ( edge === 0 ) {

								var uvM = uvA.clone();
								uvM.lerp( uvB, 0.5 );

								var uvsTriA = [ uvA.clone(), uvM.clone(), uvC.clone() ];
								var uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

								// BC

							} else if ( edge === 1 ) {

								var uvM = uvB.clone();
								uvM.lerp( uvC, 0.5 );

								var uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
								var uvsTriB = [ uvM.clone(), uvC.clone(), uvA.clone() ];

								// AC

							} else {

								var uvM = uvA.clone();
								uvM.lerp( uvC, 0.5 );

								var uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
								var uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

							}

							faceVertexUvs[ j ].push( uvsTriA, uvsTriB );

						}

					}

				} else {

					faces.push( face );

					for ( var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

						faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

					}

				}

			}

		}

		geometry.faces = faces;
		geometry.faceVertexUvs = faceVertexUvs;

	}

	if ( isBufferGeometry ) {

		return new BufferGeometry().fromGeometry( geometry );

	} else {

		return geometry;

	}

};

export { TessellateModifier };
