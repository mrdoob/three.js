
module.exports = function extractConstants( obj ) {

	var result = {},

		RegExpUpperCaseId = /^[A-Z_]\w+$/;

	for ( var name in obj ) {

		var value = obj[ name ];

		if ( typeof value === 'number' &&
				RegExpUpperCaseId.test( name ) ) {

			result[ name ] = value;

		}

	}

	return result;

};

