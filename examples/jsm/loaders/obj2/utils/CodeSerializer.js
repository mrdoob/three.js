/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

const CodeSerializer = {

	/**
	 * Serialize an object without specific prototype definition.
	 *
	 * @param {String} fullName complete object name
	 * @param {Object} object The object that should be serialized
	 * @returns {String}
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
	 * Serialize an object with specific prototype definition.
	 *
	 * @param {String} fullName complete object name
	 * @param {Object} object The object that should be serialized
	 * @param {String} constructorName
	 * @param {String} basePrototypeName
	 * @param {Object} overrideFunctions Object of {@Link OverrideFunctionDescription}
	 * @returns {String}
	 */
	serializeClass: function ( fullName, object, constructorName, basePrototypeName, overrideFunctions ) {

		let valueString, objectPart, constructorString, i, funcOverride, currentName;
		let prototypeFunctions = [];
		let objectProperties = [];
		let objectFunctions = [];
		let isExtended = ( basePrototypeName !== null && basePrototypeName !== undefined );

		if ( ! Array.isArray( overrideFunctions ) ) overrideFunctions = [];

		for ( let name in object.prototype ) {

			objectPart = object.prototype[ name ];
			valueString = objectPart.toString();
			if ( name === 'constructor' ) {

				constructorString = fullName + ' = ' + valueString + ';\n\n';

			} else if ( typeof objectPart === 'function' ) {

				currentName = fullName + '.prototype.' + name;
				funcOverride = overrideFunctions[ name ];
				if ( funcOverride instanceof OverrideFunctionInstruction && funcOverride.getFullName() === currentName ) {

					valueString = funcOverride.code;

				}
				if ( isExtended ) {

					prototypeFunctions.push( currentName + ' = ' + valueString + ';\n\n' );

				} else {

					prototypeFunctions.push( '\t' + name + ': ' + valueString + ',\n\n' );

				}

			}

		}
		for ( let name in object ) {

			objectPart = object[ name ];
			currentName = fullName + '.' + name;

			if ( typeof objectPart === 'function' ) {

				funcOverride = overrideFunctions[ name ];
				if ( funcOverride instanceof OverrideFunctionInstruction && funcOverride.getFullName() === currentName ) {

					valueString = funcOverride.getFunctionCode();

				} else {

					valueString = objectPart.toString();

				}
				objectFunctions.push( currentName + ' = ' + valueString + ';\n\n' );

			} else {

				if ( typeof ( objectPart ) === 'string' || objectPart instanceof String ) {

					valueString = '\"' + objectPart.toString() + '\"';

				} else if ( typeof objectPart === 'object' ) {

					// TODO: Short-cut for now. Recursion required?
					valueString = "{}";

				} else {

					valueString = objectPart;

				}
				objectProperties.push( currentName + ' = ' + valueString + ';\n' );

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

		for ( i = 0; i < objectProperties.length; i ++ ) {

			objectString += objectProperties[ i ];

		}
		objectString += '\n\n';

		for ( i = 0; i < objectFunctions.length; i ++ ) {

			objectString += objectFunctions[ i ];

		}
		objectString += '\n\n';

		if ( isExtended ) {

			for ( i = 0; i < prototypeFunctions.length; i ++ ) {

				objectString += prototypeFunctions[ i ];

			}

		} else {

			objectString += fullName + '.prototype = {\n\n';
			for ( i = 0; i < prototypeFunctions.length; i ++ ) {

				objectString += prototypeFunctions[ i ];

			}
			objectString += '\n};';

		}
		objectString += '\n\n';

		return objectString;

	},
};

/**
 *
 * @param {String} fullName
 * @param {String} functionCode
 * @constructor
 */
const OverrideFunctionInstruction = function ( fullName, functionCode ) {

	this.fullName = fullName;
	this.functionCode = functionCode;

};

OverrideFunctionInstruction.prototype = {

	constructor: OverrideFunctionInstruction,

	/**
	 * Returns the full name of the function
	 * @return {String}
	 */
	getFullName: function () {

		return this.fullName;

	},

	/**
	 * Returns the serialized function code
	 * @return {String}
	 */
	getFunctionCode: function() {

		return this.functionCode;

	}

};

export {
	CodeSerializer,
	OverrideFunctionInstruction
};
