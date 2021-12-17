import {
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	Vector2,
	Vector3
} from '../../../build/three.module.js';

/**
 * Break faces with edges longer than maxEdgeLength
 */

class TessellateModifier {

	constructor( maxEdgeLength = 0.1, maxIterations = 6 ) {

		this.maxEdgeLength = maxEdgeLength;
		this.maxIterations = maxIterations;

	}

	modify( geometry ) {

		if ( geometry.isGeometry === true ) {

			console.error( 'THREE.TessellateModifier no longer supports Geometry. Use BufferGeometry instead.' );
			return geometry;

		}

		if ( geometry.index !== null ) {

			geometry = geometry.toNonIndexed();

		}

		//

		const maxIterations = this.maxIterations;
		const maxEdgeLengthSquared = this.maxEdgeLength * this.maxEdgeLength;

		const va = new Vector3();
		const vb = new Vector3();
		const vc = new Vector3();
		const vm = new Vector3();
		const vs = [ va, vb, vc, vm ];

		const na = new Vector3();
		const nb = new Vector3();
		const nc = new Vector3();
		const nm = new Vector3();
		const ns = [ na, nb, nc, nm ];

		const ca = new Color();
		const cb = new Color();
		const cc = new Color();
		const cm = new Color();
		const cs = [ ca, cb, cc, cm ];

		const ua = new Vector2();
		const ub = new Vector2();
		const uc = new Vector2();
		const um = new Vector2();
		const us = [ ua, ub, uc, um ];

		const u2a = new Vector2();
		const u2b = new Vector2();
		const u2c = new Vector2();
		const u2m = new Vector2();
		const u2s = [ u2a, u2b, u2c, u2m ];

		const attributes = geometry.attributes;
		const hasNormals = attributes.normal !== undefined;
		const hasColors = attributes.color !== undefined;
		const hasUVs = attributes.uv !== undefined;
		const hasUV2s = attributes.uv2 !== undefined;

		let positions = attributes.position.array;
		let normals = hasNormals ? attributes.normal.array : null;
		let colors = hasColors ? attributes.color.array : null;
		let uvs = hasUVs ? attributes.uv.array : null;
		let uv2s = hasUV2s ? attributes.uv2.array : null;

		let positions2 = positions;
		let normals2 = normals;
		let colors2 = colors;
		let uvs2 = uvs;
		let uv2s2 = uv2s;

		let iteration = 0;
		let tessellating = true;

		function addTriangle( a, b, c ) {

			const v1 = vs[ a ];
			const v2 = vs[ b ];
			const v3 = vs[ c ];

			positions2.push( v1.x, v1.y, v1.z );
			positions2.push( v2.x, v2.y, v2.z );
			positions2.push( v3.x, v3.y, v3.z );

			if ( hasNormals ) {

				const n1 = ns[ a ];
				const n2 = ns[ b ];
				const n3 = ns[ c ];

				normals2.push( n1.x, n1.y, n1.z );
				normals2.push( n2.x, n2.y, n2.z );
				normals2.push( n3.x, n3.y, n3.z );

			}

			if ( hasColors ) {

				const c1 = cs[ a ];
				const c2 = cs[ b ];
				const c3 = cs[ c ];

				colors2.push( c1.x, c1.y, c1.z );
				colors2.push( c2.x, c2.y, c2.z );
				colors2.push( c3.x, c3.y, c3.z );

			}

			if ( hasUVs ) {

				const u1 = us[ a ];
				const u2 = us[ b ];
				const u3 = us[ c ];

				uvs2.push( u1.x, u1.y );
				uvs2.push( u2.x, u2.y );
				uvs2.push( u3.x, u3.y );

			}

			if ( hasUV2s ) {

				const u21 = u2s[ a ];
				const u22 = u2s[ b ];
				const u23 = u2s[ c ];

				uv2s2.push( u21.x, u21.y );
				uv2s2.push( u22.x, u22.y );
				uv2s2.push( u23.x, u23.y );

			}

		}

		while ( tessellating && iteration < maxIterations ) {

			iteration ++;
			tessellating = false;

			positions = positions2;
			positions2 = [];

			if ( hasNormals ) {

				normals = normals2;
				normals2 = [];

			}

			if ( hasColors ) {

				colors = colors2;
				colors2 = [];

			}

			if ( hasUVs ) {

				uvs = uvs2;
				uvs2 = [];

			}

			if ( hasUV2s ) {

				uv2s = uv2s2;
				uv2s2 = [];

			}

			for ( let i = 0, i2 = 0, il = positions.length; i < il; i += 9, i2 += 6 ) {

				va.fromArray( positions, i + 0 );
				vb.fromArray( positions, i + 3 );
				vc.fromArray( positions, i + 6 );

				if ( hasNormals ) {

					na.fromArray( normals, i + 0 );
					nb.fromArray( normals, i + 3 );
					nc.fromArray( normals, i + 6 );

				}

				if ( hasColors ) {

					ca.fromArray( colors, i + 0 );
					cb.fromArray( colors, i + 3 );
					cc.fromArray( colors, i + 6 );

				}

				if ( hasUVs ) {

					ua.fromArray( uvs, i2 + 0 );
					ub.fromArray( uvs, i2 + 2 );
					uc.fromArray( uvs, i2 + 4 );

				}

				if ( hasUV2s ) {

					u2a.fromArray( uv2s, i2 + 0 );
					u2b.fromArray( uv2s, i2 + 2 );
					u2c.fromArray( uv2s, i2 + 4 );

				}

				const dab = va.distanceToSquared( vb );
				const dbc = vb.distanceToSquared( vc );
				const dac = va.distanceToSquared( vc );

				if ( dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared ) {

					tessellating = true;

					if ( dab >= dbc && dab >= dac ) {

						vm.lerpVectors( va, vb, 0.5 );
						if ( hasNormals ) nm.lerpVectors( na, nb, 0.5 );
						if ( hasColors ) cm.lerpColors( ca, cb, 0.5 );
						if ( hasUVs ) um.lerpVectors( ua, ub, 0.5 );
						if ( hasUV2s ) u2m.lerpVectors( u2a, u2b, 0.5 );

						addTriangle( 0, 3, 2 );
						addTriangle( 3, 1, 2 );

					} else if ( dbc >= dab && dbc >= dac ) {

						vm.lerpVectors( vb, vc, 0.5 );
						if ( hasNormals ) nm.lerpVectors( nb, nc, 0.5 );
						if ( hasColors ) cm.lerpColors( cb, cc, 0.5 );
						if ( hasUVs ) um.lerpVectors( ub, uc, 0.5 );
						if ( hasUV2s ) u2m.lerpVectors( u2b, u2c, 0.5 );

						addTriangle( 0, 1, 3 );
						addTriangle( 3, 2, 0 );

					} else {

						vm.lerpVectors( va, vc, 0.5 );
						if ( hasNormals ) nm.lerpVectors( na, nc, 0.5 );
						if ( hasColors ) cm.lerpColors( ca, cc, 0.5 );
						if ( hasUVs ) um.lerpVectors( ua, uc, 0.5 );
						if ( hasUV2s ) u2m.lerpVectors( u2a, u2c, 0.5 );

						addTriangle( 0, 1, 3 );
						addTriangle( 3, 1, 2 );

					}

				} else {

					addTriangle( 0, 1, 2 );

				}

			}

		}

		const geometry2 = new BufferGeometry();

		geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );

		if ( hasNormals ) {

			geometry2.setAttribute( 'normal', new Float32BufferAttribute( normals2, 3 ) );

		}

		if ( hasColors ) {

			geometry2.setAttribute( 'color', new Float32BufferAttribute( colors2, 3 ) );

		}

		if ( hasUVs ) {

			geometry2.setAttribute( 'uv', new Float32BufferAttribute( uvs2, 2 ) );

		}

		if ( hasUV2s ) {

			geometry2.setAttribute( 'uv2', new Float32BufferAttribute( uv2s2, 2 ) );

		}

		return geometry2;

	}

}

export { TessellateModifier };
