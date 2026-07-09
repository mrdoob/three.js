import {
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	Vector2,
	Vector3,
	Vector4,
} from 'three';

import { mergeVertices } from '../utils/BufferGeometryUtils.js';

const _cb = new Vector3(),
	_ab = new Vector3();

/**
 * This class can be used to modify a geometry by simplifying it. A typical use
 * case for such a modifier is automatic LOD generation.
 *
 * The implementation is based on [Progressive Mesh type Polygon Reduction Algorithm](https://web.archive.org/web/20230610044040/http://www.melax.com/polychop/)
 * by Stan Melax in 1998.
 *
 * ```js
 * const modifier = new SimplifyModifier();
 * geometry = modifier.modify( geometry );
 * ```
 *
 * @three_import import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
 */
class SimplifyModifier {

	/**
	 * Returns a new, modified version of the given geometry by applying a simplification.
	 * Please note that the resulting geometry is always non-indexed.
	 *
	 * @param {BufferGeometry} geometry - The geometry to modify.
	 * @param {number} count - The number of vertices to remove.
	 * @param {Array<string>} [ignoredAttributes=[]] - The attributes to be kept the same and excluded from simplification.
	 * @param {Object} [config] - The config for the attributes
	 * @return {BufferGeometry} A new, modified geometry.
	 */
	modify( geometry, count, ignoredAttributes = [], config = {} ) {

		geometry = geometry.clone();

		const LOCKED = config[ 'locked' ] ?? false;

		// currently morphAttributes are not supported
		delete geometry.morphAttributes.position;
		delete geometry.morphAttributes.normal;
		const attributes = geometry.attributes;

		//filter ignoredAttributes
		for ( const name of [ ...ignoredAttributes ] ) {

			if ( attributes[ name ] == undefined ) {

				ignoredAttributes.splice( ignoredAttributes.indexOf( name ), 1 );

			}

		}

		// make sure position attribute is not ignored
		if ( ignoredAttributes.includes( 'position' ) ) {

			console.warn(
				'THREE.SimplifyModifier: position-attribute can\'t be igored!',
			);

		}

		// delete all non-ignored attributes, that are not part of the essential attributes
		for ( const name in attributes ) {

			if (
				name !== 'position' &&
				name !== 'uv' &&
				name !== 'normal' &&
				name !== 'tangent' &&
				name !== 'color' &&
				! ignoredAttributes.includes( name )
			)
				geometry.deleteAttribute( name );

		}

		geometry = mergeVertices( geometry, 1e-5, ignoredAttributes );

		//
		// put data of original geometry in different data structures
		//

		const positionAttribute = geometry.getAttribute( 'position' );

		// load all non-ignored attributes
		const uvAttribute = ignoredAttributes.includes( 'uv' )
			? undefined
			: geometry.getAttribute( 'uv' );
		const normalAttribute = ignoredAttributes.includes( 'normal' )
			? undefined
			: geometry.getAttribute( 'normal' );
		const tangentAttribute = ignoredAttributes.includes( 'tangent' )
			? undefined
			: geometry.getAttribute( 'tangent' );
		const colorAttribute = ignoredAttributes.includes( 'color' )
			? undefined
			: geometry.getAttribute( 'color' );

		let t = null;
		let v2 = null;
		let nor = null;
		let col = null;

		const vertices = [];

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			const v = new Vector3().fromBufferAttribute( positionAttribute, i );

			if ( uvAttribute ) {

				v2 = new Vector2().fromBufferAttribute( uvAttribute, i );

			}

			if ( normalAttribute ) {

				nor = new Vector3().fromBufferAttribute( normalAttribute, i );

			}

			if ( tangentAttribute ) {

				t = new Vector4().fromBufferAttribute( tangentAttribute, i );

			}

			if ( colorAttribute ) {

				col = new Color().fromBufferAttribute( colorAttribute, i );

			}

			// fill ignored attributes data into triangle, store itemSize, constructor of the attribute and of the TypedArray to reproduce the exact data later
			const otherAttributes = {};

			for ( const name of ignoredAttributes ) {

				const attr = geometry.getAttribute( name );

				const arr = attr.array;
				otherAttributes[ name ] = {
					data: Array.from(
						arr.slice( i * attr.itemSize, ( i + 1 ) * attr.itemSize ),
					), // per item data for the attribute
					size: attr.itemSize, // per item size
					constructor: attr.constructor, // constructor of the attribute
					arrConstructor: arr.constructor, // constructor of the TypedArray
				};

			}

			const vertex = new Vertex( v, v2, nor, t, col, otherAttributes );
			vertices.push( vertex );

		}

		// add faces
		const faces = [];

		let index = geometry.getIndex();

		if ( index !== null ) {

			for ( let i = 0; i < index.count; i += 3 ) {

				const a = index.getX( i );
				const b = index.getX( i + 1 );
				const c = index.getX( i + 2 );

				const triangle = new Triangle(
					vertices[ a ],
					vertices[ b ],
					vertices[ c ],
					a,
					b,
					c,
				);
				faces.push( triangle );

			}

		} else {

			for ( let i = 0; i < positionAttribute.count; i += 3 ) {

				const a = i;
				const b = i + 1;
				const c = i + 2;

				const triangle = new Triangle(
					vertices[ a ],
					vertices[ b ],
					vertices[ c ],
					a,
					b,
					c,
				);
				faces.push( triangle );

			}

		}

		// compute all edge collapse costs

		for ( let i = 0, il = vertices.length; i < il; i ++ ) {

			computeEdgeCostAtVertex( vertices[ i ], LOCKED );

		}

		let nextVertex;

		let z = count;

		let err = 0;

		while ( z -- ) {

			// repeat for number of vertices to remove
			nextVertex = minimumCostEdge( vertices );

			if ( ! nextVertex ) {

				console.warn( 'THREE.SimplifyModifier: No next vertex' );
				break;

			}

			if ( nextVertex.collapseCost == Infinity ) {

				console.warn(
					'THREE.SimplifyModifier: No next vertex; Only border is left',
				);
				break;

			}

			err += nextVertex.collapseCost;

			collapse(
				vertices,
				faces,
				nextVertex,
				nextVertex.collapseNeighbor,
				LOCKED,
			);

		}

		this.error = err;
		//

		const simplifiedGeometry = new BufferGeometry();
		const position = [];
		const uv = [];
		const normal = [];
		const tangent = [];
		const color = [];
		const otherAttributes = {};

		index = [];

		//pre-load all data from vertices and the attribute and the TypedArray constructor

		for ( const name of ignoredAttributes ) {

			otherAttributes[ name ] = {
				size: undefined,
				constructor: undefined,
				arrConstructor: undefined,
				array: [],
			};

		}

		for ( let i = 0; i < vertices.length; i ++ ) {

			const vertex = vertices[ i ];
			position.push(
				vertex.position.x,
				vertex.position.y,
				vertex.position.z,
			);
			if ( vertex.uv ) {

				uv.push( vertex.uv.x, vertex.uv.y );

			}

			if ( vertex.normal ) {

				normal.push( vertex.normal.x, vertex.normal.y, vertex.normal.z );

			}

			if ( vertex.tangent ) {

				tangent.push(
					vertex.tangent.x,
					vertex.tangent.y,
					vertex.tangent.z,
					vertex.tangent.w,
				);

			}

			if ( vertex.color ) {

				color.push( vertex.color.r, vertex.color.g, vertex.color.b );

			}

			// load data of the ignored attributes
			for ( const name in vertex.otherAttributes ) {

				if ( otherAttributes[ name ].size == undefined ) {

					// load itemSize
					otherAttributes[ name ].size =
						vertex.otherAttributes[ name ].size;

				}

				if ( otherAttributes[ name ].constructor == undefined ) {

					// load attribute constructor
					otherAttributes[ name ].constructor =
						vertex.otherAttributes[ name ].constructor;

				}

				if ( otherAttributes[ name ].arrConstructor == undefined ) {

					// load TypedArray constructor
					otherAttributes[ name ].arrConstructor =
						vertex.otherAttributes[ name ].arrConstructor;

				}

				otherAttributes[ name ].array.push(
					vertex.otherAttributes[ name ].data,
				);

			}

			// cache final index to GREATLY speed up faces reconstruction
			vertex.id = i;

		}

		//

		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];
			index.push( face.v1.id, face.v2.id, face.v3.id );

		}

		simplifiedGeometry.setAttribute(
			'position',
			new Float32BufferAttribute( position, 3 ),
		);
		if ( uv.length > 0 )
			simplifiedGeometry.setAttribute(
				'uv',
				new Float32BufferAttribute( uv, 2 ),
			);
		if ( normal.length > 0 )
			simplifiedGeometry.setAttribute(
				'normal',
				new Float32BufferAttribute( normal, 3 ),
			);
		if ( tangent.length > 0 )
			simplifiedGeometry.setAttribute(
				'tangent',
				new Float32BufferAttribute( tangent, 4 ),
			);
		if ( color.length > 0 )
			simplifiedGeometry.setAttribute(
				'color',
				new Float32BufferAttribute( color, 3 ),
			);

		// load all igmored attributes with the stored data and constructors
		for ( const name in otherAttributes ) {

			simplifiedGeometry.setAttribute(
				name,
				new otherAttributes[ name ].constructor(
					new otherAttributes[ name ].arrConstructor(
						otherAttributes[ name ].array.flat(),
					),
					otherAttributes[ name ].size,
				),
			);

		}

		simplifiedGeometry.setIndex( index );

		return simplifiedGeometry;

	}

}

function pushIfUnique( array, object ) {

	if ( array.indexOf( object ) === - 1 ) array.push( object );

}

function removeFromArray( array, object ) {

	const k = array.indexOf( object );
	if ( k > - 1 ) array.splice( k, 1 );

}

function computeEdgeCollapseCost( u, v, locked ) {

	// if we collapse edge uv by moving u to v then how
	// much different will the model change, i.e. the 'error'.

	const edgelength = v.position.distanceTo( u.position );
	let curvature = 0;

	const sideFaces = [];

	// find the 'sides' triangles that are on the edge uv
	for ( let i = 0, il = u.faces.length; i < il; i ++ ) {

		const face = u.faces[ i ];

		if ( face.hasVertex( v ) ) {

			sideFaces.push( face );

		}

	}

	// use the triangle facing most away from the sides
	// to determine our curvature term
	for ( let i = 0, il = u.faces.length; i < il; i ++ ) {

		let minCurvature = 1;
		const face = u.faces[ i ];

		for ( let j = 0; j < sideFaces.length; j ++ ) {

			const sideFace = sideFaces[ j ];
			// use dot product of face normals.
			const dotProd = face.normal.dot( sideFace.normal );
			minCurvature = Math.min( minCurvature, ( 1.001 - dotProd ) / 2 );

		}

		curvature = Math.max( curvature, minCurvature );

	}

	if ( locked ) {

		if ( checkBorder( u ) || checkBorder( v ) ) return Infinity;

	}

	// crude approach in attempt to preserve borders
	// though it seems not to be totally correct
	const borders = 0;

	if ( sideFaces.length < 2 ) {

		// we add some arbitrary cost for borders,
		// borders += 10;
		curvature = 1;

	}

	if ( ! testCollapse( u, v ) ) return Infinity;

	const amt = edgelength * curvature + borders;

	return amt;

}

function checkBorder( vertex ) {

	if ( vertex.border !== undefined ) return vertex.border;

	for ( const f of vertex.faces ) {

		// for all triangles connected to the vertex
		const edges = f.getEdgesWith( vertex );

		for ( const e of edges ) {

			// go over all edges including the vertex
			const otherVertex = e[ 0 ] == vertex ? e[ 1 ] : e[ 0 ]; // get the vertex on the opposite side of the edge

			let isBorder = true;

			for ( const f2 of vertex.faces ) {

				if ( f == f2 ) continue;

				if ( f2.getEdgesWith( otherVertex ).length > 0 ) {

					// if another face connected to the vertex includes the vertex on the opposite side
					// the edge is not a border
					isBorder = false;

				}

			}

			vertex.border = true;
			if ( isBorder ) return true; // if the edge is a border return true

		}

	}

	vertex.border = false;
	return false;

}

function computeEdgeCostAtVertex( v, locked ) {

	// compute the edge collapse cost for all edges that start
	// from vertex v.  Since we are only interested in reducing
	// the object by selecting the min cost edge at each step, we
	// only cache the cost of the least cost edge at this vertex
	// (in member variable collapse) as well as the value of the
	// cost (in member variable collapseCost).

	if ( v.neighbors.length === 0 ) {

		// collapse if no neighbors.
		v.collapseNeighbor = null;
		v.collapseCost = - 0.01;

		return;

	}

	v.collapseNeighbor = null;

	// search all neighboring edges for 'least cost' edge
	for ( let i = 0; i < v.neighbors.length; i ++ ) {

		const collapseCost = computeEdgeCollapseCost( v, v.neighbors[ i ], locked );

		if ( ! v.collapseNeighbor ) {

			v.collapseNeighbor = v.neighbors[ i ];
			v.collapseCost = collapseCost;
			v.minCost = collapseCost;
			v.totalCost = 0;
			v.costCount = 0;

		}

		if ( collapseCost !== Infinity ) {

			v.costCount ++;
			v.totalCost += collapseCost;

		}


		if ( collapseCost < v.minCost ) {

			// if collapseCost is lowest store it as smallest collapseCost
			v.collapseNeighbor = v.neighbors[ i ];
			v.minCost = collapseCost;

		}

	}

	// we average the cost of collapsing at this vertex

	v.collapseCost = v.totalCost / v.costCount;
	//v.collapseCost = v.minCost;

}

function removeVertex( v, vertices ) {

	console.assert( v.faces.length === 0 );

	while ( v.neighbors.length ) {

		const n = v.neighbors.pop();
		removeFromArray( n.neighbors, v );

	}

	removeFromArray( vertices, v );

}

function removeFace( f, faces ) {

	removeFromArray( faces, f );

	if ( f.v1 ) removeFromArray( f.v1.faces, f );
	if ( f.v2 ) removeFromArray( f.v2.faces, f );
	if ( f.v3 ) removeFromArray( f.v3.faces, f );

	// TODO optimize this!
	const vs = [ f.v1, f.v2, f.v3 ];

	for ( let i = 0; i < 3; i ++ ) {

		const v1 = vs[ i ];
		const v2 = vs[ ( i + 1 ) % 3 ];

		if ( ! v1 || ! v2 ) continue;

		v1.removeIfNonNeighbor( v2 );
		v2.removeIfNonNeighbor( v1 );

	}

}

function collapse( vertices, faces, u, v, locked ) {

	// Collapse the edge uv by moving vertex u onto v

	if ( ! v ) {

		// u is a vertex all by itself so just delete it..
		removeVertex( u, vertices );
		return;

	}

	if ( v.uv ) {

		u.uv.copy( v.uv );

	}

	if ( v.normal ) {

		v.normal.add( u.normal ).normalize();

	}

	if ( v.tangent ) {

		v.tangent.add( u.tangent ).normalize();

	}

	const tmpVertices = [];

	for ( let i = 0; i < u.neighbors.length; i ++ ) {

		tmpVertices.push( u.neighbors[ i ] );

	}

	// delete triangles on edge uv:
	for ( let i = u.faces.length - 1; i >= 0; i -- ) {

		if ( u.faces[ i ] && u.faces[ i ].hasVertex( v ) ) {

			removeFace( u.faces[ i ], faces );

		}

	}

	// update remaining triangles to have v instead of u
	for ( let i = u.faces.length - 1; i >= 0; i -- ) {

		u.faces[ i ].replaceVertex( u, v );

	}

	removeVertex( u, vertices );

	// recompute the edge collapse costs in neighborhood
	for ( let i = 0; i < tmpVertices.length; i ++ ) {

		computeEdgeCostAtVertex( tmpVertices[ i ], locked );

	}

}

function testCollapse( u, v ) {

	// Collapse the edge uv by moving vertex u onto v

	if ( ! v ) {

		return true;

	}

	// update remaining triangles to have v instead of u
	for ( let i = u.faces.length - 1; i >= 0; i -- ) {

		if ( ! ( u.faces[ i ] && u.faces[ i ].hasVertex( v ) ) ) {

			u.faces[ i ].computeNormal();

			const oldNormal = u.faces[ i ].normal.clone();
			u.faces[ i ].computeNormalReplace( u, v );
			const dotRes = u.faces[ i ].normal.dot( oldNormal );
			u.faces[ i ].normal.copy( oldNormal );

			if ( dotRes < 0 ) {

				return false;

			}

		}

	}

	return true;

}

function minimumCostEdge( vertices ) {

	// O(n * n) approach. TODO optimize this

	let least = vertices[ 0 ];

	for ( let i = 0; i < vertices.length; i ++ ) {

		if ( vertices[ i ].collapseCost < least.collapseCost ) {

			least = vertices[ i ];

		}

	}

	return least;

}

// we use a triangle class to represent structure of face slightly differently

class Triangle {

	constructor( v1, v2, v3, a, b, c ) {

		this.a = a;
		this.b = b;
		this.c = c;

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

		this.normal = new Vector3();

		this.computeNormal();

		v1.faces.push( this );
		v1.addUniqueNeighbor( v2 );
		v1.addUniqueNeighbor( v3 );

		v2.faces.push( this );
		v2.addUniqueNeighbor( v1 );
		v2.addUniqueNeighbor( v3 );

		v3.faces.push( this );
		v3.addUniqueNeighbor( v1 );
		v3.addUniqueNeighbor( v2 );

	}

	getEdges() {

		return [
			[ this.v1, this.v2 ],
			[ this.v2, this.v3 ],
			[ this.v3, this.v1 ],
		];

	}

	getArea() {

		// use herons formula
		const a = this.v1.position.distanceTo( this.v2.position );
		const b = this.v2.position.distanceTo( this.v3.position );
		const c = this.v3.position.distanceTo( this.v1.position );

		const s = 0.5 * ( a + b + c );

		return Math.sqrt( s * ( s - a ) * ( s - b ) * ( s - c ) );

	}

	getEdgesWith( vertex ) {

		return this.getEdges().filter(
			( entry ) => entry[ 0 ] == vertex || entry[ 1 ] == vertex,
		);

	}

	computeNormalReplace( u, v ) {

		const vA = this.v1 === u ? v.position : this.v1.position;
		const vB = this.v2 === u ? v.position : this.v2.position;
		const vC = this.v3 === u ? v.position : this.v3.position;

		_cb.subVectors( vC, vB );
		_ab.subVectors( vA, vB );
		_cb.cross( _ab ).normalize();

		this.normal.copy( _cb );

	}

	computeNormal() {

		const vA = this.v1.position;
		const vB = this.v2.position;
		const vC = this.v3.position;

		_cb.subVectors( vC, vB );
		_ab.subVectors( vA, vB );
		_cb.cross( _ab ).normalize();

		this.normal.copy( _cb );

	}

	hasVertex( v ) {

		return v === this.v1 || v === this.v2 || v === this.v3;

	}

	replaceVertex( oldv, newv ) {

		if ( oldv === this.v1 ) this.v1 = newv;
		else if ( oldv === this.v2 ) this.v2 = newv;
		else if ( oldv === this.v3 ) this.v3 = newv;

		removeFromArray( oldv.faces, this );
		newv.faces.push( this );

		oldv.removeIfNonNeighbor( this.v1 );
		this.v1.removeIfNonNeighbor( oldv );

		oldv.removeIfNonNeighbor( this.v2 );
		this.v2.removeIfNonNeighbor( oldv );

		oldv.removeIfNonNeighbor( this.v3 );
		this.v3.removeIfNonNeighbor( oldv );

		this.v1.addUniqueNeighbor( this.v2 );
		this.v1.addUniqueNeighbor( this.v3 );

		this.v2.addUniqueNeighbor( this.v1 );
		this.v2.addUniqueNeighbor( this.v3 );

		this.v3.addUniqueNeighbor( this.v1 );
		this.v3.addUniqueNeighbor( this.v2 );

		this.computeNormal();

	}

}

class Vertex {

	constructor( v, uv, normal, tangent, color, otherAttributes ) {

		this.position = v;
		this.uv = uv;
		this.normal = normal;
		this.tangent = tangent;
		this.color = color;

		this.id = - 1; // external use position in vertices list (for e.g. face generation)

		this.faces = []; // faces vertex is connected
		this.neighbors = []; // neighbouring vertices aka 'adjacentVertices'

		// these will be computed in computeEdgeCostAtVertex()
		this.collapseCost = 0; // cost of collapsing this vertex, the less the better. aka objdist
		this.collapseNeighbor = null; // best candidate for collapsing

		this.otherAttributes = otherAttributes; // stored ignored attributes with their various constructors, itemSize and data

		this.border; //wether this vertex is a border or not

	}

	addUniqueNeighbor( vertex ) {

		pushIfUnique( this.neighbors, vertex );

	}

	removeIfNonNeighbor( n ) {

		const neighbors = this.neighbors;
		const faces = this.faces;

		const offset = neighbors.indexOf( n );

		if ( offset === - 1 ) return;

		for ( let i = 0; i < faces.length; i ++ ) {

			if ( faces[ i ].hasVertex( n ) ) return;

		}

		neighbors.splice( offset, 1 );

	}

}

export { SimplifyModifier };
