// used in report-size.yml
import { formatBytes } from './formatBytes.js';

const n = Number( process.argv[ 2 ] );
const formatted = formatBytes( n );

console.log( formatted );
