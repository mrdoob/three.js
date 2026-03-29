import {
	ClampToEdgeWrapping,
	DoubleSide,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	Texture,
	SRGBColorSpace
} from 'three';

/**
 * This class has been made to hold a slice of a volume data.
 *
 * @see {@link Volume}
 * @three_import import { VolumeSlice } from 'three/addons/misc/VolumeSlice.js';
 */
class VolumeSlice {

	/**
	 * Constructs a new volume slice.
	 *
 	 * @param {Volume} volume - The associated volume.
 	 * @param {number} [index=0] - The index of the slice.
 	 * @param {('x'|'y'|'z')} [axis='z'] - For now only 'x', 'y' or 'z' but later it will change to a normal vector.
	 */
	constructor( volume, index = 0, axis = 'z' ) {

		const slice = this;

		/**
		 * The associated volume.
		 *
		 * @type {Volume}
		 */
		this.volume = volume;

		Object.defineProperty( this, 'index', {
			get: function () {

				return index;

			},
			/**
			 * The index of the slice, if changed, will automatically call updateGeometry at the next repaint.
			 *
			 * @name VolumeSlice#index
			 * @type {number}
			 * @default 0
			 * @param {number} value
			 * @return {number}
			 */
			set: function ( value ) {

				index = value;
				slice.geometryNeedsUpdate = true;

			}
		} );

		/**
		 * The normal axis.
		 *
		 * @type {('x'|'y'|'z')}
		 */
		this.axis = axis;

		/**
		 * The final canvas used for the texture.
		 *
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = document.createElement( 'canvas' );

		/**
		 * The rendering context of the canvas.
		 *
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx;

		/**
		 * The intermediary canvas used to paint the data.
		 *
		 * @type {HTMLCanvasElement}
		 */
		this.canvasBuffer = document.createElement( 'canvas' );

		/**
		 * The rendering context of the canvas buffer,
		 *
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctxBuffer;

		this.updateGeometry();


		const canvasMap = new Texture( this.canvas );
		canvasMap.minFilter = LinearFilter;
		canvasMap.generateMipmaps = false;
		canvasMap.wrapS = canvasMap.wrapT = ClampToEdgeWrapping;
		canvasMap.colorSpace = SRGBColorSpace;
		const material = new MeshBasicMaterial( { map: canvasMap, side: DoubleSide, transparent: true } );

		/**
		 * The mesh ready to get used in the scene.
		 *
		 * @type {Mesh}
		 */
		this.mesh = new Mesh( this.geometry, material );
		this.mesh.matrixAutoUpdate = false;

		/**
		 * If set to `true`, `updateGeometry()` will be triggered at the next repaint.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.geometryNeedsUpdate = true;
		this.repaint();

		/**
		 * Width of slice in the original coordinate system, corresponds to the width of the buffer canvas.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.iLength = 0;

		/**
		 * Height of slice in the original coordinate system, corresponds to the height of the buffer canvas.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.jLength = 0;

		/**
		 * Function that allow the slice to access right data.
		 *
		 * @type {?Function}
		 * @see {@link Volume#extractPerpendicularPlane}
		 */
		this.sliceAccess = null;

	}

	/**
	 * Refresh the texture and the geometry if geometryNeedsUpdate is set to `true`.
	 */
	repaint() {

		if ( this.geometryNeedsUpdate ) {

			this.updateGeometry();

		}

		const iLength = this.iLength,
			jLength = this.jLength,
			sliceAccess = this.sliceAccess,
			volume = this.volume,
			canvas = this.canvasBuffer,
			ctx = this.ctxBuffer;


		// get the imageData and pixel array from the canvas
		const imgData = ctx.getImageData( 0, 0, iLength, jLength );
		const data = imgData.data;
		const volumeData = volume.data;
		const upperThreshold = volume.upperThreshold;
		const lowerThreshold = volume.lowerThreshold;
		const windowLow = volume.windowLow;
		const windowHigh = volume.windowHigh;

		// manipulate some pixel elements
		let pixelCount = 0;

		if ( volume.dataType === 'label' ) {

			console.error( 'THREE.VolumeSlice.repaint: label are not supported yet' );

			// This part is currently useless but will be used when colortables will be handled

			// for ( let j = 0; j < jLength; j ++ ) {

			// 	for ( let i = 0; i < iLength; i ++ ) {

			// 		let label = volumeData[ sliceAccess( i, j ) ];
			// 		label = label >= this.colorMap.length ? ( label % this.colorMap.length ) + 1 : label;
			// 		const color = this.colorMap[ label ];
			// 		data[ 4 * pixelCount ] = ( color >> 24 ) & 0xff;
			// 		data[ 4 * pixelCount + 1 ] = ( color >> 16 ) & 0xff;
			// 		data[ 4 * pixelCount + 2 ] = ( color >> 8 ) & 0xff;
			// 		data[ 4 * pixelCount + 3 ] = color & 0xff;
			// 		pixelCount ++;

			// 	}

			// }

		} else {

			for ( let j = 0; j < jLength; j ++ ) {

				for ( let i = 0; i < iLength; i ++ ) {

					let value = volumeData[ sliceAccess( i, j ) ];
					let alpha = 0xff;
					//apply threshold
					alpha = upperThreshold >= value ? ( lowerThreshold <= value ? alpha : 0 ) : 0;
					//apply window level
					value = Math.floor( 255 * ( value - windowLow ) / ( windowHigh - windowLow ) );
					value = value > 255 ? 255 : ( value < 0 ? 0 : value | 0 );

					data[ 4 * pixelCount ] = value;
					data[ 4 * pixelCount + 1 ] = value;
					data[ 4 * pixelCount + 2 ] = value;
					data[ 4 * pixelCount + 3 ] = alpha;
					pixelCount ++;

				}

			}

		}

		ctx.putImageData( imgData, 0, 0 );
		this.ctx.drawImage( canvas, 0, 0, iLength, jLength, 0, 0, this.canvas.width, this.canvas.height );


		this.mesh.material.map.needsUpdate = true;

	}

	/**
	 * Refresh the geometry according to axis and index.
	 * @see {@link Volume#extractPerpendicularPlane}
	 */
	updateGeometry() {

		const extracted = this.volume.extractPerpendicularPlane( this.axis, this.index );
		this.sliceAccess = extracted.sliceAccess;
		this.jLength = extracted.jLength;
		this.iLength = extracted.iLength;
		this.matrix = extracted.matrix;

		this.canvas.width = extracted.planeWidth;
		this.canvas.height = extracted.planeHeight;
		this.canvasBuffer.width = this.iLength;
		this.canvasBuffer.height = this.jLength;
		this.ctx = this.canvas.getContext( '2d' );
		this.ctxBuffer = this.canvasBuffer.getContext( '2d' );

		if ( this.geometry ) this.geometry.dispose(); // dispose existing geometry

		this.geometry = new PlaneGeometry( extracted.planeWidth, extracted.planeHeight );

		if ( this.mesh ) {

			this.mesh.geometry = this.geometry;
			//reset mesh matrix
			this.mesh.matrix.identity();
			this.mesh.applyMatrix4( this.matrix );

		}

		this.geometryNeedsUpdate = false;

	}

}

export { VolumeSlice };
