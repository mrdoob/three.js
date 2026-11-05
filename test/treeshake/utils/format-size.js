// used in report-size.yml

const n = Number( process.argv[ 2 ] );
const formatted = ( n / 1000 ).toFixed( 2 );

console.log( formatted );
