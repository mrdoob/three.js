const materialXNodeCategories = new Set();

function hasMaterialXCategory( category ) {

	return materialXNodeCategories.has( category );

}

function validateCategoryCoverage( {
	compileCategories = [],
	surfaceCategories = [],
	allowUnknownCompileCategories = [],
} = {} ) {

	materialXNodeCategories.clear();

	for ( const category of compileCategories ) {

		materialXNodeCategories.add( category );

	}

	for ( const category of surfaceCategories ) {

		materialXNodeCategories.add( category );

	}

	for ( const category of allowUnknownCompileCategories ) {

		materialXNodeCategories.add( category );

	}

	const allowUnknownCompileSet = new Set( allowUnknownCompileCategories );
	const unknownCompile = [];
	const unknownSurface = [];

	for ( const category of compileCategories ) {

		if ( ! hasMaterialXCategory( category ) && ! allowUnknownCompileSet.has( category ) ) {

			unknownCompile.push( category );

		}

	}

	for ( const category of surfaceCategories ) {

		if ( ! hasMaterialXCategory( category ) ) {

			unknownSurface.push( category );

		}

	}

	if ( unknownCompile.length === 0 && unknownSurface.length === 0 ) {

		return;

	}

	const details = [];
	if ( unknownCompile.length > 0 ) {

		details.push( `unknown compile categories: ${unknownCompile.sort().join( ', ' )}` );

	}

	if ( unknownSurface.length > 0 ) {

		details.push( `unknown surface categories: ${unknownSurface.sort().join( ', ' )}` );

	}

	throw new Error( `MaterialX translator registry validation failed (${details.join( '; ' )}).` );

}

export {
	materialXNodeCategories,
	hasMaterialXCategory,
	validateCategoryCoverage,
};
