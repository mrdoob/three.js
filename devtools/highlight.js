/* global HIGHLIGHT_NAME, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT */

// Highlights the object hovered in the panel with a yellow wireframe clone

( function () {

	let highlightObject = null;

	function cloneMaterial( material ) {

		// MeshNormalMaterial has no color to override
		if ( material.isMeshNormalMaterial ) return material;

		const cloned = new material.constructor();

		if ( material.isShaderMaterial ) {

			// Replace the shaders with a flat yellow output
			const raw = material.isRawShaderMaterial;

			cloned.vertexShader = `
				${ raw ? `attribute vec3 position;
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				` : '' }void main() {
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`;

			cloned.fragmentShader = `
				${ raw ? `precision highp float;
				` : '' }void main() {
					gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
				}
			`;

		} else {

			if ( cloned.color ) cloned.color.setRGB( 1, 1, 0 );
			if ( cloned.emissive ) cloned.emissive.setRGB( 1, 1, 0 );

		}

		// Yellow wireframe drawn on top of everything
		cloned.wireframe = true;
		cloned.depthTest = false;
		cloned.depthWrite = false;
		cloned.transparent = true;
		cloned.toneMapped = false;
		cloned.fog = false;

		return cloned;

	}

	function highlight( uuid ) {

		const object = __THREE_DEVTOOLS__.utils.findObjectInScenes( uuid );

		// Renderers, helpers, the highlight itself and objects without geometry can't be highlighted
		if ( ! object || object.type.includes( 'Helper' ) || object.name === HIGHLIGHT_NAME || ! object.geometry ) {

			unhighlight();
			return;

		}

		if ( highlightObject ) highlightObject.removeFromParent();

		// Clone the object to preserve all properties (skeleton, bindMatrix, etc)
		highlightObject = object.clone();
		highlightObject.name = HIGHLIGHT_NAME;
		highlightObject.castShadow = false;
		highlightObject.receiveShadow = false;
		highlightObject.renderOrder = Infinity;
		highlightObject.visible = true;

		if ( highlightObject.material ) {

			highlightObject.material = Array.isArray( highlightObject.material )
				? highlightObject.material.map( cloneMaterial )
				: cloneMaterial( highlightObject.material );

		}

		// Follow the original by sharing its matrixWorld
		highlightObject.matrixAutoUpdate = false;
		highlightObject.matrixWorldAutoUpdate = false;
		highlightObject.matrixWorld = object.matrixWorld;

		// Add at the scene root
		let scene = object;
		while ( scene.parent ) scene = scene.parent;

		scene.add( highlightObject );

	}

	function unhighlight() {

		if ( highlightObject ) {

			highlightObject.visible = false;

		}

	}

	// Listen for highlight events from bridge.js
	__THREE_DEVTOOLS__.addEventListener( MESSAGE_HIGHLIGHT_OBJECT, ( event ) => {

		highlight( event.detail.uuid );

	} );

	__THREE_DEVTOOLS__.addEventListener( MESSAGE_UNHIGHLIGHT_OBJECT, unhighlight );

} )();
