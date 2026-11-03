import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { waitForLegacyNetworkIdle } from './legacy-readiness.js';

function page() {

	return Object.assign( new EventEmitter(), { isClosed: () => false } );

}

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
