function SetValues( scope, values ) {

	if ( values === undefined ) return scope;

	var header = scope.type !== undefined ? "THREE." + scope.type + ": " : "";

	for ( var key in values ) {

		var newValue = values[ key ];

		if ( newValue === undefined ) {

			console.warn( header + "'" + key + "' parameter is undefined." );
			continue;

		}

		var currentValue = scope[ key ];

		if ( currentValue && currentValue.isColor ) {

			currentValue.set( newValue );

		} else if ( ( currentValue && currentValue.isVector3 ) && ( newValue && newValue.isVector3 ) ) {

			currentValue.copy( newValue );

		} else if ( scope.hasOwnProperty( key ) ) {

			scope[ key ] = newValue;

		} else {

			console.warn( header + "'" + key + "' property does not exist or has become obsolete." );

		}

	}

	return scope;

}

export { SetValues };
