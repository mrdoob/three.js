THREE.MTLLoader = function( baseUrl, options, crossOrigin ) {
	this.baseUrl = baseUrl;
	this.options = options;
	this.crossOrigin = crossOrigin;
};
THREE.MTLLoader.prototype = {
	constructor: THREE.MTLLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		var scope = this;
		var loader = new THREE.XHRLoader();
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {
			onLoad( scope.parse( text ) );

		}, onProgress, onError );
	},
	parse: function ( text ) {
		var lines = text.split( "\n" );
		var info = {};
		var delimiter_pattern = /\s+/;
		var materialsInfo = {};
		for ( var i = 0; i < lines.length; i ++ ) {
			var line = lines[ i ];
			line = line.trim();
			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {
				continue;
			}
			var pos = line.indexOf( ' ' );
			var key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
			key = key.toLowerCase();
			var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : "";
			value = value.trim();
			if ( key === "newmtl" ) {
				info = { name: value };
				materialsInfo[ value ] = info;
			} else if ( info ) {
				if ( key === "ka" || key === "kd" || key === "ks" ) {
					var ss = value.split( delimiter_pattern, 3 );
					info[ key ] = [ parseFloat( ss[0] ), parseFloat( ss[1] ), parseFloat( ss[2] ) ];
				} else {
					info[ key ] = value;
				}
			}
		}
		var materialCreator = new THREE.MTLLoader.MaterialCreator( this.baseUrl, this.options );
		materialCreator.crossOrigin = this.crossOrigin
		materialCreator.setMaterials( materialsInfo );
		return materialCreator;
	}
};
THREE.MTLLoader.MaterialCreator = function( baseUrl, options ) {
	this.baseUrl = baseUrl;
	this.options = options;
	this.materialsInfo = {};
	this.materials = {};
	this.materialsArray = [];
	this.nameLookup = {};
	this.side = ( this.options && this.options.side ) ? this.options.side : THREE.FrontSide;
	this.wrap = ( this.options && this.options.wrap ) ? this.options.wrap : THREE.RepeatWrapping;
};
THREE.MTLLoader.MaterialCreator.prototype = {
	constructor: THREE.MTLLoader.MaterialCreator,
	setMaterials: function( materialsInfo ) {
		this.materialsInfo = this.convert( materialsInfo );
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};
	},
	convert: function( materialsInfo ) {
		if ( !this.options ) return materialsInfo ;
		var converted = {};
		for ( var mn in materialsInfo ) {
			var mat = materialsInfo[ mn ];
			var covmat = {};
			converted[ mn ] = covmat;
			for ( var prop in mat ) {
				var save = true;
				var value = mat[ prop ];
				var lprop = prop.toLowerCase();
				switch ( lprop ) {
					case 'kd':
					case 'ka':
					case 'ks':
						if ( this.options && this.options.normalizeRGB ) {
							value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];
						}
						if ( this.options && this.options.ignoreZeroRGBs ) {
							if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 1 ] === 0 ) {
								save = false;
							}
						}
						break;
					case 'd':
						if ( this.options && this.options.invertTransparency ) {
							value = 1 - value;
						}
						break;
					default:
						break;
				}
				if ( save ) {
					covmat[ lprop ] = value;
				}
			}
		}
		return converted;
	},
	preload: function () {
		for ( var mn in this.materialsInfo ) {
			this.create( mn );
		}
	},
	getIndex: function( materialName ) {
		return this.nameLookup[ materialName ];
	},
	getAsArray: function() {
		var index = 0;
		for ( var mn in this.materialsInfo ) {
			this.materialsArray[ index ] = this.create( mn );
			this.nameLookup[ mn ] = index;
			index ++;
		}
		return this.materialsArray;
	},
	create: function ( materialName ) {
		if ( this.materials[ materialName ] === undefined ) {
			this.createMaterial_( materialName );
		}
		return this.materials[ materialName ];
	},
	createMaterial_: function ( materialName ) {
		var mat = this.materialsInfo[ materialName ];
		var params = {
			name: materialName,
			side: this.side
		};
		for ( var prop in mat ) {
			var value = mat[ prop ];
			switch ( prop.toLowerCase() ) {
				case 'kd':
					params[ 'diffuse' ] = new THREE.Color().fromArray( value );
					break;
				case 'ka':
					break;
				case 'ks':
					params[ 'specular' ] = new THREE.Color().fromArray( value );
					break;
				case 'ns':
					params['shininess'] = value;
					break;
				case 'd':
					if ( value < 1 ) {
						params['transparent'] = true;
						params['opacity'] = value;
					}
					break;
				case 'map_kd':
					params[ 'map' ] = this.loadTexture( this.baseUrl + value );
					params[ 'map' ].wrapS = this.wrap;
					params[ 'map' ].wrapT = this.wrap;
					break;
				case 'map_ks':
					params[ 'specularMap' ] = this.loadTexture( this.baseUrl + value );
					params[ 'specularMap' ].wrapS = this.wrap;
					params[ 'specularMap' ].wrapT = this.wrap;
					break;
				case 'map_norm':
					params[ 'normalMap' ] = this.loadTexture( this.baseUrl + value );
					params[ 'normalMap' ].wrapS = this.wrap;
					params[ 'normalMap' ].wrapT = this.wrap;
					break;
				case 'map_bump':
				case 'bump':
					if ( params[ 'bumpMap' ] ) break;
					params[ 'bumpMap' ] = this.loadTexture( this.baseUrl + value );
					params[ 'bumpMap' ].wrapS = this.wrap;
					params[ 'bumpMap' ].wrapT = this.wrap;
					break;
				default:
					break;
			}
		}
		if ( params[ 'diffuse' ] ) {
			params[ 'color' ] = params[ 'diffuse' ];
		}
		this.materials[ materialName ] = new THREE.MeshPhongMaterial( params );
		return this.materials[ materialName ];
	},
	loadTexture: function ( url, mapping, onLoad, onError ) {
		var texture;
		var loader = THREE.Loader.Handlers.get( url );
		if ( loader !== null ) {
			texture = loader.load( url, onLoad );
		} else {
			texture = new THREE.Texture();
			loader = new THREE.ImageLoader();
			loader.crossOrigin = this.crossOrigin;
			loader.load( url, function ( image ) {
				texture.image = THREE.MTLLoader.ensurePowerOfTwo_( image );
				texture.needsUpdate = true;
				if ( onLoad ) onLoad( texture );
			} );
		}
		if ( mapping !== undefined ) texture.mapping = mapping;
		return texture;
	}
};
THREE.MTLLoader.ensurePowerOfTwo_ = function ( image ) {
	if ( ! THREE.Math.isPowerOfTwo( image.width ) || ! THREE.Math.isPowerOfTwo( image.height ) ) {
		var canvas = document.createElement( "canvas" );
		canvas.width = THREE.MTLLoader.nextHighestPowerOfTwo_( image.width );
		canvas.height = THREE.MTLLoader.nextHighestPowerOfTwo_( image.height );
		var ctx = canvas.getContext("2d");
		ctx.drawImage( image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height );
		return canvas;
	}
	return image;
};
THREE.MTLLoader.nextHighestPowerOfTwo_ = function( x ) {
	-- x;
	for ( var i = 1; i < 32; i <<= 1 ) {
		x = x | x >> i;
	}
	return x + 1;
};
THREE.EventDispatcher.prototype.apply( THREE.MTLLoader.prototype );
