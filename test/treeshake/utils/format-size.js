// used in report-size.yml
import { formatBytes } from './formatBytes.js';

const n = Number( process.argv[ 2 ] );
const formatted = formatBytes( n, 2, false );

console.log( formatted );
