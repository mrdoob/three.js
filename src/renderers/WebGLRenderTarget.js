/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 * @author Marius Kintel / https://github.com/kintel
 */

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/
THREE.WebGLRenderTarget = function ( width, height, options ) {

	this.uuid = THREE.Math.generateUUID();

	this.width = width;
	this.height = height;

	options = options || {};

	this.texture = new THREE.Texture( undefined, undefined, options.wrapS, options.wrapT, options.magFilter, options.minFilter !== undefined ? options.minFilter : THREE.LinearFilter, options.format, options.type, options.anisotropy );

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;

};

THREE.WebGLRenderTarget.prototype = {

	constructor: THREE.WebGLRenderTarget,

	setSize: function ( width, height ) {

		if ( this.width !== width || this.height !== height ) {

			this.width = width;
			this.height = height;

			this.dispose();

		}

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.width = source.width;
		this.height = source.height;

		this.texture = source.texture.clone();

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	},

	get wrapS() {

		return this.texture.wrapS;

	},
	set wrapS( wrapS ) {

		this.texture.wrapS = wrapS;

	},
	get wrapT() {

		return this.texture.wrapT;

	},
	set wrapT( wrapT ) {

		this.texture.wrapT = wrapT;

	},
	get magFilter() {

		return this.texture.magFilter;

	},
	set magFilter( magFilter ) {

		this.texture.magFilter = magFilter;

	},
	get minFilter() {

		return this.texture.minFilter;

	},
	set minFilter( minFilter ) {

		this.texture.minFilter = minFilter;

	},
	get anisotropy() {

		return this.texture.anisotropy;

	},
	set anisotropy( anisotropy ) {

		this.texture.anisotropy = anisotropy;

	},
	get offset() {

		return this.texture.offset;

	},
	set offset( offset ) {

		this.texture.offset = offset;

	},
	get repeat() {

		return this.texture.repeat;

	},
	set repeat( repeat ) {

		this.texture.repeat = repeat;

	},
	get format() {

		return this.texture.format;

	},
	set format( format ) {

		this.texture.format = format;

	},
	get type() {

		return this.texture.type;

	},
	set type( type ) {

		this.texture.type = type;

	},
	get generateMipmaps() {

		return this.texture.generateMipmaps;

	},
	set generateMipmaps( generateMipmaps ) {

		this.texture.generateMipmaps = generateMipmaps;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.WebGLRenderTarget.prototype );
