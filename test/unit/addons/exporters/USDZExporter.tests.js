import { BoxGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Scene, SphereGeometry, Texture } from 'three';
import { USDZExporter } from '../../../../examples/jsm/exporters/USDZExporter.js';
import { USDLoader } from '../../../../examples/jsm/loaders/USDLoader.js';
import { unzipSync, strFromU8 } from '../../../../examples/jsm/libs/fflate.module.js';

function isValidUSDA( usda ) {

	const header = usda.split( '\n' )[ 0 ];
	if ( header !== '#usda 1.0' ) return false;

	return true;

}

// Some CI images have no functional GPU backend at all -- confirmed in this
// exact codebase's own gpu-test-utils.js, where even WebGPURenderer's WebGL2
// fallback (forceWebGL: true) comes back null in that environment. Detect
// availability at runtime and soft-skip rather than fail, the same
// convention gpu-test-utils.js already uses for its own GPU-backed tests.
function isWebGL2Available() {

	const gl = new OffscreenCanvas( 1, 1 ).getContext( 'webgl2' );
	return gl !== null;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'USDZExporter', () => {

			QUnit.test( 'methods', ( assert ) => {

				const exporter = new USDZExporter();
				assert.ok(
					exporter instanceof USDZExporter,
					'USDZExporter can be instantiated'
				);
				assert.ok(
					typeof exporter.parseAsync === 'function',
					'parseAsync method exists'
				);
				assert.ok( typeof exporter.parse === 'function', 'parse method exists' );
				assert.ok(
					typeof exporter.setTextureUtils === 'function',
					'setTextureUtils method exists'
				);

			} );

			QUnit.test( 'export basic scene', async ( assert ) => {

				const exporter = new USDZExporter();

				const scene = new Scene();
				const geometry = new BoxGeometry( 1, 1, 1 );
				const material = new MeshStandardMaterial( {
					color: 0x00ff00,
					roughness: 0.5,
					metalness: 0.8,
				} );
				const mesh = new Mesh( geometry, material );
				mesh.name = 'box';
				scene.add( mesh );

				const result = await exporter.parseAsync( scene );

				assert.ok(
					result.buffer instanceof ArrayBuffer,
					'Export returns a ArrayBuffer'
				);
				assert.ok(
					result.buffer.byteLength > 0,
					'ArrayBuffer has non-zero length'
				);

				const unzipped = unzipSync( result );
				const fileNames = Object.keys( unzipped );

				const modelFileName = 'model.usda';

				assert.ok( fileNames.length > 0, 'ZIP contains at least one file' );
				assert.equal(
					fileNames[ 0 ],
					modelFileName,
					`First file is ${modelFileName}`
				);
				assert.ok(
					isValidUSDA( strFromU8( unzipped[ modelFileName ] ) ),
					`${modelFileName} has content`
				);

			} );

			QUnit.test( 'export scene with onlyVisible option', async ( assert ) => {

				const exporter = new USDZExporter( );

				const scene = new Scene();

				const geometry = new BoxGeometry( 1, 1, 1 );
				const material1 = new MeshStandardMaterial( { color: 0xff0000 } );
				const material2 = new MeshStandardMaterial( { color: 0x00ff00 } );

				const box1 = new Mesh( geometry, material1 );
				box1.name = 'box1';
				box1.position.set( - 1, 0, 0 );

				const box2 = new Mesh( geometry, material2 );
				box2.name = 'box2';
				box2.position.set( 1, 0, 0 );
				box2.visible = false;

				scene.add( box1 );
				scene.add( box2 );

				// onlyVisible = true

				const options = {
					onlyVisible: true,
				};
				const exportResult = await exporter.parseAsync( scene, options );

				assert.ok(
					exportResult.buffer instanceof ArrayBuffer,
					'Export returns an ArrayBuffer'
				);
				assert.ok(
					exportResult.buffer.byteLength > 0,
					'ArrayBuffer has non-zero length'
				);

				const unzipped = unzipSync( exportResult );
				const fileNames = Object.keys( unzipped );
				const modelFileName = 'model.usda';

				assert.ok( fileNames.includes( modelFileName ), `ZIP contains ${modelFileName}` );

				const usdaContent = strFromU8( unzipped[ modelFileName ] );
				assert.ok( isValidUSDA( usdaContent ), `${modelFileName} is valid USDA` );

				assert.ok( usdaContent.includes( 'box1' ), 'USDA contains box1' );
				assert.ok( ! usdaContent.includes( 'box2' ), 'USDA does not contain box2' );

				// onlyVisible = false

				options.onlyVisible = false;
				const exportResult2 = await exporter.parseAsync( scene, options );

				assert.ok(
					exportResult2.buffer instanceof ArrayBuffer,
					'Export returns an ArrayBuffer'
				);
				assert.ok(
					exportResult2.buffer.byteLength > 0,
					'ArrayBuffer has non-zero length'
				);

				const unzipped2 = unzipSync( exportResult2 );
				const fileNames2 = Object.keys( unzipped2 );

				assert.ok( fileNames2.includes( modelFileName ), `ZIP contains ${modelFileName}` );

				const usdaContent2 = strFromU8( unzipped2[ modelFileName ] );
				assert.ok( isValidUSDA( usdaContent2 ), `${modelFileName} is valid USDA` );

				assert.ok( usdaContent2.includes( 'box1' ), 'USDA contains box1' );
				assert.ok( usdaContent2.includes( 'box2' ), 'USDA contains box2' );

			} );

			QUnit.test( 'export and import', async ( assert ) => {

				const exporter = new USDZExporter();

				const originalScene = new Scene();
				const boxGeometry = new BoxGeometry( 1, 1, 1 );
				const boxMaterial = new MeshStandardMaterial( {
					color: 0x00ff00,
					roughness: 0.5,
					metalness: 0.8,
				} );
				const box = new Mesh( boxGeometry, boxMaterial );
				box.name = 'box1';
				box.position.set( 1, 2, 3 );
				box.scale.set( 0.5, 1.5, 2.0 );
				box.rotation.set( Math.PI / 4, Math.PI / 3, Math.PI / 2 );
				originalScene.add( box );

				const sphereGeometry = new SphereGeometry( 1, 8, 6 );
				const sphereMaterial = new MeshStandardMaterial( {
					color: 0x0000ff,
					roughness: 0.9,
					metalness: 0.1,
				} );
				const sphere = new Mesh( sphereGeometry, sphereMaterial );
				sphere.name = 'sphere1';
				sphere.position.set( 0, 0, 0 );
				originalScene.add( sphere );

				const meshes = [ box, sphere ];

				originalScene.updateMatrixWorld( true );

				const exportResult = await exporter.parseAsync( originalScene );

				assert.ok(
					exportResult.buffer instanceof ArrayBuffer,
					'Export returns an ArrayBuffer'
				);

				const loader = new USDLoader();
				const importedScene = loader.parse( exportResult.buffer );

				assert.ok( importedScene, 'Loader successfully parses exported data' );

				for ( const mesh of meshes ) {

					const name = mesh.name;

					const importedMesh = importedScene.getObjectByName( name );

					assert.ok( importedMesh, 'Found imported mesh in scene' );
					assert.equal( importedMesh.name, name, 'Mesh name preserved' );

					const tolerance = 0.0000001;
					const vectorCloseTo = ( a, b, tolerance ) => {

						assert.closeTo( a.x, b.x, tolerance, 'X matches' );
						assert.closeTo( a.y, b.y, tolerance, 'Y matches' );
						assert.closeTo( a.z, b.z, tolerance, 'Z matches' );

					};

					vectorCloseTo( importedMesh.position, mesh.position, tolerance );
					vectorCloseTo( importedMesh.scale, mesh.scale, tolerance );
					vectorCloseTo( importedMesh.rotation, mesh.rotation, tolerance );

					assert.ok( importedMesh.geometry, 'Geometry exists' );
					assert.ok(
						importedMesh.geometry.attributes.position,
						'Position attribute exists'
					);

					assert.ok( importedMesh.material, 'Material exists' );
					assert.ok( importedMesh.material.isMeshStandardMaterial, 'Material is a MeshStandardMaterial' );
					assert.closeTo( importedMesh.material.color.r, mesh.material.color.r, tolerance, 'Material color r matches' );
					assert.closeTo( importedMesh.material.color.g, mesh.material.color.g, tolerance, 'Material color g matches' );
					assert.closeTo( importedMesh.material.color.b, mesh.material.color.b, tolerance, 'Material color b matches' );
					assert.closeTo( importedMesh.material.roughness, mesh.material.roughness, tolerance, 'Material roughness matches' );
					assert.closeTo( importedMesh.material.metalness, mesh.material.metalness, tolerance, 'Material metalness matches' );

				}

			} );

			QUnit.test( 'preserves RGB color data for fully-transparent pixels in exported PNG textures', async ( assert ) => {

				if ( ! isWebGL2Available() ) {

					assert.ok( true, 'SKIPPED: WebGL2 is not available in this environment.' );
					return;

				}

				// A 2x1 PNG, hand-encoded, with pixel 0 = opaque-looking red
				// color but alpha === 0, and pixel 1 = opaque green (control).
				// This is the exact shape of https://github.com/mrdoob/three.js/issues/30040:
				// a texture with real color data underneath a fully-transparent pixel.
				const testImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEElEQVR4nGP4zwAE/xn+AwAL/QL+6O7ISQAAAABJRU5ErkJggg==';

				const image = new Image();
				await new Promise( ( resolve, reject ) => {

					image.onload = resolve;
					image.onerror = reject;
					image.src = testImageDataUrl;

				} );

				const texture = new Texture( image );
				texture.needsUpdate = true;

				const scene = new Scene();
				const geometry = new PlaneGeometry( 1, 1 );
				const material = new MeshBasicMaterial( { map: texture, transparent: true } );
				const mesh = new Mesh( geometry, material );
				mesh.name = 'plane';
				scene.add( mesh );

				const exporter = new USDZExporter();
				const exportResult = await exporter.parseAsync( scene );

				const unzipped = unzipSync( exportResult );
				const textureFileName = Object.keys( unzipped ).find(
					( name ) => name.startsWith( 'textures/' ) && name.endsWith( '.png' )
				);

				assert.ok( textureFileName, 'Exported archive contains a PNG texture file' );

				const pngBytes = unzipped[ textureFileName ];
				const blob = new Blob( [ pngBytes ], { type: 'image/png' } );

				// Decode via the non-lossy path: createImageBitmap with
				// premultiplyAlpha disabled, then WebGL2 texImage2D/readPixels.
				// Do NOT decode via ctx.drawImage() here -- that operation
				// itself destroys RGB data at alpha === 0 (this is the exact
				// bug being tested for), so using it to verify the fix would
				// make this test pass or fail for the wrong reason regardless
				// of whether the exporter's own output is correct.
				const bitmap = await createImageBitmap( blob, { premultiplyAlpha: 'none' } );

				const gl = new OffscreenCanvas( 1, 1 ).getContext( 'webgl2' );
				const glTexture = gl.createTexture();
				gl.bindTexture( gl.TEXTURE_2D, glTexture );
				gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false );
				gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
				gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap );

				const framebuffer = gl.createFramebuffer();
				gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
				gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0 );

				const pixels = new Uint8Array( bitmap.width * bitmap.height * 4 );
				gl.readPixels( 0, 0, bitmap.width, bitmap.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels );

				// Find the transparent-red pixel among the decoded output
				// (don't assume a specific X position -- flipY/scale
				// handling in the exporter is allowed to reorder pixels
				// spatially as long as color data for each is preserved).
				let foundTransparentRedWithColor = false;
				let foundOpaqueGreen = false;

				for ( let i = 0; i < pixels.length; i += 4 ) {

					const [ r, g, b, a ] = pixels.slice( i, i + 4 );

					if ( a === 0 && r > 200 && g < 50 && b < 50 ) {

						foundTransparentRedWithColor = true;

					}

					if ( a === 255 && g > 200 && r < 50 && b < 50 ) {

						foundOpaqueGreen = true;

					}

				}

				assert.ok(
					foundTransparentRedWithColor,
					'A fully-transparent pixel in the exported PNG still has its original red color data (not zeroed)'
				);
				assert.ok(
					foundOpaqueGreen,
					'The opaque control pixel survived export correctly'
				);

				gl.getExtension( 'WEBGL_lose_context' )?.loseContext();

			} );

			QUnit.test( 'exporting many textures does not exhaust the host application\'s WebGL context', async ( assert ) => {

				if ( ! isWebGL2Available() ) {

					assert.ok( true, 'SKIPPED: WebGL2 is not available in this environment.' );
					return;

				}

				const sentinel = document.createElement( 'canvas' ).getContext( 'webgl2' );

				assert.ok( sentinel, 'Sentinel WebGL2 context created' );

				const scene = new Scene();
				const testImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEElEQVR4nGP4zwAE/xn+AwAL/QL+6O7ISQAAAABJRU5ErkJggg==';

				for ( let i = 0; i < 20; i ++ ) {

					const image = new Image();
					await new Promise( ( resolve, reject ) => {

						image.onload = resolve;
						image.onerror = reject;
						image.src = testImageDataUrl;

					} );

					const texture = new Texture( image );
					texture.needsUpdate = true;

					const geometry = new PlaneGeometry( 1, 1 );
					const material = new MeshBasicMaterial( { map: texture, transparent: true } );
					const mesh = new Mesh( geometry, material );
					mesh.name = `plane${i}`;
					mesh.position.x = i;
					scene.add( mesh );

				}

				const exporter = new USDZExporter();
				await exporter.parseAsync( scene );

				assert.notOk( sentinel.isContextLost(), 'Host application\'s WebGL context survives exporting many textures' );

				sentinel.getExtension( 'WEBGL_lose_context' )?.loseContext();

			} );

		} );

	} );

} );
