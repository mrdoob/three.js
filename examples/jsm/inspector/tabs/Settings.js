import { Parameters } from './Parameters.js';
import { WebGPURenderer, WebGLBackend, Node } from 'three/webgpu';
import { getItem, setItem } from '../Inspector.js';

const _EXTENSIONS_PATH = '../extensions/extensions.json';

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

let _state = null;

function _loadState() {

	if ( _state !== null ) return _state;

	const settings = getItem( 'settings' );

	_state = {
		forceWebGL: settings.forceWebGL !== undefined ? settings.forceWebGL : false,
		captureStackTrace: settings.captureStackTrace !== undefined ? settings.captureStackTrace : false,
		activeExtensions: settings.activeExtensions !== undefined ? settings.activeExtensions : {}
	};

	if ( _state.forceWebGL ) {

		forceWebGL( true );

	}

	if ( _state.captureStackTrace ) {

		Node.captureStackTrace = true;

	}

	return _state;

}

function _saveState() {

	setItem( 'settings', {
		forceWebGL: _state.forceWebGL,
		captureStackTrace: _state.captureStackTrace,
		activeExtensions: _state.activeExtensions
	} );

}

_loadState();

//

class Settings extends Parameters {

	constructor() {

		super( { name: 'Settings' } );

		this.extensions = {};

		const currentState = _loadState();

		// UI

		const rendererGroup = this.createGroup( 'Renderer' );

		rendererGroup.add( currentState, 'forceWebGL' ).name( 'Force WebGL' ).onChange( ( enable ) => {

			forceWebGL( enable );
			_saveState();

			location.reload();

		} );

		rendererGroup.add( currentState, 'captureStackTrace' ).name( 'Capture Stack Trace' ).onChange( ( enable ) => {

			Node.captureStackTrace = enable;
			_saveState();

			location.reload();

		} );

	}

	init() {

		const extensionsGroup = this.createGroup( 'Extensions' );

		this._getExtensions().then( extensions => {

			for ( const extension of extensions ) {

				extension.active = false;
				extension.loaded = false;
				extension.tab = null;

				this.extensions[ extension.name ] = extension;

				extension.ui = extensionsGroup.add( { [ extension.name ]: false }, extension.name ).onChange( async ( value ) => {

					this.setActiveExtension( extension.name, value );

					// User preference

					if ( value ) {

						_state.activeExtensions[ extension.name ] = {
							name: extension.name,
							url: extension.url
						};

					} else {

						delete _state.activeExtensions[ extension.name ];


					}

					//

					this._updateExtensionUI( extension );

					_saveState();

				} );

				// Set user-defined state

				if ( _state.activeExtensions[ extension.name ] !== undefined ) {

					extension.ui.setValue( true );

				}

			}

		} );

	}

	async setActiveExtension( name, value ) {

		const extension = this.extensions[ name ];
		const inspector = this.inspector;

		if ( extension ) {

			if ( value ) {

				await this._loadExtension( inspector, extension );

			} else {

				await this._unloadExtension( inspector, extension );

			}

		}

	}

	_updateExtensionUI( extension ) {

		const forceActive = extension.active && _state.activeExtensions[ extension.name ] === undefined;

		if ( forceActive ) {

			extension.ui.checkbox.checked = true;
			extension.ui.domElement.style.setProperty( '--accent-color', 'var(--color-green)' );

		} else {

			extension.ui.domElement.style.removeProperty( '--accent-color' );

		}

	}

	async _unloadExtension( inspector, extension ) {

		if ( extension.active === false ) return;

		//

		inspector.removeTab( extension.tab );

		extension.active = false;
		extension.loaded = false;
		extension.tab = null;

		this._updateExtensionUI( extension );

		this.dispatchEvent( { type: 'extensionremoved', name: extension.name } );

	}

	async _loadExtension( inspector, extension ) {

		if ( extension.active === true ) return;

		//

		extension.active = true;

		const extUrl = new URL( extension.url, new URL( _EXTENSIONS_PATH, import.meta.url ) ).href;

		const module = await import( extUrl );

		const keys = Object.keys( module );
		const ExtensionClass = module[ keys[ 0 ] ];
		const extensionTab = new ExtensionClass();

		inspector.addTab( extensionTab );

		extension.loaded = true;
		extension.tab = extensionTab;

		this._updateExtensionUI( extension );

		this.dispatchEvent( { type: 'extensionadded', name: extension.name, tab: extensionTab } );

	}

	async _getExtensions() {

		const url = new URL( _EXTENSIONS_PATH, import.meta.url );

		const extensions = await fetch( url ).then( res => res.json() );

		return extensions;

	}

}

export { Settings };
