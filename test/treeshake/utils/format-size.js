// used in report-size.yml
import prettyBytes from 'pretty-bytes';

const n = Number( process.argv[ 2 ] );
const formatted = prettyBytes( n, { minimumFractionDigits: 0, maximumFractionDigits: 1 } );

console.log( formatted );
