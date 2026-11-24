import './Three.Core.js';
import { warn } from './utils.js';

export * from './nodes/TSL.js';

if ( typeof window !== 'undefined' ) {

	if ( window.__THREE_NODES__ ) {

		warn( 'WARNING: Multiple instances of TSL being imported.' );

	} else {

		window.__THREE_NODES__ = true;

	}

}
