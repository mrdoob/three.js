import {
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	Vector3
} from '../../../build/three.module.js';

/**
 * Break faces with edges longer than maxEdgeLength
 */

var TessellateModifier = function ( maxEdgeLength = 0.1, maxIterations = 6 ) {

	this.maxEdgeLength = maxEdgeLength;
	this.maxIterations = maxIterations;

};

TessellateModifier.prototype.modify = function ( geometry ) {

	if ( geometry.isBufferGeometry !== true ) {

		console.warn( 'TessellateModifier: geometry is not a BufferGeometry.', geometry );
		return geometry;

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

	/*TOFIX?*/

	Color.prototype.lerpColors = function lerpColors( color1, color2, alpha ) {

		this.r += ( color1.r - color2.r ) * alpha;
		this.g += ( color1.g - color2.g ) * alpha;
		this.b += ( color1.b - color2.b ) * alpha;

		return this;

	};

	const attributes = geometry.attributes;
	let positions = attributes.position.array;

	const hasNormals = attributes.normal !== undefined;
	let normals = hasNormals ? attributes.normal.array : null;

	const hasColors = attributes.color !== undefined;
	let colors = hasColors ? attributes.color.array : null;

	let positions2 = positions;
	let normals2 = normals;
	let colors2 = colors;

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

		for ( var i = 0, il = positions.length; i < il; i += 9 ) {

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

			const dab = va.distanceToSquared( vb );
			const dbc = vb.distanceToSquared( vc );
			const dac = va.distanceToSquared( vc );

			if ( dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared ) {

				tessellating = true;

				if ( dab >= dbc && dab >= dac ) {

					vm.lerpVectors( va, vb, 0.5 );
					if ( hasNormals ) nm.lerpVectors( na, nb, 0.5 );
					if ( hasColors ) cm.lerpColors( ca, cb, 0.5 );

					addTriangle( 0, 3, 2 );
					addTriangle( 3, 1, 2 );

				} else if ( dbc >= dab && dbc >= dac ) {

					vm.lerpVectors( vb, vc, 0.5 );
					if ( hasNormals ) nm.lerpVectors( nb, nc, 0.5 );
					if ( hasColors ) cm.lerpColors( cb, cc, 0.5 );

					addTriangle( 0, 1, 3 );
					addTriangle( 3, 2, 0 );

				} else {

					vm.lerpVectors( va, vc, 0.5 );
					if ( hasNormals ) nm.lerpVectors( na, nc, 0.5 );
					if ( hasColors ) cm.lerpColors( ca, cc, 0.5 );

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

	return geometry2;

};

export { TessellateModifier };
