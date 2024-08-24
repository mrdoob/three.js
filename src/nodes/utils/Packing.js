import { nodeObject } from '../tsl/TSLBase.js';

export const directionToColor = ( node ) => nodeObject( node ).mul( 0.5 ).add( 0.5 );
export const colorToDirection = ( node ) => nodeObject( node ).mul( 2.0 ).sub( 1 );
