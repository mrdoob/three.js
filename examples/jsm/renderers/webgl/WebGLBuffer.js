import {
	WebGLRenderTarget,
	DataTexture,

	UnsignedByteType,
	ByteType,
	ShortType,
	UnsignedShortType,
	IntType,
	UnsignedIntType,
	FloatType,

	RedFormat,
	RGFormat,
	RGBAFormat
} from 'three';
import { texture, vec2, uint, add, getBufferSrcFunction as getSrcFunction, getBufferOutFunction as getOutFunction } from 'three/nodes';

function getTextureElement( dataTexture, i, width, height ) {

	const x = add( 0.5, i.remainder( width ) ).div( width );
	const y = add( 0.5, i.div      ( width ) ).div( height );

	return texture( dataTexture, vec2( x, y ) );

}

function getTextureType( attribute ) {

	const array = attribute.array;

	let textureType;

	if ( array instanceof Int8Array ) {

		textureType = ByteType;

	} else if ( ( array instanceof Uint8Array ) || ( array instanceof Uint8ClampedArray ) ) {

		textureType = UnsignedByteType;

	} else if ( array instanceof Int16Array ) {

		textureType = ShortType;

	} else if ( array instanceof Uint16Array ) {

		textureType = UnsignedShortType;

	} else if ( array instanceof Int32Array ) {

		textureType = IntType;

	} else if ( array instanceof Uint32Array ) {

		textureType = UnsignedIntType;

	} else if ( array instanceof Float32Array ) {

		textureType = FloatType;

	}

	return textureType;

}

export function getTextureFormat( attribute ) { // @TODO: possibly support impossible type-format combinations by using padding

	switch ( attribute.itemSize ) {

		case 1:
			return RedFormat;

		case 2:
			return RGFormat;

		case 3:
			return null;

		case 4:
			return RGBAFormat;

	}

}

export function calculateWidthHeight( length ) {

	let width; // @TODO: maybe just set width and height to Math.sqrt( length ) and pad the texture with zeroes?
	for ( width = Math.floor( Math.sqrt( length ) ); width > 0; width -- ) {

		if ( length % width === 0 ) break;

	}
	const height = length / width;

	return { width, height };

}

function createTexture( attribute ) {

	const { width, height } = calculateWidthHeight( attribute.count );
	const texture = new DataTexture( attribute.array, width, height, getTextureFormat( attribute ), getTextureType( attribute ) );
	texture.needsUpdate = true;
	return texture;

}

function createRenderTarget( texture ) {

	texture.isRenderTargetTexture = true;
	const renderTarget = new WebGLRenderTarget( texture.image.width, texture.image.height, { depthBuffer: false } );
	renderTarget.texture = texture;
	return renderTarget;

}

export default class WebGLBuffer {

	constructor( attribute ) {

		this.attribute = attribute;

		this.texture = createTexture( attribute );
		this.renderTarget = null;

		this._srcFunction = getSrcFunction( attribute );
		this._outFunction = getOutFunction( attribute );

	}

	getElement( indexNode ) {

		const texture = this.texture;
		const textureElement = getTextureElement( texture, uint( indexNode ), texture.image.width, texture.image.height );
		return this._srcFunction( textureElement.mul( 255 ) );

	}

	setElement( value ) {

		if ( this.renderTarget === null ) this.renderTarget = createRenderTarget( this.texture );

		return this._outFunction( value ).div( 255 );

	}

	dispose() {

		( this.renderTarget !== null ) ? this.renderTarget.dispose() : this.texture.dispose();

	}

}
