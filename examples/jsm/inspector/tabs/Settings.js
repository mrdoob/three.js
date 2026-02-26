import { Parameters } from './Parameters.js';
import { WebGPURenderer, WebGLBackend } from 'three/webgpu';

const _init = WebGPURenderer.prototype.init;

function forceWebGL( enable ) {

	if ( enable ) {

		WebGPURenderer.prototype.init = async function () {

			if ( this.backend.isWebGLBackend !== true ) {

				const parameters = this.backend.parameters;

				this.backend = new WebGLBackend( parameters );

			}

			return _init.call( this );

		};

	} else {

		WebGPURenderer.prototype.init = _init;

	}

}

function loadState() {

	let settings = {};

	try {

		const data = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );
		settings = data.settings || {};

	} catch ( e ) {

		console.error( 'Failed to load settings:', e );

	}

	const state = {
		forceWebGL: settings.forceWebGL || false
	};

	return state;

}

function saveState( state ) {

	try {

		const data = JSON.parse( localStorage.getItem( 'threejs-inspector' ) || '{}' );
		data.settings = state;

		localStorage.setItem( 'threejs-inspector', JSON.stringify( data ) );

	} catch ( e ) {

		console.error( 'Failed to save settings:', e );

	}

}

//

const state = loadState();

if ( state.forceWebGL ) {

	forceWebGL( true );

}

class Settings extends Parameters {

	constructor() {

		super( { name: 'Settings' } );

		// UI

		const rendererGroup = this.createGroup( 'Renderer' );

		rendererGroup.add( state, 'forceWebGL' ).name( 'Force WebGL' ).onChange( ( enable ) => {

			forceWebGL( enable );
			saveState( state );

			location.reload();

		} );

	}

}

export { Settings };
