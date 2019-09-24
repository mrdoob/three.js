import { ImageUtils } from "../extras/ImageUtils.js";
import { TextureLoader } from "../loaders/TextureLoader.js";
import { CubeTextureLoader } from "../loaders/CubeTextureLoader.js";

ImageUtils.loadCompressedTextureCube = function () {

	console.error( 'THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.' );

};

ImageUtils.loadCompressedTexture = function () {

	console.error( 'THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.' );

};

ImageUtils.loadTextureCube = function ( urls, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.' );

	var loader = new CubeTextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	var texture = loader.load( urls, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.loadTexture = function ( url, mapping, onLoad, onError ) {

	console.warn( 'THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.' );

	var loader = new TextureLoader();
	loader.setCrossOrigin( this.crossOrigin );

	var texture = loader.load( url, onLoad, undefined, onError );

	if ( mapping ) texture.mapping = mapping;

	return texture;

};

ImageUtils.crossOrigin = undefined;
