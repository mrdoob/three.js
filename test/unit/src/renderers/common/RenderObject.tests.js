import RenderObject from '../../../../../src/renderers/common/RenderObject.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'RenderObject', () => {

			QUnit.test( 'getMaterialCacheKey: includes alpha-to-coverage sample mode', ( assert ) => {

				const renderObject = Object.create( RenderObject.prototype );

				renderObject._nodes = { getCustomProgramCacheKey: () => '' };
				renderObject.object = { receiveShadow: false };
				renderObject.material = { alphaToCoverage: true };
				renderObject.renderer = { currentSamples: 0 };
				renderObject.scene = null;
				renderObject.clippingContextCacheKey = '';
				renderObject.context = { stateKey: 'same' };

				const noSamplesKey = renderObject.getMaterialCacheKey();

				renderObject.renderer.currentSamples = 1;

				const singleSampleKey = renderObject.getMaterialCacheKey();

				renderObject.renderer.currentSamples = 4;

				const msaaKey = renderObject.getMaterialCacheKey();

				renderObject.renderer.currentSamples = 2;

				const twoSampleKey = renderObject.getMaterialCacheKey();

				assert.notStrictEqual( noSamplesKey, singleSampleKey, 'alpha-to-coverage distinguishes no samples from single-sample rendering' );
				assert.notStrictEqual( singleSampleKey, msaaKey, 'alpha-to-coverage distinguishes single-sample rendering from MSAA' );
				assert.strictEqual( msaaKey, twoSampleKey, 'sample counts with the same node-build mode share a cache key' );

				renderObject.material.alphaToCoverage = false;
				renderObject.renderer.currentSamples = 0;

				const noAlphaToCoverageKey = renderObject.getMaterialCacheKey();

				renderObject.renderer.currentSamples = 4;

				const noAlphaToCoverageMsaaKey = renderObject.getMaterialCacheKey();

				assert.strictEqual( noAlphaToCoverageKey, noAlphaToCoverageMsaaKey, 'materials without alpha-to-coverage keep sharing node builds across sample counts' );

			} );

		} );

	} );

} );
