import { Color, Vector2, Vector3, Vector4 } from 'three';

/**
 * UniformPresetManager - Manages saving and loading of uniform presets
 * 
 * Allows users to save, load, export, and import uniform configurations.
 * Presets are stored in localStorage for persistence.
 */
class UniformPresetManager {

	constructor( storageKey = 'shader_uniform_presets' ) {

		this.storageKey = storageKey;
		this.presets = new Map();

		this._loadFromStorage();

	}

	/**
	 * Loads presets from localStorage.
	 * @private
	 */
	_loadFromStorage() {

		try {

			const saved = localStorage.getItem( this.storageKey );

			if ( saved ) {

				const data = JSON.parse( saved );

				for ( const name in data ) {

					this.presets.set( name, data[ name ] );

				}

			}

		} catch ( e ) {

			console.warn( 'Failed to load uniform presets:', e );

		}

	}

	/**
	 * Saves presets to localStorage.
	 * @private
	 */
	_saveToStorage() {

		try {

			const data = {};

			this.presets.forEach( ( preset, name ) => {

				data[ name ] = preset;

			} );

			localStorage.setItem( this.storageKey, JSON.stringify( data ) );

		} catch ( e ) {

			console.warn( 'Failed to save uniform presets:', e );

		}

	}

	/**
	 * Serializes a uniform value for storage.
	 * @private
	 */
	_serializeValue( value ) {

		if ( value === null || value === undefined ) {

			return { type: 'null', value: null };

		}

		if ( typeof value === 'number' ) {

			return { type: 'float', value: value };

		}

		if ( typeof value === 'boolean' ) {

			return { type: 'bool', value: value };

		}

		if ( value.isColor ) {

			return { type: 'color', value: value.getHex() };

		}

		if ( value.isVector2 ) {

			return { type: 'vec2', value: value.toArray() };

		}

		if ( value.isVector3 ) {

			return { type: 'vec3', value: value.toArray() };

		}

		if ( value.isVector4 ) {

			return { type: 'vec4', value: value.toArray() };

		}

		if ( value.isMatrix3 ) {

			return { type: 'mat3', value: value.toArray() };

		}

		if ( value.isMatrix4 ) {

			return { type: 'mat4', value: value.toArray() };

		}

		// Unsupported type
		return { type: 'unknown', value: null };

	}

	/**
	 * Deserializes a stored value back to its original type.
	 * @private
	 */
	_deserializeValue( serialized ) {

		if ( ! serialized || serialized.type === 'null' || serialized.type === 'unknown' ) {

			return null;

		}

		switch ( serialized.type ) {

			case 'float':
			case 'bool':
				return serialized.value;

			case 'color':
				return new Color( serialized.value );

			case 'vec2':
				return new Vector2().fromArray( serialized.value );

			case 'vec3':
				return new Vector3().fromArray( serialized.value );

			case 'vec4':
				return new Vector4().fromArray( serialized.value );

			default:
				return null;

		}

	}

	/**
	 * Saves current uniforms as a preset.
	 * @param {string} name - Preset name
	 * @param {Object} uniforms - Uniforms object from material
	 */
	savePreset( name, uniforms ) {

		const preset = {};

		for ( const key in uniforms ) {

			const uniform = uniforms[ key ];
			preset[ key ] = this._serializeValue( uniform.value );

		}

		this.presets.set( name, preset );
		this._saveToStorage();

	}

	/**
	 * Loads a preset into a material's uniforms.
	 * @param {string} name - Preset name
	 * @param {Object} uniforms - Uniforms object to update
	 * @returns {boolean} Success status
	 */
	loadPreset( name, uniforms ) {

		const preset = this.presets.get( name );

		if ( ! preset ) {

			return false;

		}

		for ( const key in preset ) {

			if ( uniforms[ key ] ) {

				const value = this._deserializeValue( preset[ key ] );

				if ( value !== null ) {

					// For objects with .copy() method
					if ( uniforms[ key ].value && uniforms[ key ].value.copy && value.copy ) {

						uniforms[ key ].value.copy( value );

					} else {

						uniforms[ key ].value = value;

					}

				}

			}

		}

		return true;

	}

	/**
	 * Deletes a preset.
	 * @param {string} name - Preset name
	 */
	deletePreset( name ) {

		this.presets.delete( name );
		this._saveToStorage();

	}

	/**
	 * Gets all preset names.
	 * @returns {Array<string>} Array of preset names
	 */
	getPresetNames() {

		return Array.from( this.presets.keys() );

	}

	/**
	 * Checks if a preset exists.
	 * @param {string} name - Preset name
	 * @returns {boolean} True if preset exists
	 */
	hasPreset( name ) {

		return this.presets.has( name );

	}

	/**
	 * Exports all presets as JSON string.
	 * @returns {string} JSON string of all presets
	 */
	exportPresets() {

		const data = {};

		this.presets.forEach( ( preset, name ) => {

			data[ name ] = preset;

		} );

		return JSON.stringify( data, null, 2 );

	}

	/**
	 * Imports presets from JSON string.
	 * @param {string} json - JSON string to import
	 * @param {boolean} merge - Whether to merge with existing presets
	 * @returns {boolean} Success status
	 */
	importPresets( json, merge = true ) {

		try {

			const data = JSON.parse( json );

			if ( ! merge ) {

				this.presets.clear();

			}

			for ( const name in data ) {

				this.presets.set( name, data[ name ] );

			}

			this._saveToStorage();
			return true;

		} catch ( e ) {

			console.warn( 'Failed to import presets:', e );
			return false;

		}

	}

	/**
	 * Clears all presets.
	 */
	clearAll() {

		this.presets.clear();
		this._saveToStorage();

	}

}

export { UniformPresetManager };

