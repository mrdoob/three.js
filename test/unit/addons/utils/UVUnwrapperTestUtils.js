import { Vector3 } from 'three';

// Independent output audit. Uses polygon clipping, rather than the unwrapper's
// separating-axis test, to detect positive-area triangle intersections.
function auditAtlas( result ) {

	const triangles = [], stretches = [], densities = [];
	let worldArea = 0, uvArea = 0, paddingViolations = 0, collapsed = 0;
	for ( const record of result.meshes ) {

		const geometry = record.geometry, uv = geometry.attributes[ result.attribute ];
		const index = geometry.index;
		for ( let f = 0; f < index.count / 3; f ++ ) {

			const ids = [ 0, 1, 2 ].map( j => index.getX( f * 3 + j ) );
			const p = ids.map( v => [ uv.getX( v ), uv.getY( v ) ] );
			if ( p.some( v => ! Number.isFinite( v[ 0 ] + v[ 1 ] ) || v[ 0 ] < 0 || v[ 0 ] > 1 || v[ 1 ] < 0 || v[ 1 ] > 1 ) ) throw new Error( 'Invalid UV coordinate.' );
			if ( record.faceCharts[ f ] === - 1 ) {

				if ( p.some( v => v[ 0 ] !== 0 || v[ 1 ] !== 0 ) ) throw new Error( 'Ignored faces must have UV (0, 0).' );
				continue;

			}

			const world = ids.map( v => record.mesh.getVertexPosition( v, new Vector3() ).applyMatrix4( record.mesh.matrixWorld ) );
			const ab = world[ 1 ].clone().sub( world[ 0 ] ), ac = world[ 2 ].clone().sub( world[ 0 ] );
			const cross = new Vector3().crossVectors( ab, ac ).length();
			if ( cross === 0 ) continue;
			const det = orient( p[ 0 ], p[ 1 ], p[ 2 ] );
			if ( det <= 0 ) collapsed ++;
			const length = ab.length(), x = ac.dot( ab ) / length, y = cross / length;
			const ux = ( p[ 1 ][ 0 ] - p[ 0 ][ 0 ] ) / length, vx = ( p[ 1 ][ 1 ] - p[ 0 ][ 1 ] ) / length;
			const uy = ( p[ 2 ][ 0 ] - p[ 0 ][ 0 ] - ux * x ) / y, vy = ( p[ 2 ][ 1 ] - p[ 0 ][ 1 ] - vx * x ) / y;
			const trace = ux * ux + vx * vx + uy * uy + vy * vy;
			const delta = Math.hypot( ux * ux + vx * vx - uy * uy - vy * vy, 2 * ( ux * uy + vx * vy ) );
			stretches.push( ( trace + delta ) / 2 / ( det / cross ) );
			densities.push( Math.sqrt( det / cross ) * result.width );
			worldArea += cross / 2;
			uvArea += det / 2;
			const chart = result.charts[ record.faceCharts[ f ] ];
			for ( const v of p ) {

				const px = v[ 0 ] * result.width, py = v[ 1 ] * result.height;
				if ( px < chart.x + result.padding - 1e-4 || py < chart.y + result.padding - 1e-4 ||
					px > chart.x + chart.width - result.padding + 1e-4 || py > chart.y + chart.height - result.padding + 1e-4 ) paddingViolations ++;

			}

			triangles.push( p );

		}

	}

	const side = Math.max( 1, Math.ceil( Math.sqrt( triangles.length ) / 2 ) );
	const cells = new Map();
	let overlaps = 0;
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
					// Float32 roundoff at shared edges is tolerated relative to triangle area.
					const tolerance = Math.min( polygonArea( triangle ), polygonArea( triangles[ j ] ) ) * 1e-5;
					if ( intersectionArea( triangle, triangles[ j ] ) > Math.max( 1e-14, tolerance ) ) overlaps ++;

				}

				cell.push( i );

			}

		}

	}

	stretches.sort( ( a, b ) => a - b );
	densities.sort( ( a, b ) => a - b );
	return {
		overlaps, collapsed, paddingViolations, worldArea, utilization: uvArea,
		maxStretch: stretches.at( - 1 ) || 1, p95Stretch: stretches[ Math.floor( stretches.length * 0.95 ) ] || 1,
		minDensity: densities[ 0 ] || 0, maxDensity: densities.at( - 1 ) || 0
	};

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

export { auditAtlas };
