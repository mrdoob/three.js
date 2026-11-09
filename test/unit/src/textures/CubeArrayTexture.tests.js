import { CubeArrayTexture, DataTexture, FloatType, Mesh, NodeMaterial, OrthographicCamera, PlaneGeometry, RenderTarget, Scene, LinearSRGBColorSpace, NearestFilter } from 'three/webgpu';
import * as Core from '../../../../src/Three.Core.js';
import * as Nodes from '../../../../src/Three.WebGPU.Nodes.js';
import { cubeTexture, vec3, vec4 } from 'three/tsl';
import { getSharedRenderer } from '../nodes/tsl/gpu-test-utils.js';

const colors = [[ 255, 0, 0 ], [ 0, 255, 0 ], [ 0, 0, 255 ], [ 255, 255, 0 ], [ 255, 0, 255 ], [ 0, 255, 255 ]];
const directions = [[ - 1, 0, 0 ], [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, - 1, 0 ], [ 0, 0, 1 ], [ 0, 0, - 1 ]];

function faces( size, offset = 0, data = false ) {

	return colors.map( ( _, i ) => {

		const color = colors[ ( i + offset ) % 6 ];
		if ( data ) {

			const pixels = new Uint8Array( size * size * 4 );
			for ( let j = 0; j < pixels.length; j += 4 ) pixels.set( [ ...color, 255 ], j );
			return new DataTexture( pixels, size, size );

		}

		const canvas = document.createElement( 'canvas' );
		canvas.width = canvas.height = size;
		const context = canvas.getContext( '2d' );
		context.fillStyle = `rgb(${ color.join( ',' ) })`;
		context.fillRect( 0, 0, size, size );
		return canvas;

	} );

}

export default QUnit.module( 'Textures', () => {

	QUnit.module( 'CubeArrayTexture', () => {

		QUnit.test( 'WebGPU exports and cube-count API', assert => {

			assert.notOk( 'CubeArrayTexture' in Core, 'Not exported by the common core' );
			assert.strictEqual( Nodes.CubeArrayTexture, CubeArrayTexture, 'Both WebGPU entry points export the same class' );
			const cubes = [ faces( 4 ), faces( 4 ) ];
			const texture = new CubeArrayTexture( cubes );
			assert.strictEqual( texture.depth, 2, 'Depth counts cubemaps' );
			assert.strictEqual( texture.images, cubes, 'Nested images are the texture source' );
			assert.false( texture.flipY );
			const clone = texture.clone();
			assert.strictEqual( clone.source, texture.source, 'Clone shares the image source like CubeTexture' );
			assert.strictEqual( clone.depth, 2 );
			const allocation = new RenderTarget( 4, 4, { depth: 18 } );
			const targetTexture = new CubeArrayTexture().copy( allocation.texture );
			assert.strictEqual( targetTexture.depth, 3, 'Render-target allocation is exposed as three cubes' );
			allocation.dispose();

		} );

		QUnit.test( 'Image validation and serialization', assert => {

			assert.throws( () => new CubeArrayTexture( [ faces( 4 ).slice( 1 ) ] ), /six faces/ );
			assert.throws( () => new CubeArrayTexture( [ faces( 4 ), faces( 8 ) ] ), /same size/ );
			assert.throws( () => new CubeArrayTexture( [[ null, ...faces( 4 ).slice( 1 ) ]] ), /Missing/ );
			const texture = new CubeArrayTexture();
			texture.images = [ faces( 4, 0, true ), faces( 4, 1, true ) ];
			assert.strictEqual( texture.depth, 2, 'An empty placeholder accepts images later' );
			const json = texture.source.toJSON();
			assert.strictEqual( json.url.length, 2 );
			assert.strictEqual( json.url[ 1 ].length, 6 );
			assert.deepEqual( json.url[ 1 ][ 0 ].data.slice( 0, 4 ), [ 0, 255, 0, 255 ], 'Serialization preserves nested typed faces' );
			texture.images[ 1 ][ 0 ].image.width = 2;
			assert.throws( () => texture._validateImages( texture.images, true ), /same size/ );

		} );

		QUnit.test( 'Render-target cube layers can be rendered and sampled independently', async assert => {

			const renderer = await getSharedRenderer( 'webgpu' );
			if ( ! renderer ) {

				assert.ok( true, 'SKIPPED: WebGPU unavailable' ); return;

			}

			const capture = new RenderTarget( 4, 4, { depth: 12, depthBuffer: false } );
			capture.texture = new CubeArrayTexture().copy( capture.texture );
			const target = new RenderTarget( 4, 4 );
			target.texture.colorSpace = capture.texture.colorSpace = LinearSRGBColorSpace;
			const previous = renderer.getRenderTarget();
			const material = new NodeMaterial();
			const geometry = new PlaneGeometry( 2, 2 );
			const scene = new Scene();
			scene.add( new Mesh( geometry, material ) );
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
			camera.position.z = 2;
			try {

				for ( let layer = 0; layer < 12; layer ++ ) {

					material.fragmentNode = vec4( ...colors[ layer % 6 ].map( x => x / 255 ), 1 );
					material.needsUpdate = true;
					renderer.setRenderTarget( capture, layer );
					renderer.render( scene, camera );

				}

				for ( let layer = 0; layer < 12; layer ++ ) {

					material.fragmentNode = cubeTexture( capture.texture, vec3( ...directions[ layer % 6 ] ) ).depth( Math.floor( layer / 6 ) );
					material.needsUpdate = true;
					renderer.setRenderTarget( target );
					renderer.render( scene, camera );
					const pixels = await renderer.readRenderTargetPixelsAsync( target, 2, 2, 1, 1 );
					assert.ok( colors[ layer % 6 ].every( ( value, channel ) => Math.abs( pixels[ channel ] - value ) < 3 ), `Captured layer ${ layer }: ${ Array.from( pixels ) }` );

				}

			} finally {

				renderer.setRenderTarget( previous );
				capture.dispose();
				target.dispose();
				geometry.dispose();
				material.dispose();

			}

		} );

		for ( const source of [ 'Canvas', 'Image', 'ImageBitmap', 'DataTexture', 'Nearest', 'Float' ] ) {

			QUnit.test( `${ source } uploads, cube selection, mipmaps and reupload`, async assert => {

				const data = source === 'DataTexture' || source === 'Float';
				async function makeFaces( size, offset ) {

					const images = faces( size, offset, data );
					if ( source === 'Float' ) for ( const face of images ) {

						face.image.data = Float32Array.from( face.image.data, value => value / 255 );
						face.type = FloatType;

					}

					if ( source === 'ImageBitmap' ) return Promise.all( images.map( image => createImageBitmap( image ) ) );
					if ( source === 'Image' ) return Promise.all( images.map( async canvas => {

						const image = new Image();
						image.src = canvas.toDataURL();
						await image.decode();
						return image;

					} ) );
					return images;

				}

				const renderer = await getSharedRenderer( 'webgpu' );
				if ( ! renderer ) {

					assert.ok( true, 'SKIPPED: WebGPU unavailable' ); return;

				}

				const texture = new CubeArrayTexture();
				texture.magFilter = NearestFilter;
				if ( source === 'Nearest' || source === 'Float' ) texture.minFilter = NearestFilter;
				if ( source === 'Float' ) texture.type = FloatType;
				const target = new RenderTarget( 4, 4 );
				target.texture.colorSpace = LinearSRGBColorSpace;
				const previousTarget = renderer.getRenderTarget();
				const material = new NodeMaterial();
				const geometry = new PlaneGeometry( 2, 2 );
				const scene = new Scene();
				scene.add( new Mesh( geometry, material ) );
				const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
				camera.position.z = 2;
				async function check( cube, face, level, expected ) {

					material.fragmentNode = cubeTexture( texture, vec3( ...directions[ face ] ) ).depth( cube ).level( level );
					material.needsUpdate = true;
					renderer.setRenderTarget( target );
					renderer.render( scene, camera );
					const pixels = await renderer.readRenderTargetPixelsAsync( target, 2, 2, 1, 1 );
					assert.ok( expected.every( ( value, channel ) => Math.abs( pixels[ channel ] - value ) < 3 ), `Cube ${ cube }, face ${ face }, mip ${ level }: ${ Array.from( pixels ) }` );

				}

				try {

					await check( 0, 0, 0, [ 0, 0, 0 ] );
					texture.images = [ await makeFaces( 4, 0 ), await makeFaces( 4, 1 ) ];
					texture.needsUpdate = true;
					for ( let cube = 0; cube < 2; cube ++ ) {

						for ( let face = 0; face < 6; face ++ ) await check( cube, face, 0, colors[ ( face + cube ) % 6 ] );

					}

					const gpuTexture = renderer.backend.get( texture ).texture;
					assert.strictEqual( gpuTexture.depthOrArrayLayers, 12, 'Backend allocates six face layers per cube' );
					await check( 1, 4, 2, colors[ 5 ] );
					texture.images = [ await makeFaces( 4, 2 ), await makeFaces( 4, 3 ) ];
					texture.needsUpdate = true;
					await check( 0, 0, 0, colors[ 2 ] );
					await check( 1, 0, 0, colors[ 3 ] );
					assert.strictEqual( renderer.backend.get( texture ).texture, gpuTexture, 'Same-size reupload reuses the allocation' );
					texture.dispose();
					texture.generateMipmaps = false;
					texture.mipmaps = [ { images: [ await makeFaces( 2, 4 ), await makeFaces( 2, 5 ) ] }, { images: [ await makeFaces( 1, 1 ), await makeFaces( 1, 2 ) ] } ];
					texture.needsUpdate = true;
					await check( 0, 0, 1, colors[ 4 ] );
					await check( 1, 0, 2, colors[ 2 ] );
					texture.flipY = true;
					texture.needsUpdate = true;
					await check( 0, 2, 0, colors[ 5 ] );
					await check( 1, 3, 1, colors[ 1 ] );

				} finally {

					renderer.setRenderTarget( previousTarget );
					texture.dispose();
					target.dispose();
					geometry.dispose();
					material.dispose();

				}

			} );

		}

	} );

} );
