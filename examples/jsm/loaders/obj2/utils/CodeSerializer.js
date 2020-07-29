/**
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

const CodeSerializer = {

	/**
	 * Serialize an object with specific prototype definition.
	 *
	 * @param {Object} targetPrototype The object that should be serialized
	 * @param {Object} targetPrototypeInstance An instance of the oriobject that should be serialized
	 * @param {String} [basePrototypeName] Name of the prototype
	 * @param {Object} [overrideFunctions} Array of {@Link CodeSerializationInstruction} allows to replace or remove function with provided content
	 *
	 * @returns {String}
	 */
	serializeClass: function ( targetPrototype, targetPrototypeInstance, basePrototypeName, overrideFunctions ) {

		let objectPart, constructorString, i, funcInstructions, funcTemp;
		let fullObjectName = targetPrototypeInstance.constructor.name;
		let prototypeFunctions = [];
		let objectProperties = [];
		let objectFunctions = [];
		let isExtended = ( basePrototypeName !== null && basePrototypeName !== undefined );

		if ( ! Array.isArray( overrideFunctions ) ) overrideFunctions = [];

		for ( let name in targetPrototype.prototype ) {

			objectPart = targetPrototype.prototype[ name ];
			funcInstructions = new CodeSerializationInstruction( name, fullObjectName + '.prototype.' + name );
			funcInstructions.setCode( objectPart.toString() );

			if ( name === 'constructor' ) {

				if ( ! funcInstructions.isRemoveCode() ) {

					constructorString = fullObjectName + ' = ' + funcInstructions.getCode() + ';\n\n';

				}

			} else if ( typeof objectPart === 'function' ) {

				funcTemp = overrideFunctions[ name ];

				if ( funcTemp instanceof CodeSerializationInstruction && funcTemp.getName() === funcInstructions.getName() ) {

					funcInstructions = funcTemp;

				}

				if ( ! funcInstructions.isRemoveCode() ) {

					if ( isExtended ) {

						prototypeFunctions.push( funcInstructions.getFullName() + ' = ' + funcInstructions.getCode() + ';\n\n' );

					} else {

						prototypeFunctions.push( '\t' + funcInstructions.getName() + ': ' + funcInstructions.getCode() + ',\n\n' );

					}

				}

			}

		}

		for ( let name in targetPrototype ) {

			objectPart = targetPrototype[ name ];
			funcInstructions = new CodeSerializationInstruction( name, fullObjectName + '.' + name );

			if ( typeof objectPart === 'function' ) {

				funcTemp = overrideFunctions[ name ];
				if ( funcTemp instanceof CodeSerializationInstruction && funcTemp.getName() === funcInstructions.getName() ) {

					funcInstructions = funcTemp;

				} else {

					funcInstructions.setCode( objectPart.toString() );

				}

				if ( ! funcInstructions.isRemoveCode() ) {

					objectFunctions.push( funcInstructions.getFullName() + ' = ' + funcInstructions.getCode() + ';\n\n' );

				}

			} else {

				if ( typeof ( objectPart ) === 'string' || objectPart instanceof String ) {

					funcInstructions.setCode( '\"' + objectPart.toString() + '\"' );

				} else if ( typeof objectPart === 'object' ) {

					console.log( 'Omitting object "' + funcInstructions.getName() + '" and replace it with empty object.' );
					funcInstructions.setCode( "{}" );

				} else {

					funcInstructions.setCode( objectPart );

				}

				if ( ! funcInstructions.isRemoveCode() ) {

					objectProperties.push( funcInstructions.getFullName() + ' = ' + funcInstructions.getCode() + ';\n' );

				}

			}

		}

		let objectString = constructorString + '\n\n';

		if ( isExtended ) {

			objectString += fullObjectName + '.prototype = Object.create( ' + basePrototypeName + '.prototype );\n';

		}

		objectString += fullObjectName + '.prototype.constructor = ' + fullObjectName + ';\n';
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

			objectString += fullObjectName + '.prototype = {\n\n';
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
 * Allows to define instructions to override or remove
 * @param {String} name Usually the name of a function
 * @param {String} fullName The name plus full object description
 * @constructor
 */
const CodeSerializationInstruction = function ( name, fullName ) {

	this.name = name;
	this.fullName = fullName;
	this.code = null;
	this.removeCode = false;

};

CodeSerializationInstruction.prototype = {

	constructor: CodeSerializationInstruction,

	/**
	 * Returns the name of the function
	 * @return {String}
	 */
	getName: function () {

		return this.name;

	},

	/**
	 * Returns the full name of the function
	 * @return {String}
	 */
	getFullName: function () {

		return this.fullName;

	},

	/**
	 * Set the string containing the serialized function
	 * @param {String} code
	 * @return {CodeSerializationInstruction}
	 */
	setCode: function ( code ) {

		this.code = code;
		return this;

	},

	/**
	 * Returns the serialized function code
	 * @return {String}
	 */
	getCode: function () {

		return this.code;

	},

	/**
	 * Set if function should be removed
	 * @param {boolean} removeCode
	 * @return {CodeSerializationInstruction}
	 */
	setRemoveCode: function ( removeCode ) {

		this.removeCode = removeCode;
		return this;

	},

	/**
	 * If function should be completely removed
	 * @return {boolean}
	 */
	isRemoveCode: function () {

		return this.removeCode;

	}

};

export {
	CodeSerializer,
	CodeSerializationInstruction
};
