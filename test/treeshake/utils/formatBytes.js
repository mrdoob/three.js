export function formatBytes( bytes, decimals = 1, units = true ) {

	if ( bytes === 0 ) return '0 B';

	const k = 1000;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = [ 'B', 'kB', 'MB', 'GB' ];

	const i = Math.floor( Math.log( bytes ) / Math.log( k ) );

	return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ( units ? ' ' + sizes[ i ] : '' );

}
