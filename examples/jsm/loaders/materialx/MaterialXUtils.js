function normalizeSpaceName( value, fallback = 'world' ) {

	if ( typeof value !== 'string' ) return fallback;
	const normalized = value.trim().toLowerCase();
	if ( normalized === '' ) return fallback;
	if ( normalized === 'world' ) return 'world';
	if ( normalized === 'object' || normalized === 'model' ) return 'object';
	return fallback;

}

export { normalizeSpaceName };
