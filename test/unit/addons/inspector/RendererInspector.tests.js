import { RendererInspector } from '../../../../examples/jsm/inspector/RendererInspector.js';

function createInspector() {

	const inspector = new RendererInspector();
	inspector.setRenderer( {
		_nodes: { nodeFrame: { frameId: 1 } },
		getRenderTarget: () => null
	} );

	inspector._beginTimer = () => {};

	inspector._endTimer = () => {};

	inspector.begin();

	return inspector;

}

function group( inspector, name, object ) {

	inspector.beginGroup( name, object );
	const stats = inspector.currentContext;
	inspector.finishGroup();
	return stats;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Inspector', () => {

		QUnit.module( 'RendererInspector', () => {

			QUnit.test( 'Group identity survives reordering and renaming', assert => {

				const inspector = createInspector();
				const first = {}, second = {};
				const a = group( inspector, 'Bloom', first );
				const b = group( inspector, 'Bloom', second );
				assert.notStrictEqual( a.cid, b.cid );
				inspector.finish();
				inspector.nodeFrame.frameId ++;
				inspector.begin();
				assert.strictEqual( group( inspector, 'Bloom', second ).cid, b.cid );
				const renamed = group( inspector, 'Renamed Bloom', first );
				assert.strictEqual( renamed.cid, a.cid );
				assert.strictEqual( renamed.name, 'Renamed Bloom' );
				inspector.finish();

			} );

			QUnit.test( 'Name-only groups and repeated scopes remain distinct', assert => {

				const inspector = createInspector();
				const object = {};
				const first = group( inspector, 'Bloom', object );
				assert.notStrictEqual( group( inspector, 'Bloom', object ).cid, first.cid );
				const named = group( inspector, 'Bloom' );
				assert.notStrictEqual( group( inspector, 'Bloom' ).cid, named.cid );
				assert.notStrictEqual( group( inspector, '0' ).cid, first.cid );
				inspector.finish();

			} );

			QUnit.test( 'Groups preserve nested execution ancestry and top-level overdraw', assert => {

				const inspector = createInspector();
				let overlays = 0;
				inspector.overdraw = true;
				inspector._renderOverdraw = () => overlays ++;
				inspector.beginGroup( 'Scene', {} );
				const outerGroup = inspector.currentContext;
				inspector.beginRender( 'outer:f1', { name: 'Scene' }, {}, null );
				const outer = inspector.currentRender;
				inspector.beginGroup( 'Shadow', {} );
				const shadowGroup = inspector.currentContext;
				inspector.beginCompute( 'compute:f1', { name: 'Compute' } );
				const compute = inspector.currentCompute;
				inspector.beginRender( 'nested:f1', { name: 'Nested' }, {}, {} );
				inspector.finishRender();
				assert.strictEqual( inspector.currentRender, outer );
				assert.strictEqual( inspector.currentContext, compute );
				assert.strictEqual( overlays, 0 );
				inspector.finishCompute();
				assert.strictEqual( inspector.currentContext, shadowGroup );
				inspector.finishGroup();
				inspector.finishRender();
				assert.strictEqual( inspector.currentContext, outerGroup );
				assert.strictEqual( overlays, 1, 'A group does not prevent top-level overdraw' );
				inspector.finishGroup();
				inspector.beginCompute( 'standalone:f1', { name: 'Compute' } );
				inspector.beginGroup( 'Inside compute' );
				inspector.beginRender( 'inside:f1', { name: 'Nested' }, {}, null );
				inspector.finishRender();
				assert.strictEqual( overlays, 1, 'A render nested in compute is not top-level' );
				inspector.finishGroup();
				inspector.finishCompute();
				inspector.finish();

			} );

			QUnit.test( 'Calls outside an active frame do not modify its recorded statistics', assert => {

				const inspector = createInspector();
				const frame = inspector.currentFrame;
				inspector.finish();
				inspector.beginGroup( 'Outside' );
				inspector.finishGroup();
				inspector.beginRender( 'outside:f1', { name: 'Outside' }, {}, null );
				inspector.finishRender();
				inspector.beginCompute( 'outside:f1', { name: 'Outside' } );
				inspector.finishCompute();
				assert.strictEqual( frame.children.length, 0 );
				assert.strictEqual( frame.renders.length, 0 );
				assert.strictEqual( frame.computes.length, 0 );

			} );

		} );

	} );

} );
