// Create the __THREE_DEVTOOLS__ object immediately
window.__THREE_DEVTOOLS__ = new EventTarget();

// Store references to observed objects
window.__THREE_DEVTOOLS__.objects = new Map();

// Track visibility state
window.__THREE_DEVTOOLS__.isVisible = true;

// Listen for visibility updates from devtools panel
window.__THREE_DEVTOOLS__.addEventListener( 'visibility', ( event ) => {

	window.__THREE_DEVTOOLS__.isVisible = event.detail;
	window.postMessage( {
		id: 'three-devtools',
		type: 'visibility',
		state: event.detail
	}, '*' );

} );

// Function to get renderer data
function getRendererData( renderer ) {

	return {
		uuid: renderer.uuid,
		type: 'WebGLRenderer',
		name: 'WebGLRenderer',
		isRenderer: true,
		properties: {
			width: renderer.domElement.width,
			height: renderer.domElement.height,
			drawCalls: renderer.info.render.calls,
			triangles: renderer.info.render.triangles
		}
	};

}

// Function to get object hierarchy
function getObjectData( obj ) {

	if ( obj.isWebGLRenderer === true ) {

		return getRendererData( obj );

	}

	return {
		uuid: obj.uuid,
		type: obj.type,
		name: obj.name || obj.type,
		isScene: obj.type === 'Scene',
		isRenderer: false,
		parent: obj.parent ? obj.parent.uuid : null,
		children: obj.children ? obj.children.map( child => child.uuid ) : []
	};

}

// Listen for Three.js registration
window.__THREE_DEVTOOLS__.addEventListener( 'register', ( event ) => {

	console.log( 'Three.js registered:', event.detail );
	window.postMessage( {
		type: 'FROM_THREE_INSPECTOR',
		subType: 'register',
		detail: event.detail
	}, '*' );

} );

// Listen for object observations
window.__THREE_DEVTOOLS__.addEventListener( 'observe', ( event ) => {

	const obj = event.detail;
	console.log( 'Three.js object observed:', obj.type );
	const data = getObjectData( obj );
	window.__THREE_DEVTOOLS__.objects.set( obj.uuid, data );

	window.postMessage( {
		type: 'FROM_THREE_INSPECTOR',
		subType: 'observe',
		detail: data
	}, '*' );

	// If this is a scene, also traverse its children
	if ( obj.type === 'Scene' ) {

		console.log( 'Traversing scene children' );
		obj.traverse( ( child ) => {

			if ( child !== obj ) {

				const childData = getObjectData( child );
				window.__THREE_DEVTOOLS__.objects.set( child.uuid, childData );
				window.postMessage( {
					type: 'FROM_THREE_INSPECTOR',
					subType: 'observe',
					detail: childData
				}, '*' );

			}

		} );

	}

} );
