/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.WebGLRenderTarget = function ( width, height, options ) {

	this.uuid = THREE.Math.generateUUID();

	this.width = width;
	this.height = height;

	options = options || {};

	if ( options.minFilter === undefined ) options.minFilter = THREE.LinearFilter;

	this.texture = new THREE.Texture( undefined, undefined, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy );

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;

	this.shareDepthFrom = options.shareDepthFrom !== undefined ? options.shareDepthFrom : null;

};

THREE.WebGLRenderTarget.prototype = {

	constructor: THREE.WebGLRenderTarget,

	get wrapS() {

		console.warn( 'THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.' );

		return this.texture.wrapS;

	},

	set wrapS( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.' );

		this.texture.wrapS = value;

	},

	get wrapT() {

		console.warn( 'THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.' );

		return this.texture.wrapT;

	},

	set wrapT( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.' );

		this.texture.wrapT = value;

	},

	get magFilter() {

		console.warn( 'THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.' );

		return this.texture.magFilter;

	},

	set magFilter( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.' );

		this.texture.magFilter = value;

	},

	get minFilter() {

		console.warn( 'THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.' );

		return this.texture.minFilter;

	},

	set minFilter( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.' );

		this.texture.minFilter = value;

	},

	get anisotropy() {

		console.warn( 'THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.' );

		return this.texture.anisotropy;

	},

	set anisotropy( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.' );

		this.texture.anisotropy = value;

	},

	get offset() {

		console.warn( 'THREE.WebGLRenderTarget: .offset is now .texture.offset.' );

		return this.texture.offset;

	},

	set offset( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .offset is now .texture.offset.' );

		this.texture.offset = value;

	},

	get repeat() {

		console.warn( 'THREE.WebGLRenderTarget: .repeat is now .texture.repeat.' );

		return this.texture.repeat;

	},

	set repeat( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .repeat is now .texture.repeat.' );

		this.texture.repeat = value;

	},

	get format() {

		console.warn( 'THREE.WebGLRenderTarget: .format is now .texture.format.' );

		return this.texture.format;

	},

	set format( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .format is now .texture.format.' );

		this.texture.format = value;

	},

	get type() {

		console.warn( 'THREE.WebGLRenderTarget: .type is now .texture.type.' );

		return this.texture.type;

	},

	set type( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .type is now .texture.type.' );

		this.texture.type = value;

	},

	get generateMipmaps() {

		console.warn( 'THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.' );

		return this.texture.generateMipmaps;

	},

	set generateMipmaps( value ) {

		console.warn( 'THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.' );

		this.texture.generateMipmaps = value;

	},

	//

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

		this.shareDepthFrom = source.shareDepthFrom;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.WebGLRenderTarget.prototype );
