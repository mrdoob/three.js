/* global __THREE_DEVTOOLS__ */

// This script handles highlighting of Three.js objects in the 3D scene

( function () {

	'use strict';

	let highlightObject = null;

	function cloneMaterial( material ) {

		// Skip MeshNormalMaterial
		if ( material.isMeshNormalMaterial ) {

			return material;

		}

		// Handle ShaderMaterial and RawShaderMaterial
		if ( material.isShaderMaterial || material.isRawShaderMaterial ) {

			// Create new material of the same type
			const cloned = new material.constructor();

			// Override shaders with simple yellow output
			const vertexShader = `
				${ material.isRawShaderMaterial ? `attribute vec3 position;
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				` : '' }void main() {
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`;

			const fragmentShader = `
				${ material.isRawShaderMaterial ? `precision highp float;
				` : '' }void main() {
					gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
				}
			`;

			cloned.vertexShader = vertexShader;
			cloned.fragmentShader = fragmentShader;

			// Override with yellow wireframe settings
			cloned.wireframe = true;
			cloned.depthTest = false;
			cloned.depthWrite = false;
			cloned.transparent = true;
			cloned.opacity = 1;
			cloned.toneMapped = false;
			cloned.fog = false;

			return cloned;

		}

		// Create new material of the same type
		const cloned = new material.constructor();

		// Set yellow color
		if ( cloned.color ) {

			cloned.color.r = 1;
			cloned.color.g = 1;
			cloned.color.b = 0;

		}

		// If material has emissive, set it to yellow
		if ( 'emissive' in cloned ) {

			cloned.emissive.r = 1;
			cloned.emissive.g = 1;
			cloned.emissive.b = 0;

		}

		// Enable wireframe if the material supports it
		if ( 'wireframe' in cloned ) {

			cloned.wireframe = true;

		}

		// Render on top, ignoring depth
		cloned.depthTest = false;
		cloned.depthWrite = false;
		cloned.transparent = true;
		cloned.opacity = 1;

		// Disable tone mapping and fog
		cloned.toneMapped = false;
		cloned.fog = false;

		return cloned;

	}

	function highlight( uuid ) {

		const object = __THREE_DEVTOOLS__.utils.findObjectInScenes( uuid );
		if ( ! object ) {

			// Object not in scene (e.g., renderer) - hide highlight
			if ( highlightObject ) highlightObject.visible = false;
			return;

		}

		// Skip helpers, existing highlights, and objects without geometry
		if ( object.type.includes( 'Helper' ) || object.name === '__THREE_DEVTOOLS_HIGHLIGHT__' || ! object.geometry ) {

			if ( highlightObject ) highlightObject.visible = false;
			return;

		}

		// Remove old highlight if it exists
		if ( highlightObject && highlightObject.parent ) {

			highlightObject.parent.remove( highlightObject );

		}

		// Clone the object to preserve all properties (skeleton, bindMatrix, etc)
		highlightObject = object.clone();
		highlightObject.name = '__THREE_DEVTOOLS_HIGHLIGHT__';

		// Apply yellow wireframe material
		if ( highlightObject.material ) {

			if ( Array.isArray( highlightObject.material ) ) {

				highlightObject.material = highlightObject.material.map( cloneMaterial );

			} else {

				highlightObject.material = cloneMaterial( highlightObject.material );

			}

		}

		// Disable shadows
		highlightObject.castShadow = false;
		highlightObject.receiveShadow = false;

		// Render on top of everything
		highlightObject.renderOrder = Infinity;

		// Disable auto update before adding to scene
		highlightObject.matrixAutoUpdate = false;
		highlightObject.matrixWorldAutoUpdate = false;

		// Find the scene and add at root
		let scene = object;
		while ( scene.parent ) scene = scene.parent;

		scene.add( highlightObject );

		// Reuse the matrixWorld from original object (after adding to scene)
		highlightObject.matrixWorld = object.matrixWorld;

		// Make sure it's visible
		highlightObject.visible = true;

	}

	function unhighlight() {

		if ( highlightObject ) {

			highlightObject.visible = false;

		}

	}

	// Listen for highlight events from bridge.js
	__THREE_DEVTOOLS__.addEventListener( 'highlight-object', ( event ) => {

		highlight( event.detail.uuid );

	} );

	__THREE_DEVTOOLS__.addEventListener( 'unhighlight-object', () => {

		unhighlight();

	} );

} )();
