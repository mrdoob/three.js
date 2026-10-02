/**
 * LUTMath.js - Mathematical operations for LUT 3D Generator
 */

import { REVISION } from 'three';

// Monotone cubic spline evaluation for curve points
export function evaluateSpline( t, points ) {

	if ( ! points || points.length === 0 ) return t;
	if ( points.length === 1 ) return points[ 0 ].y;

	const pts = points;

	if ( t <= pts[ 0 ].x ) return pts[ 0 ].y;
	if ( t >= pts[ pts.length - 1 ].x ) return pts[ pts.length - 1 ].y;

	// Find segment
	let i = 0;
	while ( i < pts.length - 1 && pts[ i + 1 ].x < t ) {

		i ++;

	}

	const p0 = pts[ i ];
	const p1 = pts[ i + 1 ];
	const h = p1.x - p0.x;

	if ( h <= 0.00001 ) return p0.y;

	// Secants
	const d = ( p1.y - p0.y ) / h;

	// Tangents computation (Fritsch-Carlson monotone cubic Hermite)
	let m0 = d;
	let m1 = d;

	if ( i > 0 ) {

		const prevD = ( p0.y - pts[ i - 1 ].y ) / ( p0.x - pts[ i - 1 ].x );
		m0 = 0.5 * ( prevD + d );

	}

	if ( i < pts.length - 2 ) {

		const nextD = ( pts[ i + 2 ].y - p1.y ) / ( pts[ i + 2 ].x - p1.x );
		m1 = 0.5 * ( d + nextD );

	}

	// Hermite basis
	const localT = ( t - p0.x ) / h;
	const t2 = localT * localT;
	const t3 = t2 * localT;

	const h00 = 2 * t3 - 3 * t2 + 1;
	const h10 = t3 - 2 * t2 + localT;
	const h01 = - 2 * t3 + 3 * t2;
	const h11 = t3 - t2;

	const val = h00 * p0.y + h10 * h * m0 + h01 * p1.y + h11 * h * m1;

	return Math.max( 0, Math.min( 1, val ) );

}

// RGB to HSV conversion
export function rgbToHsv( r, g, b ) {

	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );
	const d = max - min;
	let h = 0;
	const s = max === 0 ? 0 : d / max;
	const v = max;

	if ( max !== min ) {

		switch ( max ) {

			case r: h = ( g - b ) / d + ( g < b ? 6 : 0 ); break;
			case g: h = ( b - r ) / d + 2; break;
			case b: h = ( r - g ) / d + 4; break;

		}

		h /= 6;

	}

	return [ h, s, v ];

}

// HSV to RGB conversion
export function hsvToRgb( h, s, v ) {

	let r = 0, g = 0, b = 0;

	const i = Math.floor( h * 6 );
	const f = h * 6 - i;
	const p = v * ( 1 - s );
	const q = v * ( 1 - f * s );
	const t = v * ( 1 - ( 1 - f ) * s );

	switch ( i % 6 ) {

		case 0: r = v; g = t; b = p; break;
		case 1: r = q; g = v; b = p; break;
		case 2: r = p; g = v; b = t; break;
		case 3: r = p; g = q; b = v; break;
		case 4: r = t; g = p; b = v; break;
		case 5: r = v; g = p; b = q; break;

	}

	return [ r, g, b ];

}

// Main color transformation pipeline
// Trilinear 3D LUT sampling for imported .CUBE datasets
export function sample3DLUT( r, g, b, size, dataLines ) {

	const nr = Math.max( 0, Math.min( 1, r ) );
	const ng = Math.max( 0, Math.min( 1, g ) );
	const nb = Math.max( 0, Math.min( 1, b ) );

	const rx = nr * ( size - 1 );
	const gy = ng * ( size - 1 );
	const bz = nb * ( size - 1 );

	const x0 = Math.floor( rx );
	const x1 = Math.min( size - 1, x0 + 1 );
	const y0 = Math.floor( gy );
	const y1 = Math.min( size - 1, y0 + 1 );
	const z0 = Math.floor( bz );
	const z1 = Math.min( size - 1, z0 + 1 );

	const fx = rx - x0;
	const fy = gy - y0;
	const fz = bz - z0;

	const getVal = ( x, y, z ) => {

		const index = z * size * size + y * size + x;
		return dataLines[ index ] || [ x / ( size - 1 ), y / ( size - 1 ), z / ( size - 1 ) ];

	};

	const c000 = getVal( x0, y0, z0 );
	const c100 = getVal( x1, y0, z0 );
	const c010 = getVal( x0, y1, z0 );
	const c110 = getVal( x1, y0, z0 );
	const c001 = getVal( x0, y0, z1 );
	const c101 = getVal( x1, y0, z1 );
	const c011 = getVal( x0, y1, z1 );
	const c111 = getVal( x1, y1, z1 );

	const trilinear = ( ch ) => {

		const c00 = c000[ ch ] * ( 1 - fx ) + c100[ ch ] * fx;
		const c01 = c001[ ch ] * ( 1 - fx ) + c101[ ch ] * fx;
		const c10 = c010[ ch ] * ( 1 - fx ) + c110[ ch ] * fx;
		const c11 = c011[ ch ] * ( 1 - fx ) + c111[ ch ] * fx;

		const c0 = c00 * ( 1 - fy ) + c10 * fy;
		const c1 = c01 * ( 1 - fy ) + c11 * fy;

		return c0 * ( 1 - fz ) + c1 * fz;

	};

	return [ trilinear( 0 ), trilinear( 1 ), trilinear( 2 ) ];

}

export function applyColorTransform( r, g, b, params, pipelineOrder = null ) {

	let cr = r;
	let cg = g;
	let cb = b;

	const order = pipelineOrder || [
		'whiteBalance',
		'exposureHue',
		'lift',
		'gammaBal',
		'gain',
		'offset',
		'contrast',
		'satVibrance'
	];

	for ( let i = 0; i < order.length; i ++ ) {

		const step = order[ i ];

		if ( step.startsWith( 'importedCube_' ) && params.importedCubes && params.importedCubes[ step ] ) {

			const cubeInfo = params.importedCubes[ step ];
			const cubeData = cubeInfo.dataLines || cubeInfo.data;
			if ( cubeData && cubeData.length > 0 ) {

				const [ lr, lg, lb ] = sample3DLUT( cr, cg, cb, cubeInfo.size, cubeData );
				const weight = cubeInfo.weight !== undefined ? cubeInfo.weight : 1.0;
				cr = cr * ( 1 - weight ) + lr * weight;
				cg = cg * ( 1 - weight ) + lg * weight;
				cb = cb * ( 1 - weight ) + lb * weight;

			}

			continue;

		}

		switch ( step ) {

			case 'whiteBalance':
				if ( params.temperature !== 0 || params.tint !== 0 ) {

					const temp = params.temperature / 100;
					const tint = params.tint / 100;
					cr += temp * 0.1;
					cb -= temp * 0.1;
					cg -= tint * 0.1;

				}

				break;

			case 'exposureHue':
				if ( params.exposure !== 0 ) {

					const factor = Math.pow( 2, params.exposure );
					cr *= factor;
					cg *= factor;
					cb *= factor;

				}

				if ( params.brightness ) {

					cr += params.brightness;
					cg += params.brightness;
					cb += params.brightness;

				}

				if ( params.hueShift ) {

					const [ origH, s, v ] = rgbToHsv( Math.max( 0, cr ), Math.max( 0, cg ), Math.max( 0, cb ) );
					let h = ( origH + params.hueShift / 360 ) % 1;
					if ( h < 0 ) h += 1;
					const [ nr, ng, nb ] = hsvToRgb( h, s, v );
					cr = nr; cg = ng; cb = nb;

				}

				break;

			case 'lift':
				if ( params.lift ) {

					const ly = params.lift.y || 0;
					const lr = params.lift.r + ly;
					const lg = params.lift.g + ly;
					const lb = params.lift.b + ly;

					cr += lr * ( 1 - Math.max( 0, Math.min( 1, cr ) ) );
					cg += lg * ( 1 - Math.max( 0, Math.min( 1, cg ) ) );
					cb += lb * ( 1 - Math.max( 0, Math.min( 1, cb ) ) );

				}

				break;

			case 'gammaBal':
				if ( params.gammaBal ) {

					const gy = params.gammaBal.y || 0;
					const gr = Math.pow( 2.0, - ( params.gammaBal.r + gy ) );
					const gg = Math.pow( 2.0, - ( params.gammaBal.g + gy ) );
					const gb = Math.pow( 2.0, - ( params.gammaBal.b + gy ) );

					cr = cr > 0 ? Math.pow( cr, gr ) : cr;
					cg = cg > 0 ? Math.pow( cg, gg ) : cg;
					cb = cb > 0 ? Math.pow( cb, gb ) : cb;

				}

				break;

			case 'gain':
				if ( params.gain ) {

					const gy = params.gain.y || 0;
					const sr = Math.max( 0, 1.0 + ( params.gain.r + gy ) );
					const sg = Math.max( 0, 1.0 + ( params.gain.g + gy ) );
					const sb = Math.max( 0, 1.0 + ( params.gain.b + gy ) );

					cr *= sr;
					cg *= sg;
					cb *= sb;

				}

				break;

			case 'offset':
				if ( params.offset ) {

					const oy = params.offset.y || 0;
					cr += params.offset.r + oy;
					cg += params.offset.g + oy;
					cb += params.offset.b + oy;

				}

				break;

			case 'contrast':
				if ( params.contrast !== 1 ) {

					const pivot = params.contrastPivot !== undefined ? params.contrastPivot : 0.5;
					const c = params.contrast;
					cr = pivot + ( cr - pivot ) * c;
					cg = pivot + ( cg - pivot ) * c;
					cb = pivot + ( cb - pivot ) * c;

				}

				break;

			case 'satVibrance':
				if ( params.saturation !== 1 || params.vibrance !== 0 ) {

					const [ h, origS, origV ] = rgbToHsv( Math.max( 0, cr ), Math.max( 0, cg ), Math.max( 0, cb ) );
					let s = origS;

					if ( params.saturation !== 1 ) {

						s *= params.saturation;

					}

					if ( params.vibrance !== 0 ) {

						const vib = params.vibrance;
						if ( vib > 0 ) {

							s += ( 1 - s ) * vib * 0.5;

						} else {

							s += s * vib * 0.5;

						}

					}

					s = Math.max( 0, Math.min( 1, s ) );
					const v = Math.max( 0, Math.min( 1, origV ) );
					const [ nr, ng, nb ] = hsvToRgb( h, s, v );
					cr = nr; cg = ng; cb = nb;

				}

				break;

		}

	}

	// Gamma Evaluation
	if ( params.gamma !== 1 && params.gamma > 0 ) {

		const invGamma = 1 / params.gamma;
		cr = Math.pow( Math.max( 0, cr ), invGamma );
		cg = Math.pow( Math.max( 0, cg ), invGamma );
		cb = Math.pow( Math.max( 0, cb ), invGamma );

	}

	// Clamp to non-negative before Channel Mixer operations
	cr = Math.max( 0, cr );
	cg = Math.max( 0, cg );
	cb = Math.max( 0, cb );

	// Channel Mixer
	if ( params.channelMixer ) {

		const cm = params.channelMixer;
		const nr = cr * cm.red.r + cg * cm.red.g + cb * cm.red.b;
		const ng = cr * cm.green.r + cg * cm.green.g + cb * cm.green.b;
		const nb = cr * cm.blue.r + cg * cm.blue.g + cb * cm.blue.b;

		cr = nr;
		cg = ng;
		cb = nb;

	}

	// Clamp before curves evaluation (0..1)
	cr = Math.max( 0, Math.min( 1, cr ) );
	cg = Math.max( 0, Math.min( 1, cg ) );
	cb = Math.max( 0, Math.min( 1, cb ) );

	// Curves Evaluation
	if ( params.curves ) {

		// RGB / Master curve
		if ( params.curves.rgb && params.curves.rgb.length > 0 ) {

			cr = evaluateSpline( cr, params.curves.rgb );
			cg = evaluateSpline( cg, params.curves.rgb );
			cb = evaluateSpline( cb, params.curves.rgb );

		}

		// Individual Red, Green, Blue curves
		if ( params.curves.red && params.curves.red.length > 0 ) {

			cr = evaluateSpline( cr, params.curves.red );

		}

		if ( params.curves.green && params.curves.green.length > 0 ) {

			cg = evaluateSpline( cg, params.curves.green );

		}

		if ( params.curves.blue && params.curves.blue.length > 0 ) {

			cb = evaluateSpline( cb, params.curves.blue );

		}

	}

	// Final clamp (0..1)
	return [
		Math.max( 0, Math.min( 1, cr ) ),
		Math.max( 0, Math.min( 1, cg ) ),
		Math.max( 0, Math.min( 1, cb ) )
	];

}

// Generate 3D LUT Float32Array
export function generate3DLUTData( params, size = 32, buffer = null, pipelineOrder = null ) {

	if ( buffer === null ) {

		buffer = new Float32Array( size * size * size * 4 );

	}

	let idx = 0;

	for ( let b = 0; b < size; b ++ ) {

		for ( let g = 0; g < size; g ++ ) {

			for ( let r = 0; r < size; r ++ ) {

				const nr = r / ( size - 1 );
				const ng = g / ( size - 1 );
				const nb = b / ( size - 1 );

				const [ tr, tg, tb ] = applyColorTransform( nr, ng, nb, params, pipelineOrder );

				buffer[ idx ++ ] = tr;
				buffer[ idx ++ ] = tg;
				buffer[ idx ++ ] = tb;
				buffer[ idx ++ ] = 1.0; // Alpha

			}

		}

	}

	return buffer;

}

// Export Adobe .CUBE file format
export function exportCubeFormat( paramsOrBuffer, size = 32, title = 'LUT 3D Generator', pipelineOrder = null ) {

	let output = `#Created by: Three.js ${REVISION} - Color Grading\n`;
	output += `TITLE "${title}"\n`;
	output += `LUT_3D_SIZE ${size}\n\n`;

	if ( paramsOrBuffer instanceof Float32Array ) {

		const buffer = paramsOrBuffer;
		for ( let i = 0; i < buffer.length; i += 4 ) {

			output += `${buffer[ i ].toFixed( 6 )} ${buffer[ i + 1 ].toFixed( 6 )} ${buffer[ i + 2 ].toFixed( 6 )}\n`;

		}

	} else {

		const params = paramsOrBuffer;

		for ( let b = 0; b < size; b ++ ) {

			for ( let g = 0; g < size; g ++ ) {

				for ( let r = 0; r < size; r ++ ) {

					const nr = r / ( size - 1 );
					const ng = g / ( size - 1 );
					const nb = b / ( size - 1 );

					const [ tr, tg, tb ] = applyColorTransform( nr, ng, nb, params, pipelineOrder );

					output += `${tr.toFixed( 6 )} ${tg.toFixed( 6 )} ${tb.toFixed( 6 )}\n`;

				}

			}

		}

	}

	return output;

}

// Parse .CUBE file text into data grid
export function parseCubeFormat( text ) {

	const lines = text.split( /\r?\n/ );
	let size = 0;
	let title = 'Imported LUT';
	const dataLines = [];

	for ( const line of lines ) {

		const trimmed = line.trim();
		if ( ! trimmed || trimmed.startsWith( '#' ) ) continue;

		const upper = trimmed.toUpperCase();
		if ( upper.startsWith( 'TITLE' ) ) {

			const match = trimmed.match( /TITLE\s+"?([^"]+)"?/i );
			if ( match ) title = match[ 1 ];

		} else if ( upper.startsWith( 'LUT_3D_SIZE' ) ) {

			const parts = trimmed.split( /\s+/ );
			size = parseInt( parts[ 1 ], 10 );

		} else if ( upper.startsWith( 'LUT_1D_SIZE' ) || upper.startsWith( 'DOMAIN_MIN' ) || upper.startsWith( 'DOMAIN_MAX' ) ) {

			continue;

		} else {

			const parts = trimmed.split( /\s+/ ).map( Number );
			if ( parts.length >= 3 && ! isNaN( parts[ 0 ] ) && ! isNaN( parts[ 1 ] ) && ! isNaN( parts[ 2 ] ) ) {

				dataLines.push( [ parts[ 0 ], parts[ 1 ], parts[ 2 ] ] );

			}

		}

	}

	if ( size === 0 && dataLines.length > 0 ) {

		size = Math.round( Math.cbrt( dataLines.length ) );

	}

	return {
		title,
		size,
		data: dataLines,
		dataLines: dataLines
	};

}

// Export 2D LUT Canvas for LUTImageLoader (PNG export)
export function exportLUTCanvas( paramsOrBuffer, size = 32, pipelineOrder = null ) {

	const canvas = document.createElement( 'canvas' );
	const width = size * size;
	const height = size;
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext( '2d' );
	const imgData = ctx.createImageData( width, height );
	const data = imgData.data;

	if ( paramsOrBuffer instanceof Float32Array ) {

		const buffer = paramsOrBuffer;
		let idx = 0;

		for ( let b = 0; b < size; b ++ ) {

			for ( let g = 0; g < size; g ++ ) {

				for ( let r = 0; r < size; r ++ ) {

					const tr = buffer[ idx ++ ];
					const tg = buffer[ idx ++ ];
					const tb = buffer[ idx ++ ];
					idx ++; // skip alpha

					const x = b * size + r;
					const y = g;
					const pxIdx = ( y * width + x ) * 4;

					data[ pxIdx ] = Math.round( Math.max( 0, Math.min( 1, tr ) ) * 255 );
					data[ pxIdx + 1 ] = Math.round( Math.max( 0, Math.min( 1, tg ) ) * 255 );
					data[ pxIdx + 2 ] = Math.round( Math.max( 0, Math.min( 1, tb ) ) * 255 );
					data[ pxIdx + 3 ] = 255;

				}

			}

		}

	} else {

		const params = paramsOrBuffer;

		for ( let b = 0; b < size; b ++ ) {

			for ( let g = 0; g < size; g ++ ) {

				for ( let r = 0; r < size; r ++ ) {

					const nr = r / ( size - 1 );
					const ng = g / ( size - 1 );
					const nb = b / ( size - 1 );

					const [ tr, tg, tb ] = applyColorTransform( nr, ng, nb, params, pipelineOrder );

					const x = b * size + r;
					const y = g;
					const idx = ( y * width + x ) * 4;

					data[ idx ] = Math.round( tr * 255 );
					data[ idx + 1 ] = Math.round( tg * 255 );
					data[ idx + 2 ] = Math.round( tb * 255 );
					data[ idx + 3 ] = 255;

				}

			}

		}

	}

	ctx.putImageData( imgData, 0, 0 );
	return canvas;

}



// Default Parameter Object factory
export function createDefaultParams() {

	return {
		exposure: 0,
		brightness: 0,
		contrast: 1.0,
		contrastPivot: 0.5,
		gamma: 1.0,
		saturation: 1.0,
		vibrance: 0,
		temperature: 0,
		tint: 0,
		hueShift: 0,
		lift: { r: 0, g: 0, b: 0, y: 0 },
		gammaBal: { r: 0, g: 0, b: 0, y: 0 },
		gain: { r: 0, g: 0, b: 0, y: 0 },
		offset: { r: 0, g: 0, b: 0, y: 0 },
		channelMixer: {
			red: { r: 1, g: 0, b: 0 },
			green: { r: 0, g: 1, b: 0 },
			blue: { r: 0, g: 0, b: 1 }
		},
		curves: {
			rgb: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 1, y: 1 } ]
		}
	};

}

// Presets Collection
export const LUT_PRESETS = {

	'Neutral (Default)': createDefaultParams(),

	'Cinematic Teal & Orange': {
		...createDefaultParams(),
		contrast: 1.15,
		temperature: 15,
		lift: { r: - 0.05, g: 0.02, b: 0.08 },
		gain: { r: 0.08, g: 0.03, b: - 0.05 },
		curves: {
			rgb: [ { x: 0, y: 0 }, { x: 0.25, y: 0.2 }, { x: 0.75, y: 0.82 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 0.5, y: 0.48 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 0.5, y: 0.54 }, { x: 1, y: 1 } ]
		}
	},

	'Vintage Warm Film': {
		...createDefaultParams(),
		exposure: 0.1,
		contrast: 0.92,
		saturation: 0.85,
		temperature: 25,
		tint: 5,
		lift: { r: 0.04, g: 0.02, b: - 0.02 },
		gain: { r: 0.06, g: 0.04, b: - 0.04 },
		curves: {
			rgb: [ { x: 0, y: 0.05 }, { x: 0.5, y: 0.5 }, { x: 1, y: 0.95 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0.06 }, { x: 1, y: 0.9 } ]
		}
	},

	'Cold Sci-Fi Blue': {
		...createDefaultParams(),
		contrast: 1.2,
		temperature: - 35,
		tint: - 10,
		lift: { r: - 0.04, g: - 0.01, b: 0.06 },
		gain: { r: - 0.06, g: 0.02, b: 0.1 },
		curves: {
			rgb: [ { x: 0, y: 0 }, { x: 0.3, y: 0.22 }, { x: 0.7, y: 0.78 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 1, y: 1 } ]
		}
	},

	'Cyberpunk Neon': {
		...createDefaultParams(),
		contrast: 1.25,
		saturation: 1.3,
		vibrance: 0.4,
		lift: { r: 0.06, g: - 0.04, b: 0.12 },
		gain: { r: 0.1, g: - 0.02, b: 0.08 },
		curves: {
			rgb: [ { x: 0, y: 0 }, { x: 0.2, y: 0.15 }, { x: 0.8, y: 0.88 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 0.5, y: 0.55 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0.05 }, { x: 0.5, y: 0.6 }, { x: 1, y: 1 } ]
		}
	},

	'High Contrast B&W': {
		...createDefaultParams(),
		contrast: 1.35,
		saturation: 0.0,
		curves: {
			rgb: [ { x: 0, y: 0 }, { x: 0.25, y: 0.15 }, { x: 0.75, y: 0.88 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 1, y: 1 } ]
		}
	}

};
