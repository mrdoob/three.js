import { DirectionalLight, RenderTarget, Scene, WebGPUCoordinateSystem } from 'three';
import { LightProbeGrid } from '../../../../../examples/jsm/lighting/LightProbeGrid.js';

function createRenderer() {

	return {
		isWebGPURenderer: true,
		initialized: true,
		coordinateSystem: WebGPUCoordinateSystem,
		library: { getLightNodeClass: () => null, addLight() {} },
		xr: { enabled: true },
		inspector: { enabled: true },
		autoClear: false,
		target: new RenderTarget(),
		face: 3,
		level: 2,
		getRenderTarget() {

			return this.target;

		},
		getActiveCubeFace() {

			return this.face;

		},
		getActiveMipmapLevel() {

			return this.level;

		},
		setRenderTarget( target, face = 0, level = 0 ) {

			this.target = target;
			this.face = face;
			this.level = level;

		},
		render() {}
	};

}

function assertState( assert, renderer, target, scene, grid, light ) {

	assert.strictEqual( renderer.target, target, 'Restores the render target.' );
	assert.strictEqual( renderer.face, 3, 'Restores the target face.' );
	assert.strictEqual( renderer.level, 2, 'Restores the mip level.' );
	assert.false( renderer.autoClear, 'Restores autoClear.' );
	assert.true( renderer.xr.enabled, 'Restores XR state.' );
	assert.true( renderer.inspector.enabled, 'Restores the inspector.' );
	assert.true( scene.matrixWorldAutoUpdate, 'Restores scene matrix updates.' );
	assert.false( grid.visible, 'Restores grid visibility.' );
	assert.strictEqual( grid._bakeIntensity, 1, 'Restores the grid contribution.' );
	assert.true( light.shadow.autoUpdate, 'Restores shadow updates.' );

}

QUnit.module( 'Addons', () => {

	QUnit.module( 'LightProbeGrid', () => {

		QUnit.test( 'Steps restore state and publish only complete passes', ( assert ) => {

			const renderer = createRenderer();
			const target = renderer.target;
			const scene = new Scene();
			const grid = new LightProbeGrid( 1, 1, 1, 2, 2, 2 );
			const light = new DirectionalLight();
			light.castShadow = true;
			grid.visible = false;
			scene.add( grid, light );

			let captures = 0, publishedSlices = 0;
			renderer.render = function ( object ) {

				if ( object === scene ) captures ++;
				if ( this.target === grid._renderTarget ) publishedSlices ++;

			};

			const steps = grid.bakeSteps( renderer, scene, { probesPerStep: 2, bounces: 1 } );

			for ( let i = 1; i <= 8; i ++ ) {

				const result = steps.next();
				assert.strictEqual( captures, i * 2 * 6, 'Captures only the requested number of cubemaps.' );
				assert.strictEqual( publishedSlices, Math.floor( i / 4 ) * 28, 'Publishes only complete passes, including padding.' );
				assert.strictEqual( result.done, i === 8, 'Completes the final step without an extra frame.' );
				assertState( assert, renderer, target, scene, grid, light );

			}

			grid.dispose();
			target.dispose();

		} );

		QUnit.test( 'Interleaved grids keep their captured rows and can be cancelled', ( assert ) => {

			const renderer = createRenderer();
			const scene = new Scene();
			const first = new LightProbeGrid( 1, 1, 1, 2, 2, 2 );
			const second = new LightProbeGrid( 1, 1, 1, 2, 2, 2 );
			const firstSteps = first.bakeSteps( renderer, scene, { probesPerStep: 1 } );
			const secondSteps = second.bakeSteps( renderer, scene, { probesPerStep: 1 } );
			let batchTarget;
			renderer.render = function () {

				if ( this.target.width === 9 ) batchTarget = this.target;

			};

			firstSteps.next();
			const firstTarget = batchTarget;
			secondSteps.next();
			assert.notStrictEqual( batchTarget, firstTarget, 'Another grid gets a separate batch target.' );
			firstSteps.next();
			assert.strictEqual( batchTarget, firstTarget, 'Resuming a grid preserves its captured rows.' );
			assert.throws( () => first.bakeSteps( renderer, scene ).next(), /active bake iterator/, 'Prevents concurrent bakes of the same grid.' );

			assert.true( firstSteps.return().done, 'Cancels the first bake.' );
			assert.true( secondSteps.return().done, 'Cancels the second bake.' );
			first.bake( renderer, scene );
			assert.true( first.visible, 'A synchronous bake can run after cancellation.' );

			first.dispose();
			second.dispose();
			renderer.target.dispose();

		} );

		QUnit.test( 'Failed captures restore state and release the bake', ( assert ) => {

			const renderer = createRenderer();
			const target = renderer.target;
			const scene = new Scene();
			const grid = new LightProbeGrid( 1, 1, 1, 2, 2, 2 );
			const light = new DirectionalLight();
			light.castShadow = true;
			grid.visible = false;
			scene.add( grid, light );
			renderer.render = () => {

				throw new Error( 'Capture failed' );

			};

			assert.throws( () => grid.bakeSteps( renderer, scene ).next(), /Capture failed/ );
			assertState( assert, renderer, target, scene, grid, light );

			renderer.render = () => {};

			grid.bake( renderer, scene );
			assert.true( grid.visible, 'Can bake again after a failed capture.' );

			grid.dispose();
			target.dispose();

		} );

	} );

} );
