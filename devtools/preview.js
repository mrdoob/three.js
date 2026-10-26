// Draws an expanded object into a 2D canvas: its triangles flat shaded in its material's color from a
// three quarter view, or its lines or points. Nothing is rendered by three.js, so the page's renderer,
// materials and lights are left alone. The preview is the image, or the reason there is none.

( function () {

	const SIZE = 160; // As the panel's tile
	const PIXEL_RATIO = 2;
	const MARGIN = 1.1;
	const AMBIENT = 0.15;
	const LEVELS = 32; // Shades per color, so neighboring triangles of the same shade are filled together
	const MAP_SAMPLES = 16; // The size a map is shrunk to for its average color
	const GRAY = { r: 0.6, g: 0.6, b: 0.6 }; // For materials without a color
	const WHITE = { r: 1, g: 1, b: 1 }; // For materials without a map
	const FRONT_SIDE = 0; // THREE.FrontSide
	const BACK_SIDE = 1; // THREE.BackSide

	const utils = __THREE_DEVTOOLS__.utils;
	const mapColors = new WeakMap();

	let context = null;
	let sampler = null;

	function dot( a, b ) {

		return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];

	}

	function cross( [ ax, ay, az ], [ bx, by, bz ] ) {

		return [ ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx ];

	}

	function subtract( a, b ) {

		return [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ], a[ 2 ] - b[ 2 ] ];

	}

	function normalize( vector ) {

		const length = Math.hypot( ...vector );
		return vector.map( value => value / length );

	}

	// The axes of the view in the object's space: back points at the viewer, right and up span the image
	const BACK = normalize( [ 1, 0.6, 1.5 ] );
	const RIGHT = normalize( cross( [ 0, 1, 0 ], BACK ) );
	const UP = cross( BACK, RIGHT );

	// From the top left, in view space
	const LIGHT = normalize( [ - 0.4, 0.8, 0.5 ] );

	function createContext( size, options ) {

		const canvas = document.createElement( 'canvas' );
		canvas.width = canvas.height = size;

		return canvas.getContext( '2d', options );

	}

	// --- Colors ---

	function toLinear( value ) {

		return value <= 0.04045 ? value / 12.92 : Math.pow( ( value + 0.055 ) / 1.055, 2.4 );

	}

	// A linear color channel as an sRGB hex byte
	function toHex( value ) {

		const srgb = value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow( value, 1 / 2.4 ) - 0.055;

		return Math.round( Math.min( Math.max( srgb, 0 ), 1 ) * 255 ).toString( 16 ).padStart( 2, '0' );

	}

	// The average color of a material's map, read once from a small copy of its image. Images a canvas
	// can't draw or read back (data, compressed, cross origin) count as white.
	function getMapColor( map ) {

		if ( mapColors.has( map ) ) return mapColors.get( map );

		let color = null;

		try {

			if ( sampler === null ) sampler = createContext( MAP_SAMPLES, { willReadFrequently: true } );

			sampler.clearRect( 0, 0, MAP_SAMPLES, MAP_SAMPLES );
			sampler.drawImage( map.image, 0, 0, MAP_SAMPLES, MAP_SAMPLES );

			const data = sampler.getImageData( 0, 0, MAP_SAMPLES, MAP_SAMPLES ).data;
			const sum = [ 0, 0, 0 ];

			for ( let i = 0; i < data.length; i += 4 ) for ( let j = 0; j < 3; j ++ ) sum[ j ] += data[ i + j ];

			const [ r, g, b ] = sum.map( value => toLinear( value / ( MAP_SAMPLES * MAP_SAMPLES * 255 ) ) );
			color = { r, g, b };

		} catch ( error ) {

			// A cross origin image leaves the canvas unreadable, so it is replaced
			sampler = null;

		}

		mapColors.set( map, color );

		return color;

	}

	// The material's color, tinted by its map, at a shade
	function getColor( material, shade = 1 ) {

		const color = material.color && material.color.isColor ? material.color : GRAY;
		const map = ( material.map && material.map.image && getMapColor( material.map ) ) || WHITE;

		return '#' + toHex( color.r * map.r * shade ) + toHex( color.g * map.g * shade ) + toHex( color.b * map.b * shade );

	}

	// --- Geometry ---

	// The geometry's vertices as [ x, y, depth ] in view space, centered on its bounding sphere and scaled to the image
	function project( geometry ) {

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		const position = geometry.attributes.position;
		const { center, radius } = geometry.boundingSphere;
		const scale = SIZE / 2 / ( radius * MARGIN || 1 );
		const points = [];

		for ( let i = 0; i < position.count; i ++ ) {

			const offset = [ position.getX( i ) - center.x, position.getY( i ) - center.y, position.getZ( i ) - center.z ];

			points.push( [ SIZE / 2 + dot( offset, RIGHT ) * scale, SIZE / 2 + dot( offset, UP ) * scale, dot( offset, BACK ) * scale ] );

		}

		return points;

	}

	function getDrawCount( geometry ) {

		return geometry.index !== null ? geometry.index.count : geometry.attributes.position.count;

	}

	// The vertex drawn at a place in the geometry's draw order
	function getVertex( geometry, i ) {

		return geometry.index !== null ? geometry.index.getX( i ) : i;

	}

	// The ranges of the geometry each material draws: its groups when it has several materials
	function getRanges( geometry, materials ) {

		if ( materials.length === 1 || geometry.groups.length === 0 ) return [ { start: 0, count: getDrawCount( geometry ), material: materials[ 0 ] } ];

		return geometry.groups
			.filter( group => materials[ group.materialIndex ] !== undefined )
			.map( group => ( { start: group.start, count: group.count, material: materials[ group.materialIndex ] } ) );

	}

	// --- Drawing, with y up ---

	// Flat shaded triangles, the ones facing away culled, painted from back to front
	function drawTriangles( geometry, materials ) {

		const points = project( geometry );
		const drawCount = getDrawCount( geometry );
		const triangles = [];

		for ( const range of getRanges( geometry, materials ) ) {

			const material = range.material;
			const end = Math.min( range.start + range.count, drawCount );

			for ( let i = range.start; i + 2 < end; i += 3 ) {

				const [ a, b, c ] = [ i, i + 1, i + 2 ].map( j => points[ getVertex( geometry, j ) ] );
				const normal = cross( subtract( b, a ), subtract( c, a ) );
				const length = Math.hypot( ...normal );

				if ( length === 0 ) continue;

				// Counter clockwise is the front, as in three.js. A face seen from behind is lit from behind.
				const facing = Math.sign( normal[ 2 ] );
				if ( ( facing > 0 && material.side === BACK_SIDE ) || ( facing < 0 && material.side === FRONT_SIDE ) ) continue;

				const light = Math.max( 0, facing * dot( normal, LIGHT ) / length );
				const level = Math.round( ( AMBIENT + ( 1 - AMBIENT ) * light ) * ( LEVELS - 1 ) );

				triangles.push( { points: [ a, b, c ], depth: a[ 2 ] + b[ 2 ] + c[ 2 ], color: getColor( material, level / ( LEVELS - 1 ) ) } );

			}

		}

		triangles.sort( ( a, b ) => a.depth - b.depth );

		// A stroke of the same color closes the hairline gaps between neighboring triangles
		context.lineWidth = 0.5;
		context.lineJoin = 'round';

		for ( let i = 0; i < triangles.length; ) {

			const color = triangles[ i ].color;

			context.beginPath();

			for ( ; i < triangles.length && triangles[ i ].color === color; i ++ ) {

				const [ a, b, c ] = triangles[ i ].points;

				context.moveTo( a[ 0 ], a[ 1 ] );
				context.lineTo( b[ 0 ], b[ 1 ] );
				context.lineTo( c[ 0 ], c[ 1 ] );
				context.closePath();

			}

			context.fillStyle = context.strokeStyle = color;
			context.fill();
			context.stroke();

		}

	}

	// The vertices of a line joined in pairs, in a strip, or in a loop
	function drawLines( object, material ) {

		const geometry = object.geometry;
		const points = project( geometry );
		const count = getDrawCount( geometry );
		const point = ( i ) => points[ getVertex( geometry, i ) ];

		const line = ( from, to ) => {

			context.moveTo( from[ 0 ], from[ 1 ] );
			context.lineTo( to[ 0 ], to[ 1 ] );

		};

		context.beginPath();

		for ( let i = 0; i + 1 < count; i += object.isLineSegments ? 2 : 1 ) line( point( i ), point( i + 1 ) );

		if ( object.isLineLoop && count > 2 ) line( point( count - 1 ), point( 0 ) );

		context.lineWidth = 1;
		context.strokeStyle = getColor( material );
		context.stroke();

	}

	function drawPoints( object, material ) {

		context.fillStyle = getColor( material );

		for ( const [ x, y ] of project( object.geometry ) ) context.fillRect( x - 0.75, y - 0.75, 1.5, 1.5 );

	}

	utils.renderPreview = function ( object ) {

		// Only meshes, lines and points have something to preview
		if ( ! object.isMesh && ! object.isLine && ! object.isPoints ) return null;
		if ( object.geometry.attributes.position === undefined ) return null;

		try {

			if ( context === null ) context = createContext( SIZE * PIXEL_RATIO );

			// Flipped, so view space y points up the image
			context.setTransform( PIXEL_RATIO, 0, 0, - PIXEL_RATIO, 0, SIZE * PIXEL_RATIO );
			context.clearRect( 0, 0, SIZE, SIZE );

			const materials = [].concat( object.material );

			if ( object.isMesh ) drawTriangles( object.geometry, materials );
			else if ( object.isLine ) drawLines( object, materials[ 0 ] );
			else drawPoints( object, materials[ 0 ] );

			return context.canvas.toDataURL();

		} catch ( error ) {

			console.warn( 'DevTools: Preview failed:', error );
			return 'Preview failed';

		}

	};

} )();
