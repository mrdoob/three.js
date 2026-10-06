import { BoxGeometry, DepthTexture, HalfFloatType, Mesh, MeshNormalMaterial, MeshBasicMaterial, NearestFilter, NoBlending, OrthographicCamera, PerspectiveCamera, Scene, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
import { SSAOPass } from '../../../../examples/jsm/postprocessing/SSAOPass.js';
import { SSRPass } from '../../../../examples/jsm/postprocessing/SSRPass.js';

export default QUnit.module( 'Postprocessing', () => {

	for ( const PassClass of [ SSAOPass, SSRPass ] ) {

		QUnit.module( PassClass.name, () => {

			const create = ( parameters = {} ) => {

				const scene = new Scene();
				const camera = new PerspectiveCamera();
				return PassClass === SSAOPass ?
					new SSAOPass( scene, camera, 32, 32, 32, parameters ) :
					new SSRPass( { scene, camera, width: 32, height: 32, ...parameters } );

			};

			QUnit.test( 'external construction and ownership', assert => {

				const depthTexture = new DepthTexture( 32, 32 );
				const normalTexture = new Texture( { width: 32, height: 32 } );
				let disposed = 0;
				depthTexture.addEventListener( 'dispose', () => disposed ++ );
				normalTexture.addEventListener( 'dispose', () => disposed ++ );
				const pass = create( { depthTexture, normalTexture } );
				assert.notOk( pass.normalRenderTarget, 'No owned geometry target is allocated' );
				assert.notOk( pass._renderGBuffer, 'Geometry rendering is disabled' );
				pass.setSize( 64, 48 );
				assert.deepEqual( [ depthTexture.image.width, depthTexture.image.height ], [ 32, 32 ], 'Caller depth size is preserved' );
				assert.deepEqual( normalTexture.image, { width: 32, height: 32 }, 'Caller normal size is preserved' );
				pass.dispose();
				assert.strictEqual( disposed, 0, 'Caller inputs are not disposed' );
				depthTexture.dispose();
				normalTexture.dispose();

			} );

			QUnit.test( 'switching releases geometry attachments and restores internal rendering', assert => {

				const pass = create();
				const owned = pass.normalRenderTarget;
				let disposed = 0;
				owned.addEventListener( 'dispose', () => disposed ++ );
				const depth = new DepthTexture( 32, 32 );
				const normal = new Texture( { width: 32, height: 32 } );
				pass.setGBuffer( depth, normal );
				assert.strictEqual( disposed, 1, 'Unused owned attachments are released' );
				assert.strictEqual( pass.normalRenderTarget, null, 'Owned target reference is cleared' );
				const effect = pass.ssaoMaterial || pass.ssrMaterial;
				assert.strictEqual( effect.uniforms.tDepth.value, depth, 'Effect uses external depth' );
				assert.strictEqual( effect.uniforms.tNormal.value, normal, 'Effect uses external normals' );
				assert.strictEqual( pass.depthRenderMaterial.uniforms.tDepth.value, depth, 'Debug output uses external depth' );
				pass.setSize( 64, 48 );
				pass.setGBuffer();
				const restored = pass.normalRenderTarget;
				assert.deepEqual( [ restored.width, restored.height ], [ 64, 48 ], 'Internal target uses current dimensions' );
				assert.ok( pass._renderGBuffer, 'Internal rendering is enabled' );
				assert.strictEqual( effect.uniforms.tNormal.value, restored.texture, 'Internal normals are rebound' );
				assert.strictEqual( effect.uniforms.tDepth.value, pass.beautyRenderTarget ? pass.beautyRenderTarget.depthTexture : restored.depthTexture, 'Internal depth is rebound' );
				pass.setGBuffer();
				assert.strictEqual( pass.normalRenderTarget, restored, 'Repeated reset reuses internal target' );
				pass.dispose();
				depth.dispose();
				normal.dispose();

			} );

			QUnit.test( 'browser image agreement, camera changes and skipped geometry renders', assert => {

				const canvas = document.createElement( 'canvas' );
				const context = canvas.getContext( 'webgl2' );
				if ( context === null ) {

					assert.ok( true, 'SKIPPED: WebGL2 is unavailable.' );
					return;

				}

				const renderer = new WebGLRenderer( { canvas, context } );
				const pass = create();
				const mesh = new Mesh( new BoxGeometry(), new MeshBasicMaterial( { color: 0x6688aa } ) );
				pass.scene.add( mesh );
				if ( PassClass === SSRPass ) {

					pass.selects = [ mesh ];
					pass.resolutionScale = 0.5;

				}

				pass.camera.position.set( 2, 2, 3 );
				pass.camera.lookAt( 0, 0, 0 );
				pass.camera.updateMatrixWorld();
				const depth = new DepthTexture( 32, 32, pass.depthTexture.type );
				depth.format = pass.depthTexture.format;
				const shared = new WebGLRenderTarget( 32, 32, { type: HalfFloatType, minFilter: NearestFilter, magFilter: NearestFilter, depthTexture: depth } );
				const material = new MeshNormalMaterial( { blending: NoBlending } );
				const target = new WebGLRenderTarget( 32, 32 );
				const render = renderer.render.bind( renderer );
				let geometryRenders = 0;
				renderer.render = ( scene, camera ) => {

					if ( scene === pass.scene ) geometryRenders ++;
					render( scene, camera );

				};

				for ( const orthographic of [ false, true ] ) {

					if ( orthographic ) {

						const camera = new OrthographicCamera( - 2, 2, 2, - 2, 0.1, 10 );
						camera.position.copy( pass.camera.position );
						camera.lookAt( 0, 0, 0 );
						camera.updateMatrixWorld();
						pass.camera = camera;
						pass.setSize( 16, 12 );
						shared.setSize( 16, 12 );
						target.setSize( 16, 12 );

					} else {

						pass.camera.near = 0.2;
						pass.camera.far = 20;
						pass.camera.fov = 60;
						pass.camera.updateProjectionMatrix();

					}

					for ( const mode of PassClass === SSAOPass ? [ 'Normal', 'Depth', 'SSAO', 'Blur' ] : [ 'Normal', 'Depth', 'SSR', 'Metalness', 'Default' ] ) {

						pass.output = PassClass.OUTPUT[ mode ];
						pass.setGBuffer();
						geometryRenders = 0;
						pass.render( renderer, target, target );
						assert.strictEqual( geometryRenders, PassClass === SSAOPass ? 1 : 3, 'Default geometry renders' );
						const internal = new Uint8Array( target.width * target.height * 4 );
						renderer.readRenderTargetPixels( target, 0, 0, target.width, target.height, internal );
						renderer.setClearColor( PassClass === SSAOPass ? 0x7777ff : 0, PassClass === SSAOPass ? 1 : 0 );
						renderer.setRenderTarget( shared );
						pass.scene.overrideMaterial = material;
						renderer.clear();
						renderer.render( pass.scene, pass.camera );
						pass.scene.overrideMaterial = null;
						pass.setGBuffer( shared.depthTexture, shared.texture );
						geometryRenders = 0;
						pass.render( renderer, target, target );
						assert.strictEqual( geometryRenders, PassClass === SSAOPass ? 0 : 2, 'External geometry render is removed; SSR beauty remains' );
						const external = new Uint8Array( internal.length );
						renderer.readRenderTargetPixels( target, 0, 0, target.width, target.height, external );
						let maxError = 0;
						for ( let i = 0; i < internal.length; i ++ ) maxError = Math.max( maxError, Math.abs( internal[ i ] - external[ i ] ) );
						assert.ok( maxError <= 1, mode + ' image agreement (max channel error ' + maxError + ')' );

					}

				}

				pass.dispose();
				shared.dispose();
				target.dispose();
				material.dispose();
				mesh.geometry.dispose();
				mesh.material.dispose();
				renderer.dispose();

			} );

			QUnit.test( 'invalid inputs fail before rendering or changing ownership', assert => {

				const pass = create();
				const owned = pass.normalRenderTarget;
				const depth = new DepthTexture( 32, 32 );
				const normal = new Texture( { width: 32, height: 32 } );
				assert.throws( () => pass.setGBuffer( depth ), /separate depth texture/, 'Depth-only inputs are rejected' );
				assert.throws( () => pass.setGBuffer( undefined, normal ), /separate depth texture/, 'Normal-only inputs are rejected' );
				assert.throws( () => pass.setGBuffer( normal, normal ), /separate depth texture/, 'Packed inputs are rejected' );
				assert.strictEqual( pass.normalRenderTarget, owned, 'Invalid setter does not dispose owned resources' );
				pass.setGBuffer( depth, normal );
				for ( const capabilities of [ { reversedDepthBuffer: true }, { logarithmicDepthBuffer: true } ] ) {

					assert.throws( () => pass.render( { capabilities } ), /conventional depth/, 'Unsupported depth mode is rejected before drawing' );

				}

				pass.setSize( 64, 48 );
				assert.throws( () => pass.render( { capabilities: {} } ), /dimensions/, 'Stale input size is rejected before drawing' );
				pass.dispose();
				depth.dispose();
				normal.dispose();

			} );

		} );

	}

} );
