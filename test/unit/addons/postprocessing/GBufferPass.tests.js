import { Color, Line, MeshNormalMaterial, PerspectiveCamera, Points, Scene } from 'three';
import { GBufferPass } from '../../../../examples/jsm/postprocessing/GBufferPass.js';

export default QUnit.module( 'Postprocessing', () => {

	QUnit.module( 'GBufferPass', () => {

		QUnit.test( 'stable shared attachments and ownership', assert => {

			const pass = new GBufferPass( new Scene(), new PerspectiveCamera(), 32, 24 );
			const depth = pass.depthTexture;
			const normal = pass.normalTexture;
			assert.notOk( pass.needsSwap, 'Composer color buffers are not swapped' );
			pass.setSize( 64, 48 );
			assert.strictEqual( pass.depthTexture, depth, 'Depth identity survives resizing' );
			assert.strictEqual( pass.normalTexture, normal, 'Normal identity survives resizing' );
			assert.deepEqual( [ normal.image.width, normal.image.height ], [ 64, 48 ], 'Normals resize to physical dimensions' );
			let disposed = 0;
			pass._renderTarget.addEventListener( 'dispose', () => disposed ++ );
			pass._normalMaterial.addEventListener( 'dispose', () => disposed ++ );
			pass.dispose();
			assert.strictEqual( disposed, 2, 'Owned render target and material are released' );

		} );

		QUnit.test( 'render and failure restore scene and renderer state', assert => {

			const scene = new Scene();
			const points = new Points();
			const line = new Line();
			const hidden = new Points();
			hidden.visible = false;
			scene.add( points, line, hidden );
			const override = new MeshNormalMaterial();
			scene.overrideMaterial = override;
			const pass = new GBufferPass( scene, new PerspectiveCamera() );
			const initialTarget = {};
			const renderer = {
				capabilities: {},
				autoClear: true,
				target: initialTarget,
				color: new Color( 0x123456 ),
				alpha: 0.25,
				getRenderTarget() {

					return this.target;

				},
				setRenderTarget( target ) {

					this.target = target;

				},
				getClearColor( color ) {

					return color.copy( this.color );

				},
				getClearAlpha() {

					return this.alpha;

				},
				setClearColor( color, alpha ) {

					this.color.set( color ); this.alpha = alpha;

				},
				clear() {},
				render() {

					assert.notOk( points.visible || line.visible || hidden.visible, 'Only meshes contribute' );
					assert.strictEqual( scene.overrideMaterial, pass._normalMaterial, 'Normal override is applied' );
					assert.strictEqual( this.target, pass._renderTarget, 'Shared target receives geometry' );

				}
			};
			for ( const fail of [ false, true ] ) {

				if ( fail ) renderer.render = () => {

					throw new Error( 'render failed' );

				};

				if ( fail ) assert.throws( () => pass.render( renderer ), /render failed/, 'Render failure is propagated' );
				else pass.render( renderer );
				assert.strictEqual( scene.overrideMaterial, override, 'Previous override is restored' );
				assert.ok( points.visible && line.visible && ! hidden.visible, 'Previous visibility is restored' );
				assert.strictEqual( renderer.target, initialTarget, 'Previous render target is restored' );
				assert.strictEqual( renderer.color.getHex(), 0x123456, 'Clear color is restored' );
				assert.strictEqual( renderer.alpha, 0.25, 'Clear alpha is restored' );
				assert.ok( renderer.autoClear, 'Auto-clear is restored' );

			}

			for ( const capabilities of [ { reversedDepthBuffer: true }, { logarithmicDepthBuffer: true } ] ) {

				renderer.capabilities = capabilities;
				assert.throws( () => pass.render( renderer ), /Conventional depth/, 'Unsupported depth is rejected' );

			}

			pass.dispose();
			override.dispose();
			for ( const object of [ points, line, hidden ] ) {

				object.geometry.dispose();
				object.material.dispose();

			}

		} );

	} );

} );
