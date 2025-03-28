import {
	Color,
	ColorManagement,
	DefaultLoadingManager,
	FileLoader,
	FrontSide,
	Loader,
	LoaderUtils,
	MeshPhongMaterial,
	RepeatWrapping,
	TextureLoader,
	Vector2,
	SRGBColorSpace
} from 'three';

/**
 * A loader for the MTL format.
 *
 * The Material Template Library format (MTL) or .MTL File Format is a companion file format
 * to OBJ that describes surface shading (material) properties of objects within one or more
 * OBJ files.
 *
 * ```js
 * const loader = new MTLLoader();
 * const materials = await loader.loadAsync( 'models/obj/male02/male02.mtl' );
 *
 * const objLoader = new OBJLoader();
 * objLoader.setMaterials( materials );
 * ```
 *
 * @augments Loader
 */
class MTLLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded MTL asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(MaterialCreator)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( this.path === '' ) ? LoaderUtils.extractUrlBase( url ) : this.path;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Sets the material options.
	 *
	 * @param {MTLLoader~MaterialOptions} value - The material options.
	 * @return {MTLLoader} A reference to this loader.
	 */
	setMaterialOptions( value ) {

		this.materialOptions = value;
		return this;

	}

	/**
	 * Parses the given MTL data and returns the resulting material creator.
	 *
	 * @param {string} text - The raw MTL data as a string.
	 * @param {string} path - The URL base path.
	 * @return {MaterialCreator} The material creator.
	 */
	parse( text, path ) {

		const lines = text.split( '\n' );
		let info = {};
		const delimiter_pattern = /\s+/;
		const materialsInfo = {};

		for ( let i = 0; i < lines.length; i ++ ) {

			let line = lines[ i ];
			line = line.trim();

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				// Blank line or comment ignore
				continue;

			}

			const pos = line.indexOf( ' ' );

			let key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
			key = key.toLowerCase();

			let value = ( pos >= 0 ) ? line.substring( pos + 1 ) : '';
			value = value.trim();

			if ( key === 'newmtl' ) {

				// New material

				info = { name: value };
				materialsInfo[ value ] = info;

			} else {

				if ( key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke' ) {

					const ss = value.split( delimiter_pattern, 3 );
					info[ key ] = [ parseFloat( ss[ 0 ] ), parseFloat( ss[ 1 ] ), parseFloat( ss[ 2 ] ) ];

				} else {

					info[ key ] = value;

				}

			}

		}

		const materialCreator = new MaterialCreator( this.resourcePath || path, this.materialOptions );
		materialCreator.setCrossOrigin( this.crossOrigin );
		materialCreator.setManager( this.manager );
		materialCreator.setMaterials( materialsInfo );
		return materialCreator;

	}

}

/**
 * Material options of `MTLLoader`.
 *
 * @typedef {Object} MTLLoader~MaterialOptions
 * @property {(FrontSide|BackSide|DoubleSide)} [side=FrontSide] - Which side to apply the material.
 * @property {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)} [wrap=RepeatWrapping] - What type of wrapping to apply for textures.
 * @property {boolean} [normalizeRGB=false] - Whether RGB colors should be normalized to `0-1` from `0-255`.
 * @property {boolean} [ignoreZeroRGBs=false] - Ignore values of RGBs (Ka,Kd,Ks) that are all 0's.
 */

class MaterialCreator {

	constructor( baseUrl = '', options = {} ) {

		this.baseUrl = baseUrl;
		this.options = options;
		this.materialsInfo = {};
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

		this.crossOrigin = 'anonymous';

		this.side = ( this.options.side !== undefined ) ? this.options.side : FrontSide;
		this.wrap = ( this.options.wrap !== undefined ) ? this.options.wrap : RepeatWrapping;

	}

	setCrossOrigin( value ) {

		this.crossOrigin = value;
		return this;

	}

	setManager( value ) {

		this.manager = value;

	}

	setMaterials( materialsInfo ) {

		this.materialsInfo = this.convert( materialsInfo );
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

	}

	convert( materialsInfo ) {

		if ( ! this.options ) return materialsInfo;

		const converted = {};

		for ( const mn in materialsInfo ) {

			// Convert materials info into normalized form based on options

			const mat = materialsInfo[ mn ];

			const covmat = {};

			converted[ mn ] = covmat;

			for ( const prop in mat ) {

				let save = true;
				let value = mat[ prop ];
				const lprop = prop.toLowerCase();

				switch ( lprop ) {

					case 'kd':
					case 'ka':
					case 'ks':

						// Diffuse color (color under white light) using RGB values

						if ( this.options && this.options.normalizeRGB ) {

							value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

						}

						if ( this.options && this.options.ignoreZeroRGBs ) {

							if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 2 ] === 0 ) {

								// ignore

								save = false;

							}

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

	}

	preload() {

		for ( const mn in this.materialsInfo ) {

			this.create( mn );

		}

	}

	getIndex( materialName ) {

		return this.nameLookup[ materialName ];

	}

	getAsArray() {

		let index = 0;

		for ( const mn in this.materialsInfo ) {

			this.materialsArray[ index ] = this.create( mn );
			this.nameLookup[ mn ] = index;
			index ++;

		}

		return this.materialsArray;

	}

	create( materialName ) {

		if ( this.materials[ materialName ] === undefined ) {

			this.createMaterial_( materialName );

		}

		return this.materials[ materialName ];

	}

	createMaterial_( materialName ) {

		// Create material

		const scope = this;
		const mat = this.materialsInfo[ materialName ];
		const params = {

			name: materialName,
			side: this.side

		};

		function resolveURL( baseUrl, url ) {

			if ( typeof url !== 'string' || url === '' )
				return '';

			// Absolute URL
			if ( /^https?:\/\//i.test( url ) ) return url;

			return baseUrl + url;

		}

		function setMapForType( mapType, value ) {

			if ( params[ mapType ] ) return; // Keep the first encountered texture

			const texParams = scope.getTextureParams( value, params );
			const map = scope.loadTexture( resolveURL( scope.baseUrl, texParams.url ) );

			map.repeat.copy( texParams.scale );
			map.offset.copy( texParams.offset );

			map.wrapS = scope.wrap;
			map.wrapT = scope.wrap;

			if ( mapType === 'map' || mapType === 'emissiveMap' ) {

				map.colorSpace = SRGBColorSpace;

			}

			params[ mapType ] = map;

		}

		for ( const prop in mat ) {

			const value = mat[ prop ];
			let n;

			if ( value === '' ) continue;

			switch ( prop.toLowerCase() ) {

				// Ns is material specular exponent

				case 'kd':

					// Diffuse color (color under white light) using RGB values

					params.color = ColorManagement.toWorkingColorSpace( new Color().fromArray( value ), SRGBColorSpace );

					break;

				case 'ks':

					// Specular color (color when light is reflected from shiny surface) using RGB values
					params.specular = ColorManagement.toWorkingColorSpace( new Color().fromArray( value ), SRGBColorSpace );

					break;

				case 'ke':

					// Emissive using RGB values
					params.emissive = ColorManagement.toWorkingColorSpace( new Color().fromArray( value ), SRGBColorSpace );

					break;

				case 'map_kd':

					// Diffuse texture map

					setMapForType( 'map', value );

					break;

				case 'map_ks':

					// Specular map

					setMapForType( 'specularMap', value );

					break;

				case 'map_ke':

					// Emissive map

					setMapForType( 'emissiveMap', value );

					break;

				case 'norm':

					setMapForType( 'normalMap', value );

					break;

				case 'map_bump':
				case 'bump':

					// Bump texture map

					setMapForType( 'bumpMap', value );

					break;

				case 'disp':

					// Displacement texture map

					setMapForType( 'displacementMap', value );

					break;

				case 'map_d':

					// Alpha map

					setMapForType( 'alphaMap', value );
					params.transparent = true;

					break;

				case 'ns':

					// The specular exponent (defines the focus of the specular highlight)
					// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

					params.shininess = parseFloat( value );

					break;

				case 'd':
					n = parseFloat( value );

					if ( n < 1 ) {

						params.opacity = n;
						params.transparent = true;

					}

					break;

				case 'tr':
					n = parseFloat( value );

					if ( this.options && this.options.invertTrProperty ) n = 1 - n;

					if ( n > 0 ) {

						params.opacity = 1 - n;
						params.transparent = true;

					}

					break;

				default:
					break;

			}

		}

		this.materials[ materialName ] = new MeshPhongMaterial( params );
		return this.materials[ materialName ];

	}

	getTextureParams( value, matParams ) {

		const texParams = {

			scale: new Vector2( 1, 1 ),
			offset: new Vector2( 0, 0 )

		 };

		const items = value.split( /\s+/ );
		let pos;

		pos = items.indexOf( '-bm' );

		if ( pos >= 0 ) {

			matParams.bumpScale = parseFloat( items[ pos + 1 ] );
			items.splice( pos, 2 );

		}

		pos = items.indexOf( '-mm' );

		if ( pos >= 0 ) {

			matParams.displacementBias = parseFloat( items[ pos + 1 ] );
			matParams.displacementScale = parseFloat( items[ pos + 2 ] );
			items.splice( pos, 3 );

		}

		pos = items.indexOf( '-s' );

		if ( pos >= 0 ) {

			texParams.scale.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
			items.splice( pos, 4 ); // we expect 3 parameters here!

		}

		pos = items.indexOf( '-o' );

		if ( pos >= 0 ) {

			texParams.offset.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
			items.splice( pos, 4 ); // we expect 3 parameters here!

		}

		texParams.url = items.join( ' ' ).trim();
		return texParams;

	}

	loadTexture( url, mapping, onLoad, onProgress, onError ) {

		const manager = ( this.manager !== undefined ) ? this.manager : DefaultLoadingManager;
		let loader = manager.getHandler( url );

		if ( loader === null ) {

			loader = new TextureLoader( manager );

		}

		if ( loader.setCrossOrigin ) loader.setCrossOrigin( this.crossOrigin );

		const texture = loader.load( url, onLoad, onProgress, onError );

		if ( mapping !== undefined ) texture.mapping = mapping;

		return texture;

	}

}

export { MTLLoader };
