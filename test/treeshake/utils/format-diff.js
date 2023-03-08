// used in report-size.yml
import { formatBytes } from './formatBytes.js';

const filesize = Number( process.argv[ 2 ] );
const filesizeBase = Number( process.argv[ 3 ] );

const diff = filesize - filesizeBase;
const formatted = `${diff >= 0 ? '+' : '-'}${formatBytes( Math.abs( diff ), 2 )}`;

console.log( formatted );
