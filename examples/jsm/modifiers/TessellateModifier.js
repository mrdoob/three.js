import {
	BufferGeometry,
	Float32BufferAttribute,
	colorCreate,
	colorFromArray,
	colorLerpColors,
	vec2Create,
	vec2FromArray,
	vec2LerpVectors,
	vec3Create,
	vec3DistanceToSquared,
	vec3FromArray,
	vec3LerpVectors
} from 'three';

/**
 * This class can be used to modify a geometry by breaking its edges if they
 * are longer than maximum length.
 *
 * ```js
 * const modifier = new TessellateModifier( 8, 6 );
 * geometry = modifier.modify( geometry );
 * ```
 *
 * @three_import import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
 */
class TessellateModifier {

	/**
	 * Constructs a new Tessellate modifier.
	 *
	 * @param {number} [maxEdgeLength=0.1] - The maximum edge length.
	 * @param {number} [maxIterations=6] - The number of iterations.
	 */
	constructor( maxEdgeLength = 0.1, maxIterations = 6 ) {

		/**
		 * The maximum edge length.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.maxEdgeLength = maxEdgeLength;

		/**
		 * The maximum edge length.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.maxIterations = maxIterations;

	}

	/**
	 * Returns a new, modified version of the given geometry by applying a tessellation.
	 * Please note that the resulting geometry is always non-indexed.
	 *
	 * @param {BufferGeometry} geometry - The geometry to modify.
	 * @return {BufferGeometry} A new, modified geometry.
	 */
	modify( geometry ) {

		if ( geometry.index !== null ) {

			geometry = geometry.toNonIndexed();

		}

		//

		const maxIterations = this.maxIterations;
		const maxEdgeLengthSquared = this.maxEdgeLength * this.maxEdgeLength;

		const va = vec3Create();
		const vb = vec3Create();
		const vc = vec3Create();
		const vm = vec3Create();
		const vs = [ va, vb, vc, vm ];

		const na = vec3Create();
		const nb = vec3Create();
		const nc = vec3Create();
		const nm = vec3Create();
		const ns = [ na, nb, nc, nm ];

		const ca = colorCreate();
		const cb = colorCreate();
		const cc = colorCreate();
		const cm = colorCreate();
		const cs = [ ca, cb, cc, cm ];

		const ua = vec2Create();
		const ub = vec2Create();
		const uc = vec2Create();
		const um = vec2Create();
		const us = [ ua, ub, uc, um ];

		const u2a = vec2Create();
		const u2b = vec2Create();
		const u2c = vec2Create();
		const u2m = vec2Create();
		const u2s = [ u2a, u2b, u2c, u2m ];

		const attributes = geometry.attributes;
		const hasNormals = attributes.normal !== undefined;
		const hasColors = attributes.color !== undefined;
		const hasUVs = attributes.uv !== undefined;
		const hasUV1s = attributes.uv1 !== undefined;

		let positions = attributes.position.array;
		let normals = hasNormals ? attributes.normal.array : null;
		let colors = hasColors ? attributes.color.array : null;
		let uvs = hasUVs ? attributes.uv.array : null;
		let uv1s = hasUV1s ? attributes.uv1.array : null;

		let positions2 = positions;
		let normals2 = normals;
		let colors2 = colors;
		let uvs2 = uvs;
		let uv1s2 = uv1s;

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

				colors2.push( c1.r, c1.g, c1.b );
				colors2.push( c2.r, c2.g, c2.b );
				colors2.push( c3.r, c3.g, c3.b );

			}

			if ( hasUVs ) {

				const u1 = us[ a ];
				const u2 = us[ b ];
				const u3 = us[ c ];

				uvs2.push( u1.x, u1.y );
				uvs2.push( u2.x, u2.y );
				uvs2.push( u3.x, u3.y );

			}

			if ( hasUV1s ) {

				const u21 = u2s[ a ];
				const u22 = u2s[ b ];
				const u23 = u2s[ c ];

				uv1s2.push( u21.x, u21.y );
				uv1s2.push( u22.x, u22.y );
				uv1s2.push( u23.x, u23.y );

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

			if ( hasUV1s ) {

				uv1s = uv1s2;
				uv1s2 = [];

			}

			for ( let i = 0, i2 = 0, il = positions.length; i < il; i += 9, i2 += 6 ) {

				vec3FromArray( positions, i + 0, va );
				vec3FromArray( positions, i + 3, vb );
				vec3FromArray( positions, i + 6, vc );

				if ( hasNormals ) {

					vec3FromArray( normals, i + 0, na );
					vec3FromArray( normals, i + 3, nb );
					vec3FromArray( normals, i + 6, nc );

				}

				if ( hasColors ) {

					colorFromArray( colors, i + 0, ca );
					colorFromArray( colors, i + 3, cb );
					colorFromArray( colors, i + 6, cc );

				}

				if ( hasUVs ) {

					vec2FromArray( uvs, i2 + 0, ua );
					vec2FromArray( uvs, i2 + 2, ub );
					vec2FromArray( uvs, i2 + 4, uc );

				}

				if ( hasUV1s ) {

					vec2FromArray( uv1s, i2 + 0, u2a );
					vec2FromArray( uv1s, i2 + 2, u2b );
					vec2FromArray( uv1s, i2 + 4, u2c );

				}

				const dab = vec3DistanceToSquared( va, vb );
				const dbc = vec3DistanceToSquared( vb, vc );
				const dac = vec3DistanceToSquared( va, vc );

				if ( dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared ) {

					tessellating = true;

					if ( dab >= dbc && dab >= dac ) {

						vec3LerpVectors( va, vb, 0.5, vm );
						if ( hasNormals ) vec3LerpVectors( na, nb, 0.5, nm );
						if ( hasColors ) colorLerpColors( ca, cb, 0.5, cm );
						if ( hasUVs ) vec2LerpVectors( ua, ub, 0.5, um );
						if ( hasUV1s ) vec2LerpVectors( u2a, u2b, 0.5, u2m );

						addTriangle( 0, 3, 2 );
						addTriangle( 3, 1, 2 );

					} else if ( dbc >= dab && dbc >= dac ) {

						vec3LerpVectors( vb, vc, 0.5, vm );
						if ( hasNormals ) vec3LerpVectors( nb, nc, 0.5, nm );
						if ( hasColors ) colorLerpColors( cb, cc, 0.5, cm );
						if ( hasUVs ) vec2LerpVectors( ub, uc, 0.5, um );
						if ( hasUV1s ) vec2LerpVectors( u2b, u2c, 0.5, u2m );

						addTriangle( 0, 1, 3 );
						addTriangle( 3, 2, 0 );

					} else {

						vec3LerpVectors( va, vc, 0.5, vm );
						if ( hasNormals ) vec3LerpVectors( na, nc, 0.5, nm );
						if ( hasColors ) colorLerpColors( ca, cc, 0.5, cm );
						if ( hasUVs ) vec2LerpVectors( ua, uc, 0.5, um );
						if ( hasUV1s ) vec2LerpVectors( u2a, u2c, 0.5, u2m );

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

		if ( hasUV1s ) {

			geometry2.setAttribute( 'uv1', new Float32BufferAttribute( uv1s2, 2 ) );

		}

		return geometry2;

	}

}

export { TessellateModifier };
