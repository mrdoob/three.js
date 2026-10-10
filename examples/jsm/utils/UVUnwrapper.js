import { Box2, BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from 'three';
import { solveLSCM, triangleFrame } from './UVUnwrapper/LSCM.js';
import { remapAttribute } from './BufferGeometryUtils.js';
import { potpack } from '../libs/potpack.module.js';

/**
 * Generates a unique atlas for the triangle meshes in an Object3D hierarchy.
 * Geometry is measured in world space, cloned per mesh, and replaced atomically.
 * Skinning and morphs are measured in their current pose without changing the
 * underlying position data. Supply the intended bake pose for character maps.
 * Input must use finite CPU-readable per-vertex attributes and complete triangles.
 * Attributes must match the position count; groups must contain complete triangles.
 * Options must be finite and in their documented ranges.
 * Faces below the area tolerance, or subtexel faces failing Float32 validation,
 * retain their geometry with UV (0, 0) and faceCharts -1.
 * Instanced and batched meshes must first be expanded into ordinary meshes.
 *
 * @three_import import { UVUnwrapper } from 'three/addons/utils/UVUnwrapper.js';
 */
class UVUnwrapper {

	/**
	 * @param {Object3D} root - A mesh or hierarchy to unwrap.
	 * @param {Object} [options] - Atlas and chart options.
	 * @param {string} [options.attribute='uv1'] - Output attribute: uv, uv1, uv2, uv3.
	 * @param {string} [options.mode='lightmap'] - 'lightmap' or 'normal'. Normal tries LSCM.
	 * @param {number} [options.resolution=1024] - Square atlas size in pixels, integer >= 4.
	 * @param {number} [options.padding=4] - Nonnegative gutter in pixels; 2 * padding + 1 must be less than resolution.
	 * @param {number} [options.texelsPerUnit=0] - Common world density; zero fits the atlas. Must be nonnegative.
	 * @param {boolean} [options.respectUVSeams] - Cut discontinuities in existing uv (normal default).
	 * @param {boolean} [options.useInputUVs=false] - Preserve valid authored UV charts before trying LSCM.
	 * @return {Object} Atlas dimensions, density, chart bounds and mesh vertex/face mappings.
	 * @throws {Error} If packing or output precision cannot produce a valid atlas. Mesh
	 * geometries remain unchanged on failure; invalid input is outside this contract.
	 */
	unwrap( root, options = {} ) {

		const settings = {
			attribute: 'uv1', mode: 'lightmap', resolution: 1024, padding: 4,
			texelsPerUnit: 0,
			useInputUVs: false,
			...options, maxAreaRatio: 2
		};
		settings.maxStretch = settings.mode === 'normal' ? 2 : 1.5;
		settings.respectUVSeams ??= settings.mode === 'normal';
		root.updateWorldMatrix( true, true );

		const records = [];
		root.traverse( mesh => {

			if ( ! mesh.isMesh ) return;
			records.push( readMesh( mesh, settings ) );

		} );

		const charts = [];
		for ( const record of records ) {

			for ( const faces of growCharts( record, settings ) ) {

				parameterize( record, faces, settings, charts );

			}

		}

		const density = packCharts( charts, settings );
		for ( let i = charts.length - 1; i >= 0; i -- ) {

			if ( ! validateFloat32Chart( charts[ i ], settings, density ) ) charts.splice( i, 1 );

		}

		for ( let i = 0; i < charts.length; i ++ ) {

			for ( const face of charts[ i ].faces ) charts[ i ].record.faceCharts[ face ] = i;

		}

		for ( const record of records ) rebuildGeometry( record, charts, settings );
		const result = {
			attribute: settings.attribute, channel: [ 'uv', 'uv1', 'uv2', 'uv3' ].indexOf( settings.attribute ),
			width: settings.resolution, height: settings.resolution, padding: settings.padding,
			texelsPerUnit: density,
			charts: charts.map( chart => ( { x: chart.box.x, y: chart.box.y, width: chart.box.w, height: chart.box.h } ) ),
			meshes: records.map( record => ( {
				mesh: record.mesh, originalGeometry: record.original, geometry: record.geometry,
				sourceVertices: record.sourceVertices, faceCharts: record.faceCharts
			} ) )
		};
		// Commit only after validation and all result allocations succeed.
		for ( const record of records ) record.mesh.geometry = record.geometry;
		return result;

	}

}

function readMesh( mesh, settings ) {

	mesh.updateMatrixWorld( true ); // Also refresh SkinnedMesh.bindMatrixInverse.
	if ( mesh.isSkinnedMesh ) {

		for ( const bone of mesh.skeleton.bones ) bone.updateWorldMatrix( true, false );

	}

	const geometry = mesh.geometry, position = geometry.getAttribute( 'position' );
	const index = geometry.index;
	const count = index ? index.count : position.count;
	const points = [], welds = [], unique = new Map();
	for ( let i = 0; i < position.count; i ++ ) {

		const p = mesh.getVertexPosition( i, new Vector3() );
		// Exact positional welding only, for topology; output attributes keep original identity.
		const key = `${ p.x },${ p.y },${ p.z }`;
		if ( ! unique.has( key ) ) unique.set( key, unique.size );
		welds.push( unique.get( key ) );
		p.applyMatrix4( mesh.matrixWorld );
		points.push( p );

	}

	const materials = new Int32Array( count / 3 );
	for ( const group of geometry.groups ) {

		materials.fill( group.materialIndex, group.start / 3, ( group.start + group.count ) / 3 );

	}

	const faces = [], edges = new Map();
	for ( let offset = 0; offset < count; offset += 3 ) {

		const vertices = [ 0, 1, 2 ].map( j => index ? index.getX( offset + j ) : offset + j );
		const normal = new Vector3().subVectors( points[ vertices[ 1 ] ], points[ vertices[ 0 ] ] );
		normal.cross( new Vector3().subVectors( points[ vertices[ 2 ] ], points[ vertices[ 0 ] ] ) );
		const area = normal.length() * 0.5;
		const face = { vertices, welds: vertices.map( v => welds[ v ] ), normal: normal.normalize(), area, ignored: float32TriangleArea( ...vertices.map( v => points[ v ] ) ) <= 2 ** - 23, neighbors: [] };
		const f = faces.length;
		faces.push( face );
		if ( face.ignored ) continue;

		for ( let j = 0; j < 3; j ++ ) {

			const a = face.welds[ j ], b = face.welds[ ( j + 1 ) % 3 ];
			const key = a < b ? `${ a },${ b }` : `${ b },${ a }`;
			if ( ! edges.has( key ) ) edges.set( key, [] );
			edges.get( key ).push( { f, j, a, b } );

		}

	}

	const uv = geometry.getAttribute( 'uv' );
	for ( const edge of edges.values() ) {

		if ( edge.length !== 2 ) continue; // Nonmanifold edges are seams.
		const [ a, b ] = edge;
		if ( a.a !== b.b || a.b !== b.a || materials[ a.f ] !== materials[ b.f ] ) continue;
		if ( ( settings.respectUVSeams || settings.useInputUVs ) && uv ) {

			const av = faces[ a.f ].vertices, bv = faces[ b.f ].vertices;
			if ( ! equalUV( uv, av[ a.j ], bv[ ( b.j + 1 ) % 3 ] ) || ! equalUV( uv, av[ ( a.j + 1 ) % 3 ], bv[ b.j ] ) ) continue;

		}

		faces[ a.f ].neighbors.push( b.f );
		faces[ b.f ].neighbors.push( a.f );

	}

	// UV discontinuities can be cuts inside a connected chart (e.g. a slit
	// cylinder). Keep the two coincident seam endpoints distinct in the solver.
	const vertexKeys = welds.map( ( weld, i ) => uv && ( settings.respectUVSeams || settings.useInputUVs ) ? `${ weld },${ uv.getX( i ) },${ uv.getY( i ) }` : weld );
	return { mesh, original: geometry, points, faces, vertexKeys, faceCharts: new Int32Array( faces.length ).fill( - 1 ) };

}

// xatlas tests degeneracy using Float32 geometry, before parameterization.
function float32TriangleArea( a, b, c ) {

	const ab = [ 'x', 'y', 'z' ].map( axis => Math.fround( Math.fround( b[ axis ] ) - Math.fround( a[ axis ] ) ) );
	const ac = [ 'x', 'y', 'z' ].map( axis => Math.fround( Math.fround( c[ axis ] ) - Math.fround( a[ axis ] ) ) );
	const cross = [ 0, 1, 2 ].map( i => {

		const j = ( i + 1 ) % 3, k = ( i + 2 ) % 3;
		return Math.fround( Math.fround( ab[ j ] * ac[ k ] ) - Math.fround( ab[ k ] * ac[ j ] ) );

	} );
	const lengthSquared = Math.fround( Math.fround( Math.fround( cross[ 0 ] ** 2 ) + Math.fround( cross[ 1 ] ** 2 ) ) + Math.fround( cross[ 2 ] ** 2 ) );
	return Math.fround( Math.fround( Math.sqrt( lengthSquared ) ) * 0.5 );

}

function equalUV( uv, a, b ) {

	return uv.getX( a ) === uv.getX( b ) && uv.getY( a ) === uv.getY( b );

}

function growCharts( record, settings ) {

	const assigned = new Uint8Array( record.faces.length ), charts = [];
	// Wider normal cones in normal mode give LSCM useful curved patches to solve.
	const cosine = settings.useInputUVs && record.original.attributes.uv ? - 1 : settings.mode === 'normal' ? 0.35 : 1 / settings.maxStretch;
	for ( let seed = 0; seed < assigned.length; seed ++ ) {

		if ( assigned[ seed ] || record.faces[ seed ].ignored ) continue;
		const faces = [ seed ], normal = record.faces[ seed ].normal;
		assigned[ seed ] = 1;
		for ( let i = 0; i < faces.length && faces.length < 2048; i ++ ) {

			for ( const neighbor of record.faces[ faces[ i ] ].neighbors ) {

				if ( assigned[ neighbor ] || record.faces[ neighbor ].normal.dot( normal ) < cosine ) continue;
				assigned[ neighbor ] = 1;
				faces.push( neighbor );
				if ( faces.length === 2048 ) break;

			}

		}

		charts.push( faces );

	}

	return charts;

}

function parameterize( record, faces, settings, charts ) {

	const normal = new Vector3();
	for ( const f of faces ) normal.addScaledVector( record.faces[ f ].normal, record.faces[ f ].area );
	normal.normalize();
	const axis = Math.abs( normal.x ) < 0.8 ? new Vector3( 1, 0, 0 ) : new Vector3( 0, 1, 0 );
	const u = axis.cross( normal ).normalize(), v = new Vector3().crossVectors( normal, u );
	const vertexMap = new Map(), positions = [], uv = [], triangles = [];
	const origin = record.points[ record.faces[ faces[ 0 ] ].vertices[ 0 ] ];
	let worldArea = 0;
	for ( const f of faces ) {

		const face = record.faces[ f ];
		worldArea += face.area;
		triangles.push( face.vertices.map( vertex => {

			const key = record.vertexKeys[ vertex ];
			if ( ! vertexMap.has( key ) ) {

				vertexMap.set( key, positions.length );
				const p = record.points[ vertex ].clone().sub( origin );
				positions.push( p );
				const inputUV = settings.useInputUVs && record.original.attributes.uv;
				uv.push( inputUV ? [ inputUV.getX( vertex ), inputUV.getY( vertex ) ] : [ p.dot( u ), p.dot( v ) ] );

			}

			return vertexMap.get( key );

		} ) );

	}

	const useInput = settings.useInputUVs && record.original.attributes.uv;
	if ( useInput && triangles.reduce( ( sum, tri ) => sum + cross2( ...tri.map( i => uv[ i ] ) ), 0 ) < 0 ) {

		for ( const p of uv ) p[ 1 ] = - p[ 1 ];

	}

	let candidate = uv;
	const initialQuality = checkChart( positions, triangles, uv, worldArea, settings );
	let quality = initialQuality;
	if ( settings.mode === 'normal' && faces.length > 1 && ! ( initialQuality && ( useInput || initialQuality.maxStretch < 1.000001 ) ) ) {

		const conformal = solveLSCM( positions, triangles, uv );
		const conformalQuality = conformal && checkChart( positions, triangles, conformal, worldArea, settings );
		if ( conformalQuality ) {

			candidate = conformal;
			quality = conformalQuality;

		}

	}

	if ( ! quality ) {

		if ( useInput && faces.length === 1 ) {

			parameterize( record, faces, { ...settings, useInputUVs: false }, charts );
			return;

		}

		if ( faces.length === 1 ) throw new Error( 'UVUnwrapper: triangle cannot be parameterized at this precision.' );
		const half = Math.floor( faces.length / 2 );
		for ( const subset of [ faces.slice( 0, half ), faces.slice( half ) ] ) {

			for ( const component of connectedComponents( record, subset ) ) parameterize( record, component, settings, charts );

		}

		return;

	}

	const scale = Math.sqrt( worldArea / quality.area );
	for ( const p of candidate ) {

		p[ 0 ] *= scale; p[ 1 ] *= scale;

	}

	// Principal-axis alignment reduces rectangle waste without reflection.
	alignChart( candidate );
	const bounds = getBounds( candidate );
	for ( const p of candidate ) {

		p[ 0 ] -= bounds.min.x; p[ 1 ] -= bounds.min.y;

	}

	charts.push( {
		record, faces, vertexMap, uv: candidate, worldArea,
		width: bounds.max.x - bounds.min.x, height: bounds.max.y - bounds.min.y,
		positions, triangles
	} );

}

function connectedComponents( record, faces ) {

	const remaining = new Set( faces ), components = [];
	for ( const seed of faces ) {

		if ( ! remaining.delete( seed ) ) continue;
		const component = [ seed ];
		for ( let i = 0; i < component.length; i ++ ) {

			for ( const neighbor of record.faces[ component[ i ] ].neighbors ) {

				if ( remaining.delete( neighbor ) ) component.push( neighbor );

			}

		}

		components.push( component );

	}

	return components;

}

function checkChart( positions, triangles, uv, worldArea, settings ) {

	if ( uv.some( p => ! Number.isFinite( p[ 0 ] + p[ 1 ] ) ) ) return null;
	let area = 0, maxStretch = 1, minRatio = Infinity, maxRatio = 0;
	for ( const tri of triangles ) {

		const { length, x, y, cross } = triangleFrame( positions, tri );
		const [ p, q, r ] = tri.map( i => uv[ i ] );
		const determinant = cross2( p, q, r );
		if ( ! ( determinant > 0 ) ) return null;
		area += determinant * 0.5;
		const ux = ( q[ 0 ] - p[ 0 ] ) / length, vx = ( q[ 1 ] - p[ 1 ] ) / length;
		const uy = ( r[ 0 ] - p[ 0 ] - ux * x ) / y, vy = ( r[ 1 ] - p[ 1 ] - vx * x ) / y;
		const aa = ux * ux + vx * vx, bb = uy * uy + vy * vy, cc = ux * uy + vx * vy;
		const trace = aa + bb, delta = Math.hypot( aa - bb, 2 * cc );
		// Use determinant for the small eigenvalue to avoid subtractive cancellation.
		const largest = ( trace + delta ) * 0.5;
		const jacobianDet = determinant / cross;
		const stretch = largest / jacobianDet;
		if ( ! Number.isFinite( stretch ) || stretch > settings.maxStretch * ( 1 + 1e-8 ) ) return null;
		maxStretch = Math.max( maxStretch, stretch );
		minRatio = Math.min( minRatio, jacobianDet );
		maxRatio = Math.max( maxRatio, jacobianDet );

	}

	const mean = area / worldArea;
	if ( minRatio / mean < 1 / settings.maxAreaRatio - 1e-8 || maxRatio / mean > settings.maxAreaRatio + 1e-8 ) return null;
	if ( hasOverlap( uv, triangles ) ) return null;
	return { area, maxStretch };

}

function cross2( a, b, c ) {

	return ( b[ 0 ] - a[ 0 ] ) * ( c[ 1 ] - a[ 1 ] ) - ( b[ 1 ] - a[ 1 ] ) * ( c[ 0 ] - a[ 0 ] );

}

function getBounds( points ) {

	const bounds = new Box2(), point = new Vector2();
	for ( const p of points ) bounds.expandByPoint( point.set( p[ 0 ], p[ 1 ] ) );
	return bounds;

}

function hasOverlap( uv, triangles ) {

	const bounds = getBounds( uv );
	const extent = Math.max( bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y );
	const cellSize = extent / Math.max( 1, Math.sqrt( triangles.length ) );
	const epsilon = extent * 1e-10, cells = new Map();
	for ( let i = 0; i < triangles.length; i ++ ) {

		const points = triangles[ i ].map( v => uv[ v ] ), box = getBounds( points ), seen = new Set();
		for ( let x = Math.floor( ( box.min.x - bounds.min.x ) / cellSize ); x <= Math.floor( ( box.max.x - bounds.min.x ) / cellSize ); x ++ ) {

			for ( let y = Math.floor( ( box.min.y - bounds.min.y ) / cellSize ); y <= Math.floor( ( box.max.y - bounds.min.y ) / cellSize ); y ++ ) {

				const key = `${ x },${ y }`;
				if ( ! cells.has( key ) ) cells.set( key, [] );
				const cell = cells.get( key );
				for ( const other of cell ) {

					if ( seen.has( other ) ) continue;
					seen.add( other );
					if ( overlapSAT( points, triangles[ other ].map( v => uv[ v ] ), epsilon ) ) return true;

				}

				cell.push( i );

			}

		}

	}

	return false;

}

// Strict interior intersection: shared edges and vertices are allowed.
function overlapSAT( a, b, epsilon ) {

	for ( const tri of [ a, b ] ) {

		for ( let j = 0; j < 3; j ++ ) {

			const p = tri[ j ], q = tri[ ( j + 1 ) % 3 ];
			const nx = p[ 1 ] - q[ 1 ], ny = q[ 0 ] - p[ 0 ];
			let minA = Infinity, maxA = - Infinity, minB = Infinity, maxB = - Infinity;
			for ( let k = 0; k < 3; k ++ ) {

				const da = a[ k ][ 0 ] * nx + a[ k ][ 1 ] * ny, db = b[ k ][ 0 ] * nx + b[ k ][ 1 ] * ny;
				minA = Math.min( minA, da ); maxA = Math.max( maxA, da );
				minB = Math.min( minB, db ); maxB = Math.max( maxB, db );

			}

			if ( Math.min( maxA, maxB ) - Math.max( minA, minB ) <= epsilon * Math.hypot( nx, ny ) ) return false;

		}

	}

	return true;

}

function alignChart( uv ) {

	let x = 0, y = 0, xx = 0, yy = 0, xy = 0;
	for ( const p of uv ) {

		x += p[ 0 ]; y += p[ 1 ];

	}

	x /= uv.length; y /= uv.length;
	for ( const p of uv ) {

		xx += ( p[ 0 ] - x ) ** 2; yy += ( p[ 1 ] - y ) ** 2; xy += ( p[ 0 ] - x ) * ( p[ 1 ] - y );

	}

	const angle = 0.5 * Math.atan2( 2 * xy, xx - yy ), cosine = Math.cos( angle ), sine = Math.sin( angle );
	const rotated = uv.map( p => [ cosine * p[ 0 ] + sine * p[ 1 ], - sine * p[ 0 ] + cosine * p[ 1 ] ] );
	const a = getBounds( uv ), b = getBounds( rotated );
	if ( ( b.max.x - b.min.x ) * ( b.max.y - b.min.y ) < ( a.max.x - a.min.x ) * ( a.max.y - a.min.y ) ) {

		for ( let i = 0; i < uv.length; i ++ ) uv[ i ] = rotated[ i ];

	}

}

function packCharts( charts, settings ) {

	if ( charts.length === 0 ) return 0;
	// Half a pixel beyond the requested gutter protects the texel-center boundary.
	const border = settings.padding + 0.5;
	function pack( density ) {

		const boxes = charts.map( chart => ( {
			chart, w: Math.max( 1, Math.ceil( chart.width * density + border * 2 ) ),
			h: Math.max( 1, Math.ceil( chart.height * density + border * 2 ) )
		} ) );
		const result = potpack( boxes );
		if ( result.w > settings.resolution || result.h > settings.resolution ) return packShelves( boxes, settings.resolution );
		return boxes;

	}

	let density = settings.texelsPerUnit, boxes;
	if ( density > 0 ) {

		boxes = pack( density );
		if ( ! boxes ) throw new Error( 'UVUnwrapper: no packing found for requested texelsPerUnit; increase resolution or partition the hierarchy.' );

	} else {

		if ( ! pack( 0 ) ) throw new Error( 'UVUnwrapper: chart gutters do not fit; increase resolution or partition the hierarchy.' );
		const area = charts.reduce( ( sum, chart ) => sum + chart.width * chart.height, 0 );
		let low = 0, high = settings.resolution / Math.sqrt( area );
		for ( let iteration = 0; iteration < 24; iteration ++ ) {

			const middle = ( low + high ) * 0.5, trial = pack( middle );
			if ( trial ) {

				low = middle; boxes = trial;

			} else {

				high = middle;

			}

		}

		density = low;
		if ( ! boxes || density === 0 ) throw new Error( 'UVUnwrapper: no positive density fits the atlas.' );

	}

	for ( const box of boxes ) box.chart.box = { x: box.x, y: box.y, w: box.w, h: box.h };
	return density;

}

// A fixed-width fallback avoids potpack's unconstrained container-width heuristic.
function packShelves( boxes, resolution ) {

	const shelves = [];
	let height = 0;
	for ( const box of boxes ) {

		if ( box.w > resolution || box.h > resolution ) return null;
		let best = null;
		for ( const shelf of shelves ) {

			if ( shelf.h >= box.h && shelf.x + box.w <= resolution && ( best === null || shelf.x > best.x ) ) best = shelf;

		}

		if ( best === null ) {

			if ( height + box.h > resolution ) return null;
			best = { x: 0, y: height, h: box.h };
			shelves.push( best );
			height += box.h;

		}

		box.x = best.x;
		box.y = best.y;
		best.x += box.w;

	}

	return boxes;

}

function validateFloat32Chart( chart, settings, density ) {

	const border = settings.padding + 0.5;
	chart.outputUV = chart.uv.map( p => [
		Math.fround( ( chart.box.x + border + p[ 0 ] * density ) / settings.resolution ),
		Math.fround( ( chart.box.y + border + p[ 1 ] * density ) / settings.resolution )
	] );
	// Validate the coordinates the GPU actually receives, not just the solver's
	// doubles. Slivers can collapse or reverse after atlas translation/rounding.
	const limits = { ...settings, maxStretch: settings.maxStretch * ( 1 + 5e-4 ), maxAreaRatio: settings.maxAreaRatio * ( 1 + 5e-4 ) };
	let quality = checkChart( chart.positions, chart.triangles, chart.outputUV, chart.worldArea, limits );
	if ( ! quality ) {

		const faces = [], triangles = [];
		for ( let i = 0; i < chart.triangles.length; i ++ ) {

			const triangle = chart.triangles[ i ], face = chart.record.faces[ chart.faces[ i ] ];
			if ( face.area * density * density < 1 && ! checkChart( chart.positions, [ triangle ], chart.outputUV, face.area, limits ) ) {

				face.ignored = true;
				chart.worldArea -= face.area;

			} else {

				faces.push( chart.faces[ i ] );
				triangles.push( triangle );

			}

		}

		chart.faces = faces;
		chart.triangles = triangles;
		if ( faces.length === 0 ) return false;
		quality = checkChart( chart.positions, triangles, chart.outputUV, chart.worldArea, limits );

	}

	if ( ! quality ) throw new Error( `UVUnwrapper: Float32 atlas precision is insufficient for mesh "${ chart.record.mesh.name }"; repair sliver triangles or partition the hierarchy.` );
	return true;

}

function rebuildGeometry( record, charts, settings ) {

	const original = record.original, lookup = new Map(), source = [], values = [], indices = [];
	for ( let f = 0; f < record.faces.length; f ++ ) {

		const chartIndex = record.faceCharts[ f ], chart = charts[ chartIndex ], face = record.faces[ f ];
		for ( let j = 0; j < 3; j ++ ) {

			const vertex = face.vertices[ j ], key = `${ vertex },${ chartIndex }`;
			if ( ! lookup.has( key ) ) {

				lookup.set( key, source.length );
				source.push( vertex );
				const p = chart ? chart.outputUV[ chart.vertexMap.get( record.vertexKeys[ vertex ] ) ] : [ 0, 0 ];
				values.push( p[ 0 ], p[ 1 ] );

			}

			indices.push( lookup.get( key ) );

		}

	}

	const geometry = new BufferGeometry().copy( original ), buffers = new Map();
	for ( const name of Object.keys( original.attributes ) ) geometry.setAttribute( name, remapAttribute( original.attributes[ name ], source, buffers ) );
	for ( const name of Object.keys( original.morphAttributes ) ) {

		geometry.morphAttributes[ name ] = original.morphAttributes[ name ].map( attribute => remapAttribute( attribute, source, buffers ) );

	}

	geometry.setIndex( indices );
	geometry.setAttribute( settings.attribute, new Float32BufferAttribute( values, 2 ) );
	if ( settings.attribute === 'uv' ) geometry.deleteAttribute( 'tangent' );
	record.geometry = geometry;
	record.sourceVertices = Uint32Array.from( source );

}

export { UVUnwrapper };
