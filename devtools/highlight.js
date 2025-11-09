/* global __THREE_DEVTOOLS__ */

// This script handles highlighting of Three.js objects in the 3D scene

( function () {

	'use strict';

	let highlightObject = null;

	function cloneMaterial( material ) {

		// Handle ShaderMaterial and RawShaderMaterial
		if ( material.isShaderMaterial || material.isRawShaderMaterial ) {

			// Clone the material to preserve uniforms and other properties
			const cloned = material.clone();

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

		// Clone the material
		const cloned = material.clone();

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

		// Disable vertex colors
		cloned.vertexColors = false;

		// Set to front side only (0 = FrontSide) if material supports it
		if ( 'side' in cloned ) {

			cloned.side = 0;

		}

		// Clear all texture maps
		if ( 'map' in cloned ) cloned.map = null;
		if ( 'lightMap' in cloned ) cloned.lightMap = null;
		if ( 'aoMap' in cloned ) cloned.aoMap = null;
		if ( 'emissiveMap' in cloned ) cloned.emissiveMap = null;
		if ( 'bumpMap' in cloned ) cloned.bumpMap = null;
		if ( 'normalMap' in cloned ) cloned.normalMap = null;
		if ( 'displacementMap' in cloned ) cloned.displacementMap = null;
		if ( 'roughnessMap' in cloned ) cloned.roughnessMap = null;
		if ( 'metalnessMap' in cloned ) cloned.metalnessMap = null;
		if ( 'alphaMap' in cloned ) cloned.alphaMap = null;
		if ( 'envMap' in cloned ) cloned.envMap = null;

		// Disable clipping
		if ( cloned.clippingPlanes ) {

			cloned.clippingPlanes = [];

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
