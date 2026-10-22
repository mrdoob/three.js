import { Box2, BufferGeometry, Float32BufferAttribute, InstancedBufferAttribute, Matrix4, Vector2, Vector3 } from 'three';
import { remapAttribute } from './BufferGeometryUtils.js';
import { potpack } from '../libs/potpack.module.js';

/**
 * Generates a unique UV atlas for the meshes in a hierarchy, measured in world space.
 * Each mesh receives a new geometry. Skinned and morphed meshes are unwrapped in
 * their current pose. BatchedMesh is skipped with a warning.
 * Excluded faces collapse onto the UV of a neighboring chart vertex, or (0, 0) if
 * isolated, and get a faceCharts entry of -1.
 *
 * With a `pageSize` below the `resolution`, the charts are packed at the density of the
 * `resolution` into as many square pages of `pageSize` as they need, e.g. for devices that
 * limit the texture size. Whole meshes are assigned to pages, since a mesh samples one light
 * map, and the page of each mesh is stored in `mesh.userData.lightMapPage`. A mesh too large
 * for a page gets a lower density.
 *
 * `mesh.userData.lightMapScale` multiplies the density of a mesh, e.g. `0.5` for meshes whose
 * lighting varies little. Meshes with a scale of `0` are left out of the atlas and lose the
 * attribute, e.g. small props that light probes light instead.
 *
 * The instances of an instanced mesh share the charts of its geometry and each one gets an
 * atlas region of the same size, at the mean scale of the instances. The attribute maps the
 * charts into a unit square, and the instanced attributes `instanceLightMapScale` and
 * `instanceLightMapOffset` map it into the region of each instance.
 *
 * @three_import import { unwrapUVs } from 'three/addons/utils/unwrapUVs.js';
 *
 * @param {Object3D} root - A mesh or hierarchy to unwrap.
 * @param {Object} [options] - Atlas and chart options.
 * @param {string} [options.attribute='uv1'] - Output attribute: uv, uv1, uv2, uv3.
 * @param {string} [options.mode='lightmap'] - 'lightmap' or 'normal'. Normal tries LSCM.
 * @param {number} [options.resolution=1024] - Square atlas size in pixels, integer >= 4.
 * @param {number} [options.pageSize=resolution] - Maximum page size in pixels; smaller sizes split the atlas into pages.
 * @param {number} [options.padding=4] - Nonnegative gutter in pixels; 2 * padding + 1 must be less than resolution and pageSize.
 * @param {number} [options.texelsPerUnit=0] - Common world density; zero fits the atlas. Must be nonnegative.
 * @param {boolean} [options.respectUVSeams] - Cut discontinuities in existing uv (normal default).
 * @param {boolean} [options.useInputUVs=false] - Preserve valid authored UV charts before trying LSCM.
 * @param {string} [options.inputAttribute='uv'] - The authored UVs of `respectUVSeams` and `useInputUVs`.
 * @return {?Object} Page size, page count, density, chart bounds with their pages, mesh vertex/face
 * mappings with their pages, the meshes left out and warning counts (excluded faces, tiny faces
 * under 0.01 atlas pixels squared and single-triangle charts, which signal fragmentation), or null
 * if the charts do not fit. Meshes are left unchanged in that case. Charts that fail Float32
 * validation are split and repacked; single faces that still fail are excluded.
 */
function unwrapUVs( root, options = {} ) {

	const settings = {
		attribute: 'uv1', mode: 'lightmap', resolution: 1024, padding: 4,
		texelsPerUnit: 0,
		useInputUVs: false, inputAttribute: 'uv',
		...options, maxAreaRatio: 2
	};
	settings.maxStretch = settings.mode === 'normal' ? 2 : 1.5;
	settings.respectUVSeams ??= settings.mode === 'normal';
	settings.pageSize = Math.min( settings.pageSize ?? settings.resolution, settings.resolution );
	root.updateWorldMatrix( true, true );

	const records = [], excluded = [];
	root.traverse( mesh => {

		if ( ! mesh.isMesh ) return;
		if ( mesh.isBatchedMesh ) {

			console.warn( 'THREE.unwrapUVs(): BatchedMesh is not supported. Skipping mesh.', mesh );
			return;

		}

		let scale = mesh.userData.lightMapScale ?? 1;
		if ( ! ( scale >= 0 && scale < Infinity ) ) {

			console.warn( `THREE.unwrapUVs(): Invalid lightMapScale of mesh "${ mesh.name }", using 1.` );
			scale = 1;

		}

		if ( scale === 0 || ( mesh.isInstancedMesh && mesh.count === 0 ) ) {

			excluded.push( mesh );
			return;

		}

		const record = readMesh( mesh, settings );
		record.densityScale = scale * ( mesh.isInstancedMesh ? meanInstanceScale( mesh ) : 1 );
		record.instances = mesh.isInstancedMesh ? mesh.count : 0;
		records.push( record );

	} );

	const charts = [];
	for ( const record of records ) {

		for ( const faces of growCharts( record, settings ) ) {

			parameterize( record, faces, settings, charts );

		}

	}

	let density, pages;
	for ( ; ; ) {

		for ( const record of records ) record.charts = [];
		for ( const chart of charts ) chart.record.charts.push( chart );

		const packed = packCharts( records, settings );
		if ( packed === null ) return null;
		( { density, pages } = packed );

		const failed = [];
		for ( let i = charts.length - 1; i >= 0; i -- ) {

			if ( validateFloat32Chart( charts[ i ], settings, density ) === null ) failed.push( ...charts.splice( i, 1 ) );

		}

		if ( failed.length === 0 ) break;

		// Float32 rounding broke these charts at this density; split them and repack.
		for ( const chart of failed ) splitFaces( chart.record, chart.faces, settings, charts );

	}

	for ( let i = charts.length - 1; i >= 0; i -- ) {

		if ( charts[ i ].dropped.size === charts[ i ].faces.length ) charts.splice( i, 1 );

	}

	for ( let i = 0; i < charts.length; i ++ ) {

		charts[ i ].faces.forEach( ( face, t ) => {

			if ( ! charts[ i ].dropped.has( t ) ) charts[ i ].record.faceCharts[ face ] = i;

		} );

	}

	for ( const record of records ) {

		record.mesh.geometry = rebuildGeometry( record, charts, settings );
		record.mesh.userData.lightMapPage = record.page;

	}

	for ( const mesh of excluded ) {

		if ( mesh.geometry.hasAttribute( settings.attribute ) ) mesh.geometry = withoutAttribute( mesh.geometry, settings.attribute );
		delete mesh.userData.lightMapPage;

	}

	let tinyFaces = 0;
	for ( const chart of charts ) {

		// The UVs of instanced charts span an instance region rather than the page.
		const { instances, regionSize } = chart.record, pixels = instances > 0 ? regionSize.w * regionSize.h : settings.pageSize ** 2;
		for ( const [ t, triangle ] of chart.triangles.entries() ) {

			if ( ! chart.dropped.has( t ) && Math.abs( cross2( ...triangle.map( i => chart.outputUV[ i ] ) ) ) * pixels / 2 < 0.01 ) tinyFaces ++;

		}

	}

	const excludedFaces = records.reduce( ( sum, record ) => sum + record.faceCharts.filter( chart => chart === - 1 ).length, 0 );
	const singleTriangleCharts = charts.filter( chart => chart.faces.length === 1 ).length;

	return {
		attribute: settings.attribute, resolution: settings.pageSize, pages, padding: settings.padding,
		texelsPerUnit: density,
		charts: charts.map( chart => {

			const region = chart.record.regions?.[ 0 ] ?? { x: 0, y: 0 };
			return { x: region.x + chart.box.x, y: region.y + chart.box.y, width: chart.box.w, height: chart.box.h, page: chart.record.page };

		} ),
		meshes: records.map( record => ( { mesh: record.mesh, page: record.page, sourceVertices: record.sourceVertices, faceCharts: record.faceCharts } ) ),
		excluded,
		warnings: { excludedFaces, tinyFaces, singleTriangleCharts }
	};

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

		// Exact positional welding only, for topology; output attributes keep original identity.
		const key = `${ position.getX( i ) },${ position.getY( i ) },${ position.getZ( i ) }`;
		if ( ! unique.has( key ) ) unique.set( key, unique.size );
		welds.push( unique.get( key ) );
		points.push( mesh.getVertexPosition( i, new Vector3() ).applyMatrix4( mesh.matrixWorld ) );

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
		const longest = Math.max( ...[ 0, 1, 2 ].map( j => points[ vertices[ j ] ].distanceToSquared( points[ vertices[ ( j + 1 ) % 3 ] ] ) ) );
		// slivers beyond Float32 precision are excluded from the atlas
		const ignored = ! ( area > longest * 1e-6 );
		const face = { vertices, welds: vertices.map( v => welds[ v ] ), normal: normal.normalize(), area, ignored, neighbors: [] };
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

	const uv = geometry.getAttribute( settings.inputAttribute );
	for ( const edge of edges.values() ) {

		// Pair opposite half-edges by closest normal, so duplicated double-sided shells
		// (four faces per edge) join each side separately instead of becoming all seams.
		const pairs = [], used = new Set();
		for ( const x of edge ) {

			let best = null, bestDot = - Infinity;
			for ( const y of edge ) {

				if ( used.has( x ) || used.has( y ) || y.a !== x.b || y.b !== x.a || materials[ x.f ] !== materials[ y.f ] ) continue;
				const dot = faces[ x.f ].normal.dot( faces[ y.f ].normal );
				if ( dot > bestDot ) {

					best = y; bestDot = dot;

				}

			}

			if ( best ) {

				pairs.push( [ x, best ] );
				used.add( x ).add( best );

			}

		}

		for ( const [ a, b ] of pairs ) {

			if ( ( settings.respectUVSeams || settings.useInputUVs ) && uv ) {

				const av = faces[ a.f ].vertices, bv = faces[ b.f ].vertices;
				if ( ! equalUV( uv, av[ a.j ], bv[ ( b.j + 1 ) % 3 ] ) || ! equalUV( uv, av[ ( a.j + 1 ) % 3 ], bv[ b.j ] ) ) continue;

			}

			faces[ a.f ].neighbors.push( b.f );
			faces[ b.f ].neighbors.push( a.f );

		}

	}

	// UV discontinuities can be cuts inside a connected chart (e.g. a slit
	// cylinder). Keep the two coincident seam endpoints distinct in the solver.
	const vertexKeys = welds.map( ( weld, i ) => uv && ( settings.respectUVSeams || settings.useInputUVs ) ? `${ weld },${ uv.getX( i ) },${ uv.getY( i ) }` : weld );
	return { mesh, original: geometry, points, faces, vertexKeys, faceCharts: new Int32Array( faces.length ).fill( - 1 ) };

}

function equalUV( uv, a, b ) {

	return uv.getX( a ) === uv.getX( b ) && uv.getY( a ) === uv.getY( b );

}

function growCharts( record, settings, subset = null ) {

	const assigned = new Uint8Array( record.faces.length ), charts = [];
	if ( subset !== null ) {

		assigned.fill( 1 );
		for ( const f of subset ) assigned[ f ] = 0;

	}

	// Lightmap charts use planar projection; keep the costlier LSCM charts smaller.
	const limit = settings.mode === 'lightmap' ? 8192 : 2048;
	// Wider normal cones in normal mode give LSCM useful curved patches to solve.
	const cosine = settings.useInputUVs && record.original.attributes[ settings.inputAttribute ] ? - 1 : settings.mode === 'normal' ? 0.35 : 1 / settings.maxStretch;
	for ( let seed = 0; seed < assigned.length; seed ++ ) {

		if ( assigned[ seed ] || record.faces[ seed ].ignored ) continue;
		const faces = [ seed ], normal = record.faces[ seed ].normal;
		assigned[ seed ] = 1;
		for ( let i = 0; i < faces.length && faces.length < limit; i ++ ) {

			for ( const neighbor of record.faces[ faces[ i ] ].neighbors ) {

				if ( assigned[ neighbor ] || record.faces[ neighbor ].normal.dot( normal ) < cosine ) continue;
				assigned[ neighbor ] = 1;
				faces.push( neighbor );
				if ( faces.length === limit ) break;

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
	const useInput = settings.useInputUVs && record.original.attributes[ settings.inputAttribute ];
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
				uv.push( useInput ? [ useInput.getX( vertex ), useInput.getY( vertex ) ] : [ p.dot( u ), p.dot( v ) ] );

			}

			return vertexMap.get( key );

		} ) );

	}

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

		if ( useInput && ( settings.mode === 'lightmap' || faces.length === 1 ) ) {

			// Reproject a rejected lightmap island before splitting its authored UVs
			// into one chart per triangle. Normal mode already tries LSCM above. The island
			// grows new charts, since halving it until the pieces pass leaves many small charts.
			const projected = { ...settings, useInputUVs: false };
			for ( const chart of growCharts( record, projected, faces ) ) parameterize( record, chart, projected, charts );
			return;

		}

		if ( faces.length === 1 ) {

			record.faces[ faces[ 0 ] ].ignored = true;
			return;

		}

		splitFaces( record, faces, settings, charts );
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

function splitFaces( record, faces, settings, charts ) {

	const half = Math.floor( faces.length / 2 );
	for ( const subset of [ faces.slice( 0, half ), faces.slice( half ) ] ) {

		for ( const component of connectedComponents( record, subset ) ) parameterize( record, component, settings, charts );

	}

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
		const trace = aa + bb, difference = aa - bb, delta = Math.sqrt( difference * difference + 4 * cc * cc );
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

			if ( Math.min( maxA, maxB ) - Math.max( minA, minB ) <= epsilon * Math.sqrt( nx * nx + ny * ny ) ) return false;

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

function packCharts( records, settings ) {

	if ( records.every( record => record.charts.length === 0 ) ) {

		for ( const record of records ) record.page = 0;
		return { density: 0, pages: 1 };

	}

	// Half a pixel beyond the requested gutter protects the texel-center boundary.
	const border = settings.padding + 0.5;

	// The instances of an instanced mesh share one layout of its charts.
	function layoutRecord( record, density ) {

		const scale = density * record.densityScale;
		const boxes = record.charts.map( chart => ( {
			chart, record, w: Math.max( 1, Math.ceil( chart.width * scale + border * 2 ) ),
			h: Math.max( 1, Math.ceil( chart.height * scale + border * 2 ) )
		} ) );
		if ( record.instances === 0 || boxes.length === 0 ) return boxes;
		const { w, h } = potpack( boxes );
		return Array.from( { length: record.instances }, ( v, instance ) => ( { record, instance, charts: boxes, w, h } ) );

	}

	function pack( density ) {

		const boxes = records.flatMap( record => layoutRecord( record, density ) );
		return fits( boxes, settings.resolution ) ? boxes : null;

	}

	let density = settings.texelsPerUnit, boxes = density > 0 ? pack( density ) : null;
	if ( density > 0 && ! boxes ) console.warn( 'THREE.unwrapUVs(): Charts do not fit at the requested texelsPerUnit. Fitting the atlas instead.' );

	if ( ! boxes ) {

		let area = 0;
		for ( const record of records ) {

			for ( const chart of record.charts ) area += chart.width * chart.height * record.densityScale ** 2 * Math.max( record.instances, 1 );

		}

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
		if ( ! boxes ) {

			console.error( 'THREE.unwrapUVs(): Charts do not fit the atlas. Increase the resolution, reduce the padding or partition the hierarchy.' );
			return null;

		}

	}

	let pages = 1;
	if ( settings.pageSize < settings.resolution ) {

		const paged = packPages( records, density, settings.pageSize, layoutRecord );
		if ( paged === null ) {

			console.warn( 'THREE.unwrapUVs(): Charts do not fit the pages. Increase the page size or reduce the padding.' );
			return null;

		}

		boxes = paged.boxes;
		pages = paged.pages;

	}

	for ( const record of records ) record.page = 0;

	for ( const box of boxes ) {

		const page = box.page ?? 0;
		box.record.page = page;
		if ( box.chart ) {

			box.chart.box = { x: box.x, y: box.y, w: box.w, h: box.h };
			continue;

		}

		// Instance regions; the charts are placed in the shared layout of the region.
		const record = box.record;
		record.regions ??= [];
		record.regions[ box.instance ] = { x: box.x, y: box.y };
		record.regionSize = { w: box.w, h: box.h };
		for ( const local of box.charts ) local.chart.box = { x: local.x, y: local.y, w: local.w, h: local.h };

	}

	return { density, pages };

}

function fits( boxes, size ) {

	const result = potpack( boxes );
	return ( result.w <= size && result.h <= size ) || packShelves( boxes, size ) !== null;

}

// Whole meshes, largest first, go to the first page they fit, which is repacked.
function packPages( records, density, size, layoutRecord ) {

	const groups = [];
	for ( const record of records ) {

		let boxes = layoutRecord( record, density ), attempts = 0;
		while ( boxes.length > 0 && ! fits( boxes, size ) ) {

			if ( attempts ++ === 0 ) console.warn( `THREE.unwrapUVs(): Mesh "${ record.mesh.name }" does not fit a page, reducing its density.` );
			if ( attempts > 64 ) return null;
			record.densityScale *= 0.9;
			boxes = layoutRecord( record, density );

		}

		if ( boxes.length > 0 ) groups.push( { boxes, area: boxes.reduce( ( sum, box ) => sum + box.w * box.h, 0 ) } );

	}

	groups.sort( ( a, b ) => b.area - a.area );
	const pages = [];
	for ( const group of groups ) {

		let page = pages.find( page => page.area + group.area <= size * size && fits( page.boxes.concat( group.boxes ), size ) );
		if ( page === undefined ) pages.push( page = { boxes: [], area: 0 } );
		for ( const box of group.boxes ) page.boxes.push( box );
		page.area += group.area;

	}

	const boxes = [];
	pages.forEach( ( page, index ) => {

		fits( page.boxes, size );
		for ( const box of page.boxes ) {

			box.page = index;
			boxes.push( box );

		}

	} );

	return { boxes, pages: pages.length };

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
	const record = chart.record, scale = density * record.densityScale;
	const toUV = ( p, width, height ) => [
		Math.fround( ( chart.box.x + border + p[ 0 ] * scale ) / width ),
		Math.fround( ( chart.box.y + border + p[ 1 ] * scale ) / height )
	];
	const pageUV = chart.uv.map( p => toUV( p, settings.pageSize, settings.pageSize ) );
	// Instanced charts map into the unit square of the instance regions, which the instance
	// scales stretch back to the proportions validated here.
	chart.outputUV = record.instances > 0 ? chart.uv.map( p => toUV( p, record.regionSize.w, record.regionSize.h ) ) : pageUV;
	// Validate the coordinates the GPU actually receives, not just the solver's
	// doubles. Slivers can collapse or reverse after atlas translation/rounding.
	const limits = { ...settings, maxStretch: settings.maxStretch * ( 1 + 5e-4 ), maxAreaRatio: settings.maxAreaRatio * ( 1 + 5e-4 ) };
	// Drops are recomputed on every pass, so a repack at another density can restore them.
	chart.dropped = new Set();
	if ( checkChart( chart.positions, chart.triangles, pageUV, chart.worldArea, limits ) ) return true;

	// Drop failing single faces and subtexel faces; anything else needs a split.
	const triangles = [];
	let worldArea = chart.worldArea;
	for ( let i = 0; i < chart.triangles.length; i ++ ) {

		const triangle = chart.triangles[ i ], face = chart.record.faces[ chart.faces[ i ] ];
		if ( chart.triangles.length === 1 || face.area * scale * scale < 1 && ! checkChart( chart.positions, [ triangle ], pageUV, face.area, limits ) ) {

			chart.dropped.add( i );
			worldArea -= face.area;

		} else {

			triangles.push( triangle );

		}

	}

	return triangles.length === 0 || checkChart( chart.positions, triangles, pageUV, worldArea, limits ) ? true : null;

}

function rebuildGeometry( record, charts, settings ) {

	const original = record.original, lookup = new Map(), source = [], values = [], indices = [];
	const chartUV = ( chart, vertex ) => chart.outputUV[ chart.vertexMap.get( record.vertexKeys[ vertex ] ) ];

	// Excluded faces collapse onto a welded neighbor's UV so they sample adjacent lighting
	// rather than the gutter of whichever chart sits at (0, 0). Isolated ones keep (0, 0).
	const weldUVs = new Map();
	for ( let f = 0; f < record.faces.length; f ++ ) {

		const chart = charts[ record.faceCharts[ f ] ], face = record.faces[ f ];
		if ( chart ) for ( let j = 0; j < 3; j ++ ) weldUVs.set( face.welds[ j ], chartUV( chart, face.vertices[ j ] ) );

	}

	for ( let f = 0; f < record.faces.length; f ++ ) {

		const chartIndex = record.faceCharts[ f ], chart = charts[ chartIndex ], face = record.faces[ f ];
		const fallback = chart ? null : face.welds.map( weld => weldUVs.get( weld ) ).find( Boolean ) ?? [ 0, 0 ];
		for ( let j = 0; j < 3; j ++ ) {

			const vertex = face.vertices[ j ], key = chart ? `${ vertex },${ chartIndex }` : `${ vertex },${ fallback }`;
			if ( ! lookup.has( key ) ) {

				lookup.set( key, source.length );
				source.push( vertex );
				const p = chart ? chartUV( chart, vertex ) : fallback;
				values.push( p[ 0 ], p[ 1 ] );

			}

			indices.push( lookup.get( key ) );

		}

	}

	const geometry = new BufferGeometry(), buffers = new Map();
	geometry.name = original.name;
	geometry.morphTargetsRelative = original.morphTargetsRelative;
	geometry.userData = original.userData;
	geometry.setDrawRange( original.drawRange.start, original.drawRange.count );
	for ( const group of original.groups ) geometry.addGroup( group.start, group.count, group.materialIndex );

	for ( const name of Object.keys( original.attributes ) ) {

		// Instanced attributes are per instance, not per vertex.
		const attribute = original.attributes[ name ];
		geometry.setAttribute( name, isInstanced( attribute ) ? attribute : remapAttribute( attribute, source, buffers ) );

	}

	for ( const name of Object.keys( original.morphAttributes ) ) {

		geometry.morphAttributes[ name ] = original.morphAttributes[ name ].map( attribute => remapAttribute( attribute, source, buffers ) );

	}

	geometry.setIndex( indices );
	geometry.setAttribute( settings.attribute, new Float32BufferAttribute( values, 2 ) );
	if ( settings.attribute === 'uv' ) geometry.deleteAttribute( 'tangent' );
	if ( record.instances > 0 ) {

		// The instance attributes map the unit square into the region of each instance.
		const offsets = new Float32Array( record.instances * 2 ), scales = new Float32Array( record.instances * 2 );
		for ( let i = 0; record.regions !== undefined && i < record.instances; i ++ ) {

			offsets[ i * 2 ] = record.regions[ i ].x / settings.pageSize;
			offsets[ i * 2 + 1 ] = record.regions[ i ].y / settings.pageSize;
			scales[ i * 2 ] = record.regionSize.w / settings.pageSize;
			scales[ i * 2 + 1 ] = record.regionSize.h / settings.pageSize;

		}

		geometry.setAttribute( 'instanceLightMapOffset', new InstancedBufferAttribute( offsets, 2 ) );
		geometry.setAttribute( 'instanceLightMapScale', new InstancedBufferAttribute( scales, 2 ) );

	}

	record.sourceVertices = Uint32Array.from( source );
	return geometry;

}

function isInstanced( attribute ) {

	return attribute.isInstancedBufferAttribute === true || attribute.data?.isInstancedInterleavedBuffer === true;

}

// A geometry that shares the buffers of another one without an attribute.
function withoutAttribute( original, name ) {

	const geometry = new BufferGeometry();
	geometry.name = original.name;
	geometry.morphTargetsRelative = original.morphTargetsRelative;
	geometry.userData = original.userData;
	geometry.setDrawRange( original.drawRange.start, original.drawRange.count );
	for ( const group of original.groups ) geometry.addGroup( group.start, group.count, group.materialIndex );
	for ( const key of Object.keys( original.attributes ) ) if ( key !== name ) geometry.setAttribute( key, original.attributes[ key ] );
	for ( const key of Object.keys( original.morphAttributes ) ) geometry.morphAttributes[ key ] = original.morphAttributes[ key ];
	geometry.setIndex( original.index );
	return geometry;

}

// The mean linear scale of the instances, which sets the density of their shared charts.
function meanInstanceScale( mesh ) {

	const matrix = new Matrix4();
	let sum = 0;
	for ( let i = 0; i < mesh.count; i ++ ) sum += Math.cbrt( Math.abs( mesh.getMatrixAt( i, matrix ).determinant() ) );
	return sum / mesh.count || 1;

}

function triangleFrame( positions, triangle ) {

	const [ a, b, c ] = triangle.map( i => positions[ i ] );
	const ab = new Vector3().subVectors( b, a ), ac = new Vector3().subVectors( c, a );
	const length = ab.length(), cross = new Vector3().crossVectors( ab, ac ).length();
	return { length, x: ac.dot( ab ) / length, y: cross / length, cross };

}

// Least squares conformal maps, solved with Jacobi-preconditioned conjugate gradients.
// Two pinned vertices remove the similarity null modes. Returns null on failure.
function solveLSCM( positions, triangles, initial ) {

	let pinA = 0, pinB = 0, distance = 0;
	for ( let i = 1; i < initial.length; i ++ ) {

		if ( initial[ i ][ 0 ] < initial[ pinA ][ 0 ] ) pinA = i;

	}

	for ( let i = 0; i < initial.length; i ++ ) {

		const d = ( initial[ i ][ 0 ] - initial[ pinA ][ 0 ] ) ** 2 + ( initial[ i ][ 1 ] - initial[ pinA ][ 1 ] ) ** 2;
		if ( d > distance ) {

			distance = d; pinB = i;

		}

	}

	if ( distance === 0 ) return null;
	const n = positions.length * 2, fixed = new Uint8Array( n );
	for ( const pin of [ pinA, pinB ] ) {

		fixed[ pin * 2 ] = 1; fixed[ pin * 2 + 1 ] = 1;

	}

	const rows = [];
	for ( const tri of triangles ) {

		const { length, x, y } = triangleFrame( positions, tri );
		if ( ! ( y > 0 && length > 0 ) ) return null;
		const weight = Math.sqrt( length * y * 0.5 );
		const gx = [ - 1 / length, 1 / length, 0 ], gy = [ ( x - length ) / ( length * y ), - x / ( length * y ), 1 / y ];
		const indices = tri.flatMap( i => [ i * 2, i * 2 + 1 ] );
		rows.push( { indices, values: gx.flatMap( ( value, i ) => [ value * weight, - gy[ i ] * weight ] ) } );
		rows.push( { indices, values: gy.flatMap( ( value, i ) => [ value * weight, gx[ i ] * weight ] ) } );

	}

	const diagonal = new Float64Array( n ), rhs = new Float64Array( n );
	for ( const row of rows ) {

		let offset = 0;
		for ( let j = 0; j < 6; j ++ ) {

			const i = row.indices[ j ];
			if ( fixed[ i ] ) offset += row.values[ j ] * initial[ i >> 1 ][ i % 2 ];

		}

		for ( let j = 0; j < 6; j ++ ) {

			const i = row.indices[ j ];
			if ( ! fixed[ i ] ) {

				diagonal[ i ] += row.values[ j ] ** 2; rhs[ i ] -= row.values[ j ] * offset;

			}

		}

	}

	function multiply( input, output ) {

		output.fill( 0 );
		for ( const row of rows ) {

			let sum = 0;
			for ( let j = 0; j < 6; j ++ ) if ( ! fixed[ row.indices[ j ] ] ) sum += row.values[ j ] * input[ row.indices[ j ] ];
			for ( let j = 0; j < 6; j ++ ) if ( ! fixed[ row.indices[ j ] ] ) output[ row.indices[ j ] ] += row.values[ j ] * sum;

		}

	}

	const solution = new Float64Array( n ), residual = new Float64Array( n ), direction = new Float64Array( n ), product = new Float64Array( n );
	for ( let i = 0; i < n; i ++ ) if ( ! fixed[ i ] ) solution[ i ] = initial[ i >> 1 ][ i % 2 ];
	multiply( solution, product );
	let rz = 0;
	for ( let i = 0; i < n; i ++ ) {

		residual[ i ] = rhs[ i ] - product[ i ];
		direction[ i ] = diagonal[ i ] > 0 ? residual[ i ] / diagonal[ i ] : 0;
		rz += residual[ i ] * direction[ i ];

	}

	const tolerance = rz * 1e-12;
	for ( let iteration = 0; iteration < Math.min( n, 300 ) && rz > tolerance && rz > 1e-24; iteration ++ ) {

		multiply( direction, product );
		let denominator = 0;
		for ( let i = 0; i < n; i ++ ) denominator += direction[ i ] * product[ i ];
		if ( ! ( denominator > 0 ) ) return null;
		const alpha = rz / denominator;
		let next = 0;
		for ( let i = 0; i < n; i ++ ) {

			solution[ i ] += alpha * direction[ i ];
			residual[ i ] -= alpha * product[ i ];
			if ( diagonal[ i ] > 0 ) next += residual[ i ] ** 2 / diagonal[ i ];

		}

		const beta = next / rz;
		for ( let i = 0; i < n; i ++ ) direction[ i ] = ( diagonal[ i ] > 0 ? residual[ i ] / diagonal[ i ] : 0 ) + beta * direction[ i ];
		rz = next;

	}

	return initial.map( ( p, i ) => fixed[ i * 2 ] ? p.slice() : [ solution[ i * 2 ], solution[ i * 2 + 1 ] ] );

}

export { unwrapUVs };
