import {
	QuadMesh,
	NodeMaterial,
	WebGPURenderer,
	CanvasTexture
} from 'three';
import { texture, uv } from 'three/tsl';

let _renderer;
const _quadMesh = /*@__PURE__*/ new QuadMesh();

export async function decompress( blitTexture, maxTextureSize = Infinity, renderer = null ) {

	if ( renderer === null ) {

		renderer = _renderer = new WebGPURenderer();
		await renderer.init();

	}

	const material = new NodeMaterial();

	material.fragmentNode = texture( blitTexture, uv().flipY() );

	const width = Math.min( blitTexture.image.width, maxTextureSize );
	const height = Math.min( blitTexture.image.height, maxTextureSize );

	const currentOutputColorSpace = renderer.outputColorSpace;

	renderer.setSize( width, height );
	renderer.outputColorSpace = blitTexture.colorSpace;

	_quadMesh.material = material;
	_quadMesh.render( renderer );

	renderer.outputColorSpace = currentOutputColorSpace;

	const canvas = document.createElement( 'canvas' );
	const context = canvas.getContext( '2d' );

	canvas.width = width;
	canvas.height = height;

	context.drawImage( renderer.domElement, 0, 0, width, height );

	const readableTexture = new CanvasTexture( canvas );

	readableTexture.minFilter = blitTexture.minFilter;
	readableTexture.magFilter = blitTexture.magFilter;
	readableTexture.wrapS = blitTexture.wrapS;
	readableTexture.wrapT = blitTexture.wrapT;
	readableTexture.colorSpace = blitTexture.colorSpace;
	readableTexture.name = blitTexture.name;

	if ( _renderer !== null ) {

		_renderer.dispose();
		_renderer = null;

	}

	return readableTexture;

}
