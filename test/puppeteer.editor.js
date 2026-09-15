import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

// Serve the actual editor, including its original CDN dependencies. No application mocks.
const root = resolve( import.meta.dirname, '..' );
const server = createServer( async ( request, response ) => {

	try {

		let path = decodeURIComponent( new URL( request.url, 'http://localhost' ).pathname );
		if ( path.endsWith( '/' ) ) path += 'index.html';
		const file = resolve( root, '.' + path );
		if ( ! file.startsWith( root + '/' ) ) throw new Error( 'Invalid path' );
		const type = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[ extname( file ) ];
		response.setHeader( 'Content-Type', type || 'application/octet-stream' );
		response.end( await readFile( file ) );

	} catch {

		response.writeHead( 404 ).end();

	}

} );
await new Promise( done => server.listen( 0, '127.0.0.1', done ) );
const browser = await puppeteer.launch( { headless: true, args: [ '--no-sandbox', '--enable-unsafe-swiftshader' ] } );

try {

	const page = await browser.newPage();
	await page.setViewport( { width: 1400, height: 900 } );
	const errors = [];
	page.on( 'pageerror', error => errors.push( error.message ) );
	page.on( 'requestfailed', request => console.error( 'Request failed:', request.url(), request.failure().errorText ) );
	await page.goto( `http://127.0.0.1:${ server.address().port }/editor/`, { waitUntil: 'networkidle0' } );
	await page.waitForFunction( () => window.editor && document.querySelector( '#viewport canvas' ), { timeout: 60000 } );
	const results = await page.evaluate( async () => {

		const THREE = window.THREE;
		const editor = window.editor;
		const { SetInstanceMatrixCommand } = await import( '/editor/js/commands/SetInstanceMatrixCommand.js' );
		const { SetPositionCommand } = await import( '/editor/js/commands/SetPositionCommand.js' );
		const results = [];
		function check( condition, message ) {

			if ( ! condition ) throw new Error( message );
			results.push( message );

		}

		function matrix( mesh, id ) {

			const value = new THREE.Matrix4();
			mesh.getMatrixAt( id, value );
			return value;

		}

		function near( a, b, tolerance = 1e-5 ) {

			return a.elements.every( ( value, i ) => Math.abs( value - b.elements[ i ] ) < tolerance );

		}

		function inputs( label ) {

			const localized = editor.strings.getKey( 'sidebar/object/' + label.toLowerCase() );
			const element = Array.from( document.querySelectorAll( '#properties .Label' ) ).find( el => el.textContent === localized );
			if ( ! element ) throw new Error( 'Missing original label: ' + label );
			return element.parentElement.querySelectorAll( 'input' );

		}

		function input( label, axis, value ) {

			const field = inputs( label )[ axis ];
			field.value = String( value );
			field.dispatchEvent( new Event( 'change', { bubbles: true } ) );

		}

		function select( mesh, id ) {

			editor.signals.intersectionsDetected.dispatch( [ { object: mesh, instanceId: id } ], false );

		}

		editor.clear();
		editor.config.setKey( 'settings/history', false );

		const group = new THREE.Group();
		group.position.set( 1, - 2, 3 );
		group.rotation.set( 0.2, - 0.3, 0.1 );
		group.scale.setScalar( 1.4 );
		const batch = new THREE.InstancedMesh( new THREE.BoxGeometry(), new THREE.MeshStandardMaterial(), 8 );
		batch.name = 'Variable batch';
		batch.position.set( - 1, 2, 1 );
		batch.rotation.set( - 0.1, 0.4, 0.2 );
		batch.scale.setScalar( 1.2 );
		const local = new THREE.Object3D();
		for ( let id = 0; id < batch.count; id ++ ) {

			local.position.set( id * 3, 0, 0 );
			local.rotation.set( 0.1, 0.2, - 0.15 );
			local.scale.set( 1.1, 0.8, 1.3 );
			local.updateMatrix();
			batch.setMatrixAt( id, local.matrix );

		}

		group.add( batch );
		editor.addObject( group );
		const mesh = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshStandardMaterial() );
		editor.addObject( mesh );
		const baseline = Array.from( { length: batch.count }, ( _, id ) => matrix( batch, id ) );
		const ownerMatrix = batch.matrix.clone();
		const groupMatrix = group.matrix.clone();
		const selector = editor.selector;
		const controls = editor.sceneHelpers.children.find( object => object.isTransformControlsRoot ).controls;
		select( batch, 0 );
		check( editor.selected === batch && selector.instanceId === 0 && controls.object === selector.instanceProxy, 'Zero selects with instance controls' );
		select( batch, 7 );
		check( selector.instanceId === 7 && Number( inputs( 'Position' )[ 0 ].value ) === 21, 'Last instance switches and refreshes sidebar' );
		check( document.querySelector( '#properties' ).textContent.includes( 'Instance' ), 'Instance identification is visible' );
		batch.updateWorldMatrix( true, false );
		check( near( selector.instanceProxy.matrixWorld, new THREE.Matrix4().multiplyMatrices( batch.matrixWorld, baseline[ 7 ] ) ), 'Proxy world matrix equals owner world times local instance' );

		editor.history.clear();
		select( batch, 0 );
		input( 'Position', 0, 2.125 );
		const editedZero = matrix( batch, 0 );
		select( batch, 7 );
		input( 'Position', 1, 3.75 );
		check( editor.history.undos.length === 2, 'Rapid different-instance inputs do not merge' );
		editor.undo();
		check( near( matrix( batch, 7 ), baseline[ 7 ] ) && near( matrix( batch, 0 ), editedZero ), 'Undo only restores last instance' );
		check( Number( inputs( 'Position' )[ 1 ].value ) === 0, 'Undo refreshes selected instance panel' );
		editor.undo();
		check( near( matrix( batch, 0 ), baseline[ 0 ] ), 'Second undo restores first instance' );
		editor.redo();
		editor.redo();
		check( Number( inputs( 'Position' )[ 1 ].value ) === 3.75, 'Redo refreshes selected instance panel' );
		input( 'Rotation', 0, 32 );
		input( 'Scale', 2, 1.7 );
		check( Math.abs( selector.instanceProxy.rotation.x - THREE.MathUtils.degToRad( 32 ) ) < 1e-5 && Math.abs( selector.instanceProxy.scale.z - 1.7 ) < 1e-5, 'Panel uses local XYZ degrees and nonuniform positive scale' );

		// Exercise the real control ray/plane math, not just the Viewport event handlers.
		for ( const space of [ 'world', 'local' ] ) {

			for ( const mode of [ 'translate', 'rotate', 'scale' ] ) {

				controls.setSpace( space );
				controls.setMode( mode );
				controls.axis = 'X';
				const proxy = selector.instanceProxy;
				const origin = proxy.getWorldPosition( new THREE.Vector3() );
				const quaternion = proxy.getWorldQuaternion( new THREE.Quaternion() );
				const scale = proxy.scale.clone();
				const cameraOffset = new THREE.Vector3( 8, 6, 10 );
				editor.camera.position.copy( origin ).add( cameraOffset );
				editor.camera.lookAt( origin );
				editor.camera.updateMatrixWorld( true );
				controls.getHelper().updateMatrixWorld( true );
				const axis = new THREE.Vector3( 1, 0, 0 );
				if ( space === 'local' || mode === 'scale' ) axis.applyQuaternion( quaternion );
				const start = origin.clone();
				const end = origin.clone();
				if ( mode === 'scale' ) start.add( axis );
				if ( mode === 'rotate' ) {

					end.addScaledVector( axis.clone().cross( cameraOffset.clone().normalize() ).normalize(), 0.4 );

				} else {

					end.addScaledVector( axis, mode === 'scale' ? 1.7 : 0.7 );

				}

				const down = start.project( editor.camera );
				const move = end.project( editor.camera );
				controls.pointerDown( { x: down.x, y: down.y, button: 0 } );
				controls.pointerMove( { x: move.x, y: move.y, button: - 1 } );
				controls.pointerUp( { button: 0 } );
				if ( mode === 'translate' ) {

					check( proxy.getWorldPosition( new THREE.Vector3() ).distanceTo( origin.addScaledVector( axis, 0.7 ) ) < 1e-4, `${ space } pointer translation follows requested world axis` );

				} else if ( mode === 'rotate' ) {

					const expected = new THREE.Quaternion().setFromAxisAngle( axis, 0.4 * 20 / cameraOffset.length() ).multiply( quaternion );
					check( proxy.getWorldQuaternion( new THREE.Quaternion() ).angleTo( expected ) < 1e-3, `${ space } pointer rotation follows requested axis` );

				} else {

					check( proxy.scale.distanceTo( scale.multiply( new THREE.Vector3( 1.7, 1, 1 ) ) ) < 1e-4, `${ space } pointer scaling follows instance local X` );

				}

			}

		}

		for ( const space of [ 'world', 'local' ] ) {

			for ( const mode of [ 'translate', 'rotate', 'scale' ] ) {

				editor.signals.spaceChanged.dispatch( space );
				editor.signals.transformModeChanged.dispatch( mode );
				const before = matrix( batch, 7 );
				const historyLength = editor.history.undos.length;
				controls.dispatchEvent( { type: 'mouseDown' } );
				const proxy = selector.instanceProxy;
				if ( mode === 'translate' ) proxy.position.y += 1.25;
				if ( mode === 'rotate' ) proxy.rotateY( 0.3 );
				if ( mode === 'scale' ) proxy.scale.x *= 1.3;
				controls.dispatchEvent( { type: 'objectChange' } );
				const after = matrix( batch, 7 );
				check( ! near( before, after ), `${ space } ${ mode }: live instance update` );
				controls.dispatchEvent( { type: 'mouseUp' } );
				check( editor.history.undos.length === historyLength + 1, `${ space } ${ mode }: one drag history action` );
				editor.undo();
				check( near( matrix( batch, 7 ), before ), `${ space } ${ mode }: undo` );
				editor.redo();
				check( near( matrix( batch, 7 ), after ), `${ space } ${ mode }: redo` );

			}

		}

		const historyLength = editor.history.undos.length;
		controls.dispatchEvent( { type: 'mouseDown' } );
		controls.dispatchEvent( { type: 'mouseUp' } );
		check( editor.history.undos.length === historyLength, 'Unchanged control click adds no history' );

		input( 'Position', 0, 150 );
		const world = selector.instanceProxy.getWorldPosition( new THREE.Vector3() );
		const raycaster = new THREE.Raycaster( world.clone().add( new THREE.Vector3( 0, 0, 20 ) ), new THREE.Vector3( 0, 0, - 1 ) );
		const hits = selector.getIntersects( raycaster );
		check( hits[ 0 ]?.object === batch && hits[ 0 ].instanceId === 7, 'Moved instance is pickable outside original batch bounds; helpers do not intercept' );
		editor.signals.intersectionsDetected.dispatch( hits, false );
		check( selector.instanceId === 7, 'Raycast selection retains moved target' );
		check( baseline.slice( 1, 7 ).every( ( value, i ) => near( value, matrix( batch, i + 1 ) ) ) && near( batch.matrix, ownerMatrix ) && near( group.matrix, groupMatrix ), 'Other instances, batch and parent transforms are untouched' );
		editor.signals.intersectionsDetected.dispatch( [], false );
		check( selector.instanceId === null && editor.selected === null && controls.object === undefined, 'Empty selection clears instance and controls' );
		select( batch, 0 );
		editor.select( batch );
		check( selector.instanceId === null && controls.object === batch, 'Scene-tree object selection exits instance editing' );
		input( 'Position', 0, - 4 );
		check( batch.position.x === - 4 && near( matrix( batch, 0 ), editedZero ), 'Batch property edit leaves instance matrix intact' );
		editor.undo();

		select( batch, 7 );
		editor.select( mesh );
		check( selector.instanceId === null && controls.object === mesh, 'Ordinary Mesh selection clears instance target' );
		input( 'Position', 0, 4 );
		check( mesh.position.x === 4, 'Ordinary Mesh panel still edits object' );
		editor.undo();
		check( mesh.position.x === 0, 'Ordinary Mesh undo works' );
		editor.redo();
		controls.dispatchEvent( { type: 'mouseDown' } );
		mesh.position.z = 3;
		controls.dispatchEvent( { type: 'objectChange' } );
		controls.dispatchEvent( { type: 'mouseUp' } );
		check( mesh.position.z === 3, 'Ordinary Mesh controls still edit object' );
		editor.undo();
		check( mesh.position.z === 0, 'Ordinary Mesh control undo works' );
		selector.setSelection( [ mesh, group ] );
		check( selector.selection.length === 2 && controls.object === selector.group, 'Existing object multiselection remains available' );
		editor.select( mesh );
		editor.signals.intersectionsDetected.dispatch( [ { object: batch, instanceId: 0 } ], true );
		check( selector.selection.includes( batch ) && selector.selection.includes( mesh ) && selector.instanceId === null, 'Shift-click adds the batch to whole-object selection' );

		select( batch, 7 );
		const savedMatrices = Array.from( { length: batch.count }, ( _, id ) => matrix( batch, id ) );
		const json = JSON.parse( JSON.stringify( editor.toJSON() ) );
		check( ! JSON.stringify( json.scene ).includes( selector.instanceProxy.uuid ) && ! JSON.stringify( json.scene ).includes( selector.instanceParent.uuid ), 'Project excludes instance helper objects' );
		editor.clear();
		await editor.fromJSON( json );
		const loaded = editor.objectByUuid( batch.uuid );
		check( loaded.isInstancedMesh && loaded.count === 8 && savedMatrices.every( ( value, id ) => near( value, matrix( loaded, id ) ) ), 'Editor project JSON reload preserves batch type, count and every matrix' );
		select( loaded, 7 );
		input( 'Position', 2, 6 );
		check( Math.abs( matrix( loaded, 7 ).elements[ 14 ] - 6 ) < 1e-5, 'Reloaded instance can be selected and edited' );
		editor.undo();
		check( near( matrix( loaded, 7 ), savedMatrices[ 7 ] ), 'Reloaded instance edit can be undone' );
		// Verify command JSON independently of the optional persisted undo stack.
		const command = new SetInstanceMatrixCommand( editor, loaded, 0, new THREE.Matrix4().makeTranslation( 8, 9, 10 ) );
		const restored = new SetInstanceMatrixCommand( editor );
		restored.fromJSON( command.toJSON() );
		restored.execute();
		restored.undo();
		check( near( matrix( loaded, 0 ), savedMatrices[ 0 ] ), 'Instance command JSON round trip resolves its exact target' );
		editor.execute( new SetPositionCommand( editor, loaded.parent, new THREE.Vector3( 4, 5, 6 ) ) );
		check( near( selector.instanceProxy.matrixWorld, new THREE.Matrix4().multiplyMatrices( loaded.matrixWorld, matrix( loaded, 7 ) ) ), 'Ancestor object changes resynchronize instance proxy' );
		return results;

	} );
	// Flush the synthetic drag's click suppression before testing real DOM mouse input.
	await page.mouse.click( 100, 100 );
	const points = await page.evaluate( () => {

		const { editor, THREE } = window;
		editor.clear();
		const batch = new THREE.InstancedMesh( new THREE.BoxGeometry(), new THREE.MeshNormalMaterial(), 3 );
		batch.name = 'Mouse test batch';
		for ( let id = 0; id < 3; id ++ ) batch.setMatrixAt( id, new THREE.Matrix4().makeTranslation( ( id - 1 ) * 3, 0, 0 ) );
		editor.addObject( batch );
		editor.camera.position.set( 0, 0, 14 );
		editor.camera.lookAt( 0, 0, 0 );
		editor.camera.updateMatrixWorld( true );
		editor.signals.transformModeChanged.dispatch( 'translate' );
		editor.signals.spaceChanged.dispatch( 'world' );
		editor.signals.cameraChanged.dispatch();
		const rect = document.querySelector( '#viewport canvas' ).getBoundingClientRect();
		return [ - 3, 3 ].map( x => {

			const p = new THREE.Vector3( x, 0, 0 ).project( editor.camera );
			return { x: rect.x + ( p.x + 1 ) * rect.width / 2, y: rect.y + ( 1 - p.y ) * rect.height / 2 };

		} );

	} );
	await page.mouse.click( points[ 0 ].x, points[ 0 ].y );
	assert.equal( await page.evaluate( () => window.editor.selector.instanceId ), 0 );
	results.push( 'Real viewport mouse click selects instance zero' );
	await page.mouse.click( points[ 1 ].x, points[ 1 ].y );
	assert.equal( await page.evaluate( () => window.editor.selector.instanceId ), 2 );
	results.push( 'Real viewport mouse click switches to last instance' );
	let handle;
	for ( let offset = 15; offset < 100; offset += 5 ) {

		await page.mouse.move( points[ 1 ].x + offset, points[ 1 ].y );
		if ( await page.evaluate( () => window.editor.sceneHelpers.children.find( object => object.isTransformControlsRoot ).controls.axis === 'X' ) ) {

			handle = { x: points[ 1 ].x + offset, y: points[ 1 ].y };
			break;

		}

	}

	assert.ok( handle, 'Real mouse locates X gizmo' );
	await page.mouse.click( handle.x, handle.y );
	assert.deepEqual( await page.evaluate( () => [ window.editor.selector.instanceId, window.editor.history.undos.length ] ), [ 2, 0 ] );
	results.push( 'Real unchanged gizmo click retains selection and adds no undo action' );
	await page.mouse.move( handle.x, handle.y );
	await page.mouse.down();
	await page.mouse.move( handle.x + 60, handle.y, { steps: 6 } );
	await page.mouse.up();
	assert.deepEqual( await page.evaluate( () => [ window.editor.selector.instanceId, window.editor.history.undos.length, window.editor.selector.instanceProxy.position.x > 3 ] ), [ 2, 1, true ] );
	results.push( 'Real multi-event gizmo drag changes only the instance in one history action' );
	await page.evaluate( () => {

		const option = Array.from( document.querySelectorAll( '#outliner .option' ) ).find( element => element.textContent.includes( 'Mouse test batch' ) );
		if ( ! option ) throw new Error( 'Missing scene-tree batch row' );
		option.click();

	} );
	assert.equal( await page.evaluate( () => window.editor.selector.instanceId ), null );
	results.push( 'Scene-tree DOM click on the selected batch exits instance editing' );
	await page.mouse.click( 100, 100 );
	assert.equal( await page.evaluate( () => window.editor.selected ), null );
	results.push( 'Real blank viewport click clears selection' );
	assert.deepEqual( errors, [], 'Editor has no uncaught browser errors' );
	for ( const result of results ) console.log( 'PASS:', result );
	console.log( `${ results.length } browser checks passed.` );

} finally {

	await browser.close();
	await new Promise( done => server.close( done ) );

}
