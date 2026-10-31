import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { gotoWithLegacyNetworkIdle, waitForLegacyNetworkIdle } from './legacy-readiness.js';

function page() {

	return Object.assign( new EventEmitter(), { isClosed: () => false } );

}

function navigation() {

	const client = new EventEmitter();
	client.send = async method => method === 'Page.getFrameTree' ? { frameTree: { frame: { id: 'main', loaderId: 'previous' } } } : {};
	const target = page();
	let started;
	const ready = new Promise( resolve => started = resolve );
	target.goto = async () => started();
	return { client, target, ready };

}

test( 'navigation waits for networkIdle from the new main-frame loader', async context => {

	context.mock.timers.enable( { apis: [ 'setTimeout' ] } );
	const { client, target, ready } = navigation();
	let complete = false;
	const waiting = gotoWithLegacyNetworkIdle( target, client, '/example' ).then( () => complete = true );
	await ready;
	for ( const event of [
		{ name: 'networkIdle', frameId: 'main', loaderId: 'previous' },
		{ name: 'networkIdle', frameId: 'child', loaderId: 'next' },
		{ name: 'networkAlmostIdle', frameId: 'main', loaderId: 'next' }
	] ) client.emit( 'Page.lifecycleEvent', event );
	await Promise.resolve();
	assert.equal( complete, false );
	assert.equal( client.listenerCount( 'Page.lifecycleEvent' ), 1 );
	client.emit( 'Page.lifecycleEvent', { name: 'networkIdle', frameId: 'main', loaderId: 'next' } );
	await waiting;
	assert.equal( complete, true );
	assert.equal( client.listenerCount( 'Page.lifecycleEvent' ), 0 );

} );

test( 'navigation timeout removes its lifecycle listener', async context => {

	context.mock.timers.enable( { apis: [ 'setTimeout' ] } );
	const { client, target, ready } = navigation();
	const waiting = gotoWithLegacyNetworkIdle( target, client, '/example' );
	const rejected = assert.rejects( waiting, /Navigation network idle timeout/ );
	await ready;
	context.mock.timers.tick( 300000 );
	await rejected;
	assert.equal( client.listenerCount( 'Page.lifecycleEvent' ), 0 );

} );

test( 'request activity restarts the full two-second idle window', async context => {

	context.mock.timers.enable( { apis: [ 'setTimeout' ] } );
	const target = page();
	const requests = new Set( [ 'first' ] );
	let complete = false;
	const waiting = waitForLegacyNetworkIdle( target, requests ).then( () => complete = true );
	context.mock.timers.tick( 4000 );
	await Promise.resolve();
	assert.equal( complete, false, 'Pending requests prevent idle completion' );
	requests.clear();
	target.emit( 'requestfinished' );
	context.mock.timers.tick( 1999 );
	await Promise.resolve();
	assert.equal( complete, false );
	requests.add( 'second' );
	target.emit( 'request' );
	context.mock.timers.tick( 4000 );
	await Promise.resolve();
	assert.equal( complete, false, 'A request cancels the previous idle window' );
	requests.clear();
	target.emit( 'requestfailed' );
	context.mock.timers.tick( 1999 );
	await Promise.resolve();
	assert.equal( complete, false );
	context.mock.timers.tick( 1 );
	await waiting;
	assert.equal( complete, true );
	assert.deepEqual( target.eventNames(), [] );

} );

test( 'network quiescence has a bounded timeout and cleans up listeners', async context => {

	context.mock.timers.enable( { apis: [ 'setTimeout' ] } );
	const target = page();
	const rejected = assert.rejects( waitForLegacyNetworkIdle( target, new Set( [ 'pending' ] ) ), /Network idle timeout/ );
	context.mock.timers.tick( 300000 );
	await rejected;
	assert.deepEqual( target.eventNames(), [] );

} );

for ( const event of [ 'close', 'crash' ] ) {

	test( `page ${ event } rejects the idle wait immediately and cleans up`, async context => {

		context.mock.timers.enable( { apis: [ 'setTimeout' ] } );
		const target = page();
		const rejected = assert.rejects( waitForLegacyNetworkIdle( target, new Set() ), /Page closed or crashed/ );
		context.mock.timers.tick( 1000 );
		target.emit( event );
		await rejected;
		assert.deepEqual( target.eventNames(), [] );
		context.mock.timers.tick( 300000 );

	} );

}

test( 'an already closed page rejects instead of waiting for idle', async context => {

	context.mock.timers.enable( { apis: [ 'setTimeout' ] } );
	const target = page();
	target.isClosed = () => true;
	await assert.rejects( waitForLegacyNetworkIdle( target, new Set() ), /Page closed or crashed/ );
	assert.deepEqual( target.eventNames(), [] );

} );
