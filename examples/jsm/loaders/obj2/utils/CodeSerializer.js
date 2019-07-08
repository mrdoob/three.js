/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

const CodeSerializer = {

	/**
	 *
	 * @param fullName
	 * @param object
	 * @returns {string}
	 */
	serializeObject: function ( fullName, object ) {

		let objectString = fullName + ' = {\n\n';
		let part;
		for ( let name in object ) {

			part = object[ name ];
			if ( typeof ( part ) === 'string' || part instanceof String ) {

				part = part.replace( '\n', '\\n' );
				part = part.replace( '\r', '\\r' );
				objectString += '\t' + name + ': "' + part + '",\n';

			} else if ( part instanceof Array ) {

				objectString += '\t' + name + ': [' + part + '],\n';

			} else if ( typeof part === 'object' ) {

				// TODO: Short-cut for now. Recursion required?
				objectString += '\t' + name + ': {},\n';

			} else {

				objectString += '\t' + name + ': ' + part + ',\n';

			}

		}
		objectString += '}\n\n';

		return objectString;

	},

	/**
	 *
	 * @param fullName
	 * @param object
	 * @param basePrototypeName
	 * @param ignoreFunctions
	 * @returns {string}
	 */
	serializeClass: function ( fullName, object, constructorName, basePrototypeName, ignoreFunctions, includeFunctions, overrideFunctions ) {

		let valueString, objectPart, constructorString, i, funcOverride;
		let prototypeFunctions = [];
		let objectProperties = [];
		let objectFunctions = [];
		let isExtended = ( basePrototypeName !== null && basePrototypeName !== undefined );

		if ( ! Array.isArray( ignoreFunctions ) ) ignoreFunctions = [];
		if ( ! Array.isArray( includeFunctions ) ) includeFunctions = null;
		if ( ! Array.isArray( overrideFunctions ) ) overrideFunctions = [];

		for ( let name in object.prototype ) {

			objectPart = object.prototype[ name ];
			valueString = objectPart.toString();
			if ( name === 'constructor' ) {

				constructorString = fullName + ' = ' + valueString + ';\n\n';

			} else if ( typeof objectPart === 'function' ) {

				if ( ignoreFunctions.indexOf( name ) < 0 && ( includeFunctions === null || includeFunctions.indexOf( name ) >= 0 ) ) {

					funcOverride = overrideFunctions[ name ];
					if ( funcOverride && funcOverride.fullName === fullName + '.prototype.' + name ) {

						valueString = funcOverride.code;

					}
					if ( isExtended ) {

						prototypeFunctions.push( fullName + '.prototype.' + name + ' = ' + valueString + ';\n\n' );

					} else {

						prototypeFunctions.push( '\t' + name + ': ' + valueString + ',\n\n' );

					}

				}

			}

		}
		for ( let name in object ) {

			objectPart = object[ name ];

			if ( typeof objectPart === 'function' ) {

				if ( ignoreFunctions.indexOf( name ) < 0 && ( includeFunctions === null || includeFunctions.indexOf( name ) >= 0 ) ) {

					funcOverride = overrideFunctions[ name ];
					if ( funcOverride && funcOverride.fullName === fullName + '.' + name ) {

						valueString = funcOverride.code;

					} else {

						valueString = objectPart.toString();

					}
					objectFunctions.push( fullName + '.' + name + ' = ' + valueString + ';\n\n' );

				}

			} else {

				if ( typeof ( objectPart ) === 'string' || objectPart instanceof String ) {

					valueString = '\"' + objectPart.toString() + '\"';

				} else if ( typeof objectPart === 'object' ) {

					// TODO: Short-cut for now. Recursion required?
					valueString = "{}";

				} else {

					valueString = objectPart;

				}
				objectProperties.push( fullName + '.' + name + ' = ' + valueString + ';\n' );

			}

		}
		if ( ( constructorString === undefined || constructorString === null ) && typeof object.prototype.constructor === 'function' ) {

			constructorString = fullName + ' = ' + object.prototype.constructor.toString().replace( constructorName, '' );

		}
		let objectString = constructorString + '\n\n';
		if ( isExtended ) {

			objectString += fullName + '.prototype = Object.create( ' + basePrototypeName + '.prototype );\n';

		}
		objectString += fullName + '.prototype.constructor = ' + fullName + ';\n';
		objectString += '\n\n';

		for ( i = 0; i < objectProperties.length; i ++ ) objectString += objectProperties[ i ];
		objectString += '\n\n';

		for ( i = 0; i < objectFunctions.length; i ++ ) objectString += objectFunctions[ i ];
		objectString += '\n\n';

		if ( isExtended ) {

			for ( i = 0; i < prototypeFunctions.length; i ++ ) objectString += prototypeFunctions[ i ];

		} else {

			objectString += fullName + '.prototype = {\n\n';
			for ( i = 0; i < prototypeFunctions.length; i ++ ) objectString += prototypeFunctions[ i ];
			objectString += '\n};';

		}
		objectString += '\n\n';

		return objectString;

	},
};

export { CodeSerializer };
