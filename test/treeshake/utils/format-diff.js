// used in report-size.yml

const filesize = Number( process.argv[ 2 ] );
const filesizeBase = Number( process.argv[ 3 ] );

const diff = ( filesize - filesizeBase ) * 100 / filesizeBase;
const diffString = diff.toFixed( 2 ).slice( - 1 ) === '0' ? diff.toFixed( 1 ) : diff.toFixed( 2 );
const formatted = `${diff >= 0 ? '+' : ''}${diffString}%`;

console.log( formatted );
