console.warn( "THREE.VolumeSlice: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * This class has been made to hold a slice of a volume data
 * @class
 * @author Valentin Demeusy / https://github.com/stity
 * @param   {THREE.Volume} volume    The associated volume
 * @param   {number}       [index=0] The index of the slice
 * @param   {string}       [axis='z']      For now only 'x', 'y' or 'z' but later it will change to a normal vector
 * @see THREE.Volume
 */
THREE.VolumeSlice = function ( volume, index, axis ) {

	var slice = this;
	/**
	 * @member {THREE.Volume} volume The associated volume
	 */
	this.volume = volume;
	/**
	 * @member {Number} index The index of the slice, if changed, will automatically call updateGeometry at the next repaint
	 */
	index = index || 0;
	Object.defineProperty( this, 'index', {
		get: function () {

			return index;

		},
		set: function ( value ) {

			index = value;
			slice.geometryNeedsUpdate = true;
			return index;

		}
	} );
	/**
	 * @member {String} axis The normal axis
	 */
	this.axis = axis || 'z';

	/**
	 * @member {HTMLCanvasElement} canvas The final canvas used for the texture
	 */
	/**
	 * @member {CanvasRenderingContext2D} ctx Context of the canvas
	 */
	this.canvas = document.createElement( 'canvas' );
	/**
	 * @member {HTMLCanvasElement} canvasBuffer The intermediary canvas used to paint the data
	 */
	/**
	 * @member {CanvasRenderingContext2D} ctxBuffer Context of the canvas buffer
	 */
	this.canvasBuffer = document.createElement( 'canvas' );
	this.updateGeometry();


	var canvasMap = new THREE.Texture( this.canvas );
	canvasMap.minFilter = THREE.LinearFilter;
	canvasMap.wrapS = canvasMap.wrapT = THREE.ClampToEdgeWrapping;
	var material = new THREE.MeshBasicMaterial( { map: canvasMap, side: THREE.DoubleSide, transparent: true } );
	/**
	 * @member {THREE.Mesh} mesh The mesh ready to get used in the scene
	 */
	this.mesh = new THREE.Mesh( this.geometry, material );
	this.mesh.matrixAutoUpdate = false;
	/**
	 * @member {Boolean} geometryNeedsUpdate If set to true, updateGeometry will be triggered at the next repaint
	 */
	this.geometryNeedsUpdate = true;
	this.repaint();

	/**
	 * @member {Number} iLength Width of slice in the original coordinate system, corresponds to the width of the buffer canvas
	 */

	/**
	 * @member {Number} jLength Height of slice in the original coordinate system, corresponds to the height of the buffer canvas
	 */

	/**
	 * @member {Function} sliceAccess Function that allow the slice to access right data
	 * @see THREE.Volume.extractPerpendicularPlane
	 * @param {Number} i The first coordinate
	 * @param {Number} j The second coordinate
	 * @returns {Number} the index corresponding to the voxel in volume.data of the given position in the slice
	 */


};

THREE.VolumeSlice.prototype = {

	constructor: THREE.VolumeSlice,

	/**
	 * @member {Function} repaint Refresh the texture and the geometry if geometryNeedsUpdate is set to true
	 * @memberof THREE.VolumeSlice
	 */
	repaint: function () {

		if ( this.geometryNeedsUpdate ) {

			this.updateGeometry();

		}

		var iLength = this.iLength,
			jLength = this.jLength,
			sliceAccess = this.sliceAccess,
			volume = this.volume,
			canvas = this.canvasBuffer,
			ctx = this.ctxBuffer;


		// get the imageData and pixel array from the canvas
		var imgData = ctx.getImageData( 0, 0, iLength, jLength );
		var data = imgData.data;
		var volumeData = volume.data;
		var upperThreshold = volume.upperThreshold;
		var lowerThreshold = volume.lowerThreshold;
		var windowLow = volume.windowLow;
		var windowHigh = volume.windowHigh;

		// manipulate some pixel elements
		var pixelCount = 0;

		if ( volume.dataType === 'label' ) {

			//this part is currently useless but will be used when colortables will be handled
			for ( var j = 0; j < jLength; j ++ ) {

				for ( var i = 0; i < iLength; i ++ ) {

					var label = volumeData[ sliceAccess( i, j ) ];
					label = label >= this.colorMap.length ? ( label % this.colorMap.length ) + 1 : label;
					var color = this.colorMap[ label ];
					data[ 4 * pixelCount ] = ( color >> 24 ) & 0xff;
					data[ 4 * pixelCount + 1 ] = ( color >> 16 ) & 0xff;
					data[ 4 * pixelCount + 2 ] = ( color >> 8 ) & 0xff;
					data[ 4 * pixelCount + 3 ] = color & 0xff;
					pixelCount ++;

				}

			}

		} else {

			for ( var j = 0; j < jLength; j ++ ) {

				for ( var i = 0; i < iLength; i ++ ) {

					var value = volumeData[ sliceAccess( i, j ) ];
					var alpha = 0xff;
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

	},

	/**
	 * @member {Function} Refresh the geometry according to axis and index
	 * @see THREE.Volume.extractPerpendicularPlane
	 * @memberof THREE.VolumeSlice
	 */
	updateGeometry: function () {

		var extracted = this.volume.extractPerpendicularPlane( this.axis, this.index );
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

		this.geometry = new THREE.PlaneBufferGeometry( extracted.planeWidth, extracted.planeHeight );

		if ( this.mesh ) {

			this.mesh.geometry = this.geometry;
			//reset mesh matrix
			this.mesh.matrix.identity();
			this.mesh.applyMatrix4( this.matrix );

		}

		this.geometryNeedsUpdate = false;

	}

};
