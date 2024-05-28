import { attribute } from '../core/AttributeNode.js';

export const uv = ( index ) => attribute( 'uv' + ( index > 0 ? index : '' ), 'vec2' );
