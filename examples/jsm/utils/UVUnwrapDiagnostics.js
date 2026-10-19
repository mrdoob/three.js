import { Vector3 } from 'three';

/**
 * Audits the stored UV attribute, independently of the unwrapper's internal checks.
 * Thresholds describe atlas quality, not a proof that a model is suitable for baking.
 * The overlap test uses polygon clipping and a spatial grid; shared edges are allowed.
 *
 * @param {?Object} result - The result returned by unwrapUVs().
 * @param {Object} [options] - Quality limits, in atlas pixels where applicable.
 * @return {Object} Pass status, actionable issues, and measurements.
 */
function analyzeUVUnwrap( result, options = {} ) {

	const limits = { maxStretch: 2.1, maxDensityRatio: 2.1, maxSingleTriangleRatio: 0.5, minTrianglePixels: 0.01, ...options };
	const issues = [];
	const metrics = {
		faces: 0, excludedFaces: 0, charts: result ? result.charts.length : 0,
		invalidFaces: 0, collapsedFaces: 0, flippedFaces: 0, tinyFaces: 0,
		paddingViolations: 0, overlapPairs: 0, singleTriangleChartRatio: 0,
		minDensity: Infinity, maxDensity: 0, maxStretch: 1, uvArea: 0
	};
	const add = ( code, message, count = 1 ) => issues.push( { code, message, count } );
	if ( ! result ) {

		add( 'packing', 'Charts could not be packed into the atlas.' );
		return { passed: false, issues, metrics };

	}

	const triangles = [], chartFaces = new Uint32Array( result.charts.length );
	for ( const record of result.meshes ) {

		const geometry = record.mesh.geometry, uv = geometry.getAttribute( result.attribute ), index = geometry.index;
		const count = index ? index.count : geometry.getAttribute( 'position' ).count;
		metrics.faces += count / 3;
		for ( let f = 0; f < count / 3; f ++ ) {

			const ids = [ 0, 1, 2 ].map( j => index ? index.getX( f * 3 + j ) : f * 3 + j );
			if ( ! uv || ids.some( id => id >= uv.count ) ) {

				metrics.invalidFaces ++;
				continue;

			}

			const p = ids.map( id => [ uv.getX( id ), uv.getY( id ) ] );
			if ( p.some( v => ! Number.isFinite( v[ 0 ] ) || ! Number.isFinite( v[ 1 ] ) || v[ 0 ] < 0 || v[ 0 ] > 1 || v[ 1 ] < 0 || v[ 1 ] > 1 ) ) {

				metrics.invalidFaces ++;
				continue;

			}

			const chartId = record.faceCharts[ f ];
			if ( chartId === - 1 ) {

				metrics.excludedFaces ++;
				continue;

			}

			const chart = result.charts[ chartId ];
			if ( ! chart ) {

				metrics.invalidFaces ++;
				continue;

			}

			chartFaces[ chartId ] ++;
			const det = orient( p[ 0 ], p[ 1 ], p[ 2 ] );
			if ( det === 0 ) metrics.collapsedFaces ++;
			if ( det < 0 ) metrics.flippedFaces ++;
			if ( Math.abs( det ) * result.resolution ** 2 / 2 < limits.minTrianglePixels ) metrics.tinyFaces ++;
			metrics.uvArea += Math.abs( det ) / 2;
			for ( const v of p ) {

				const x = v[ 0 ] * result.resolution, y = v[ 1 ] * result.resolution;
				if ( x < chart.x + result.padding - 1e-4 || y < chart.y + result.padding - 1e-4 ||
					x > chart.x + chart.width - result.padding + 1e-4 || y > chart.y + chart.height - result.padding + 1e-4 ) metrics.paddingViolations ++;

			}

			const world = ids.map( id => record.mesh.getVertexPosition( id, new Vector3() ).applyMatrix4( record.mesh.matrixWorld ) );
			const ab = world[ 1 ].sub( world[ 0 ] ), ac = world[ 2 ].sub( world[ 0 ] );
			const cross = new Vector3().crossVectors( ab, ac ).length(), length = ab.length();
			if ( cross > 0 && det > 0 ) {

				const x = ac.dot( ab ) / length, y = cross / length;
				const ux = ( p[ 1 ][ 0 ] - p[ 0 ][ 0 ] ) / length, vx = ( p[ 1 ][ 1 ] - p[ 0 ][ 1 ] ) / length;
				const uy = ( p[ 2 ][ 0 ] - p[ 0 ][ 0 ] - ux * x ) / y, vy = ( p[ 2 ][ 1 ] - p[ 0 ][ 1 ] - vx * x ) / y;
				const trace = ux * ux + vx * vx + uy * uy + vy * vy;
				const delta = Math.hypot( ux * ux + vx * vx - uy * uy - vy * vy, 2 * ( ux * uy + vx * vy ) );
				metrics.maxStretch = Math.max( metrics.maxStretch, ( trace + delta ) / 2 / ( det / cross ) );
				const density = Math.sqrt( det / cross ) * result.resolution;
				metrics.minDensity = Math.min( metrics.minDensity, density );
				metrics.maxDensity = Math.max( metrics.maxDensity, density );

			}

			if ( det !== 0 ) triangles.push( det > 0 ? p : [ p[ 0 ], p[ 2 ], p[ 1 ] ] );

		}

	}

	// All charts share one atlas, so intersections across different meshes matter too.
	const side = Math.max( 1, Math.min( 256, Math.ceil( Math.sqrt( triangles.length ) / 2 ) ) );
	const cells = new Map();
	for ( let i = 0; i < triangles.length; i ++ ) {

		const triangle = triangles[ i ], seen = new Set();
		const minX = Math.floor( Math.min( ...triangle.map( v => v[ 0 ] ) ) * side );
		const maxX = Math.floor( Math.max( ...triangle.map( v => v[ 0 ] ) ) * side );
		const minY = Math.floor( Math.min( ...triangle.map( v => v[ 1 ] ) ) * side );
		const maxY = Math.floor( Math.max( ...triangle.map( v => v[ 1 ] ) ) * side );
		for ( let x = minX; x <= maxX; x ++ ) {

			for ( let y = minY; y <= maxY; y ++ ) {

				const key = x * ( side + 1 ) + y;
				if ( ! cells.has( key ) ) cells.set( key, [] );
				const cell = cells.get( key );
				for ( const j of cell ) {

					if ( seen.has( j ) ) continue;
					seen.add( j );
					const tolerance = Math.min( polygonArea( triangle ), polygonArea( triangles[ j ] ) ) * 1e-5;
					if ( intersectionArea( triangle, triangles[ j ] ) > Math.max( 1e-14, tolerance ) ) metrics.overlapPairs ++;

				}

				cell.push( i );

			}

		}

	}

	if ( ! Number.isFinite( metrics.minDensity ) ) metrics.minDensity = 0;
	metrics.singleTriangleChartRatio = chartFaces.length ? chartFaces.filter( count => count === 1 ).length / chartFaces.length : 0;
	for ( const [ key, message ] of [
		[ 'invalidFaces', 'Faces have missing, nonfinite, out-of-bounds UVs or invalid chart mappings.' ],
		[ 'excludedFaces', 'Faces were excluded from the atlas; inspect source degeneracy or precision loss.' ],
		[ 'collapsedFaces', 'Faces collapsed to zero UV area after Float32 storage.' ],
		[ 'flippedFaces', 'Faces have reversed UV winding.' ],
		[ 'tinyFaces', `Faces occupy less than ${ limits.minTrianglePixels } atlas pixels squared.` ],
		[ 'paddingViolations', 'UV vertices intrude into chart gutters.' ],
		[ 'overlapPairs', 'Triangle pairs overlap with positive UV area.' ]
	] ) {

		if ( metrics[ key ] ) add( key, message, metrics[ key ] );

	}

	if ( metrics.faces === 0 || triangles.length === 0 ) add( 'empty', 'No usable UV triangles were generated.' );
	if ( metrics.maxStretch > limits.maxStretch ) add( 'stretch', `Maximum anisotropic stretch ${ metrics.maxStretch.toFixed( 2 ) } exceeds ${ limits.maxStretch }.` );
	if ( metrics.minDensity > 0 && metrics.maxDensity / metrics.minDensity > limits.maxDensityRatio ) add( 'density', `Texel density ratio ${ ( metrics.maxDensity / metrics.minDensity ).toFixed( 2 ) } exceeds ${ limits.maxDensityRatio }.` );
	if ( metrics.faces >= 20 && metrics.singleTriangleChartRatio > limits.maxSingleTriangleRatio ) add( 'fragmentation', `${ ( metrics.singleTriangleChartRatio * 100 ).toFixed( 1 ) }% of charts contain only one triangle.` );
	return { passed: issues.length === 0, issues, metrics };

}

function orient( a, b, c ) {

	return ( b[ 0 ] - a[ 0 ] ) * ( c[ 1 ] - a[ 1 ] ) - ( b[ 1 ] - a[ 1 ] ) * ( c[ 0 ] - a[ 0 ] );

}

function polygonArea( points ) {

	let sum = 0;
	for ( let i = 1; i < points.length - 1; i ++ ) sum += orient( points[ 0 ], points[ i ], points[ i + 1 ] );
	return Math.abs( sum ) / 2;

}

function intersectionArea( a, b ) {

	let polygon = a;
	for ( let i = 0; i < 3 && polygon.length; i ++ ) {

		const p = b[ i ], q = b[ ( i + 1 ) % 3 ], next = [];
		for ( let j = 0; j < polygon.length; j ++ ) {

			const from = polygon[ j ], to = polygon[ ( j + 1 ) % polygon.length ];
			const da = orient( p, q, from ), db = orient( p, q, to );
			if ( da >= 0 ) next.push( from );
			if ( ( da < 0 ) !== ( db < 0 ) ) {

				const t = da / ( da - db );
				next.push( [ from[ 0 ] + ( to[ 0 ] - from[ 0 ] ) * t, from[ 1 ] + ( to[ 1 ] - from[ 1 ] ) * t ] );

			}

		}

		polygon = next;

	}

	return polygonArea( polygon );

}

export { analyzeUVUnwrap };
