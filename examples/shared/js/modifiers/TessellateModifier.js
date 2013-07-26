/**
 * Break faces with edges longer than maxEdgeLength
 * - not recursive
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TessellateModifier = function ( maxEdgeLength ) {

	this.maxEdgeLength = maxEdgeLength;

};

THREE.TessellateModifier.prototype.modify = function ( geometry ) {

	var i, il, face,
	a, b, c, d,
	va, vb, vc, vd,
	dab, dbc, dac, dcd, dad,
	m, m1, m2,
	vm, vm1, vm2,
	vnm, vnm1, vnm2,
	vcm, vcm1, vcm2,
	triA, triB,
	quadA, quadB,
	edge;

	var faces = [];
	var faceVertexUvs = [];
	var maxEdgeLength = this.maxEdgeLength;

	for ( i = 0, il = geometry.faceVertexUvs.length; i < il; i ++ ) {

		faceVertexUvs[ i ] = [];

	}

	for ( i = 0, il = geometry.faces.length; i < il; i ++ ) {

		face = geometry.faces[ i ];

		if ( face instanceof THREE.Face3 ) {

			a = face.a;
			b = face.b;
			c = face.c;

			va = geometry.vertices[ a ];
			vb = geometry.vertices[ b ];
			vc = geometry.vertices[ c ];

			dab = va.distanceTo( vb );
			dbc = vb.distanceTo( vc );
			dac = va.distanceTo( vc );

			if ( dab > maxEdgeLength || dbc > maxEdgeLength || dac > maxEdgeLength ) {

				m = geometry.vertices.length;

				triA = face.clone();
				triB = face.clone();

				if ( dab >= dbc && dab >= dac ) {

					vm = va.clone();
					vm.lerp( vb, 0.5 );

					triA.a = a;
					triA.b = m;
					triA.c = c;

					triB.a = m;
					triB.b = b;
					triB.c = c;

					if ( face.vertexNormals.length === 3 ) {

						vnm = face.vertexNormals[ 0 ].clone();
						vnm.lerp( face.vertexNormals[ 1 ], 0.5 );

						triA.vertexNormals[ 1 ].copy( vnm );
						triB.vertexNormals[ 0 ].copy( vnm );

					}

					if ( face.vertexColors.length === 3 ) {

						vcm = face.vertexColors[ 0 ].clone();
						vcm.lerp( face.vertexColors[ 1 ], 0.5 );

						triA.vertexColors[ 1 ].copy( vcm );
						triB.vertexColors[ 0 ].copy( vcm );

					}

					edge = 0;

				} else if ( dbc >= dab && dbc >= dac ) {

					vm = vb.clone();
					vm.lerp( vc, 0.5 );

					triA.a = a;
					triA.b = b;
					triA.c = m;

					triB.a = m;
					triB.b = c;
					triB.c = a;

					if ( face.vertexNormals.length === 3 ) {

						vnm = face.vertexNormals[ 1 ].clone();
						vnm.lerp( face.vertexNormals[ 2 ], 0.5 );

						triA.vertexNormals[ 2 ].copy( vnm );

						triB.vertexNormals[ 0 ].copy( vnm );
						triB.vertexNormals[ 1 ].copy( face.vertexNormals[ 2 ] );
						triB.vertexNormals[ 2 ].copy( face.vertexNormals[ 0 ] );

					}

					if ( face.vertexColors.length === 3 ) {

						vcm = face.vertexColors[ 1 ].clone();
						vcm.lerp( face.vertexColors[ 2 ], 0.5 );

						triA.vertexColors[ 2 ].copy( vcm );

						triB.vertexColors[ 0 ].copy( vcm );
						triB.vertexColors[ 1 ].copy( face.vertexColors[ 2 ] );
						triB.vertexColors[ 2 ].copy( face.vertexColors[ 0 ] );

					}

					edge = 1;

				} else {

					vm = va.clone();
					vm.lerp( vc, 0.5 );

					triA.a = a;
					triA.b = b;
					triA.c = m;

					triB.a = m;
					triB.b = b;
					triB.c = c;

					if ( face.vertexNormals.length === 3 ) {

						vnm = face.vertexNormals[ 0 ].clone();
						vnm.lerp( face.vertexNormals[ 2 ], 0.5 );

						triA.vertexNormals[ 2 ].copy( vnm );
						triB.vertexNormals[ 0 ].copy( vnm );

					}

					if ( face.vertexColors.length === 3 ) {

						vcm = face.vertexColors[ 0 ].clone();
						vcm.lerp( face.vertexColors[ 2 ], 0.5 );

						triA.vertexColors[ 2 ].copy( vcm );
						triB.vertexColors[ 0 ].copy( vcm );

					}

					edge = 2;

				}

				faces.push( triA, triB );
				geometry.vertices.push( vm );

				var j, jl, uvs, uvA, uvB, uvC, uvM, uvsTriA, uvsTriB;

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					if ( geometry.faceVertexUvs[ j ].length ) {

						uvs = geometry.faceVertexUvs[ j ][ i ];

						uvA = uvs[ 0 ];
						uvB = uvs[ 1 ];
						uvC = uvs[ 2 ];

						// AB

						if ( edge === 0 ) {

							uvM = uvA.clone();
							uvM.lerp( uvB, 0.5 );

							uvsTriA = [ uvA.clone(), uvM.clone(), uvC.clone() ];
							uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

						// BC

						} else if ( edge === 1 ) {

							uvM = uvB.clone();
							uvM.lerp( uvC, 0.5 );

							uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
							uvsTriB = [ uvM.clone(), uvC.clone(), uvA.clone() ];

						// AC

						} else {

							uvM = uvA.clone();
							uvM.lerp( uvC, 0.5 );

							uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
							uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

						}

						faceVertexUvs[ j ].push( uvsTriA, uvsTriB );

					}

				}

			} else {

				faces.push( face );

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

				}

			}

		} else {

			a = face.a;
			b = face.b;
			c = face.c;
			d = face.d;

			va = geometry.vertices[ a ];
			vb = geometry.vertices[ b ];
			vc = geometry.vertices[ c ];
			vd = geometry.vertices[ d ];

			dab = va.distanceTo( vb );
			dbc = vb.distanceTo( vc );
			dcd = vc.distanceTo( vd );
			dad = va.distanceTo( vd );

			if ( dab > maxEdgeLength || dbc > maxEdgeLength || dcd > maxEdgeLength || dad > maxEdgeLength ) {

				m1 = geometry.vertices.length;
				m2 = geometry.vertices.length + 1;

				quadA = face.clone();
				quadB = face.clone();

				if ( ( dab >= dbc && dab >= dcd && dab >= dad ) || ( dcd >= dbc && dcd >= dab && dcd >= dad ) ) {

					vm1 = va.clone();
					vm1.lerp( vb, 0.5 );

					vm2 = vc.clone();
					vm2.lerp( vd, 0.5 );

					quadA.a = a;
					quadA.b = m1;
					quadA.c = m2;
					quadA.d = d;

					quadB.a = m1;
					quadB.b = b;
					quadB.c = c;
					quadB.d = m2;

					if ( face.vertexNormals.length === 4 ) {

						vnm1 = face.vertexNormals[ 0 ].clone();
						vnm1.lerp( face.vertexNormals[ 1 ], 0.5 );

						vnm2 = face.vertexNormals[ 2 ].clone();
						vnm2.lerp( face.vertexNormals[ 3 ], 0.5 );

						quadA.vertexNormals[ 1 ].copy( vnm1 );
						quadA.vertexNormals[ 2 ].copy( vnm2 );

						quadB.vertexNormals[ 0 ].copy( vnm1 );
						quadB.vertexNormals[ 3 ].copy( vnm2 );

					}

					if ( face.vertexColors.length === 4 ) {

						vcm1 = face.vertexColors[ 0 ].clone();
						vcm1.lerp( face.vertexColors[ 1 ], 0.5 );

						vcm2 = face.vertexColors[ 2 ].clone();
						vcm2.lerp( face.vertexColors[ 3 ], 0.5 );

						quadA.vertexColors[ 1 ].copy( vcm1 );
						quadA.vertexColors[ 2 ].copy( vcm2 );

						quadB.vertexColors[ 0 ].copy( vcm1 );
						quadB.vertexColors[ 3 ].copy( vcm2 );

					}

					edge = 0;

				} else {

					vm1 = vb.clone();
					vm1.lerp( vc, 0.5 );

					vm2 = vd.clone();
					vm2.lerp( va, 0.5 );

					quadA.a = a;
					quadA.b = b;
					quadA.c = m1;
					quadA.d = m2;

					quadB.a = m2;
					quadB.b = m1;
					quadB.c = c;
					quadB.d = d;

					if ( face.vertexNormals.length === 4 ) {

						vnm1 = face.vertexNormals[ 1 ].clone();
						vnm1.lerp( face.vertexNormals[ 2 ], 0.5 );

						vnm2 = face.vertexNormals[ 3 ].clone();
						vnm2.lerp( face.vertexNormals[ 0 ], 0.5 );

						quadA.vertexNormals[ 2 ].copy( vnm1 );
						quadA.vertexNormals[ 3 ].copy( vnm2 );

						quadB.vertexNormals[ 0 ].copy( vnm2 );
						quadB.vertexNormals[ 1 ].copy( vnm1 );

					}

					if ( face.vertexColors.length === 4 ) {

						vcm1 = face.vertexColors[ 1 ].clone();
						vcm1.lerp( face.vertexColors[ 2 ], 0.5 );

						vcm2 = face.vertexColors[ 3 ].clone();
						vcm2.lerp( face.vertexColors[ 0 ], 0.5 );

						quadA.vertexColors[ 2 ].copy( vcm1 );
						quadA.vertexColors[ 3 ].copy( vcm2 );

						quadB.vertexColors[ 0 ].copy( vcm2 );
						quadB.vertexColors[ 1 ].copy( vcm1 );

					}

					edge = 1;

				}

				faces.push( quadA, quadB );
				geometry.vertices.push( vm1, vm2 );

				var j, jl, uvs, uvA, uvB, uvC, uvD, uvM1, uvM2, uvsQuadA, uvsQuadB;

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					if ( geometry.faceVertexUvs[ j ].length ) {

						uvs = geometry.faceVertexUvs[ j ][ i ];

						uvA = uvs[ 0 ];
						uvB = uvs[ 1 ];
						uvC = uvs[ 2 ];
						uvD = uvs[ 3 ];

						// AB + CD

						if ( edge === 0 ) {

							uvM1 = uvA.clone();
							uvM1.lerp( uvB, 0.5 );

							uvM2 = uvC.clone();
							uvM2.lerp( uvD, 0.5 );

							uvsQuadA = [ uvA.clone(), uvM1.clone(), uvM2.clone(), uvD.clone() ];
							uvsQuadB = [ uvM1.clone(), uvB.clone(), uvC.clone(), uvM2.clone() ];

						// BC + AD

						} else {

							uvM1 = uvB.clone();
							uvM1.lerp( uvC, 0.5 );

							uvM2 = uvD.clone();
							uvM2.lerp( uvA, 0.5 );

							uvsQuadA = [ uvA.clone(), uvB.clone(), uvM1.clone(), uvM2.clone() ];
							uvsQuadB = [ uvM2.clone(), uvM1.clone(), uvC.clone(), uvD.clone() ];

						}

						faceVertexUvs[ j ].push( uvsQuadA, uvsQuadB );

					}

				}

			} else {

				faces.push( face );

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

				}

			}

		}

	}

	geometry.faces = faces;
	geometry.faceVertexUvs = faceVertexUvs;

}
