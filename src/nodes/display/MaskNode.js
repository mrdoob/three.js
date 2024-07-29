import { output } from '../core/PropertyNode.js';
import { mrt } from '../core/MRTNode.js';
import { pass } from './PassNode.js';

export const maskPass = ( scene, camera ) => pass( scene, camera ).setMRT( mrt( { output: output.a } ) ).setClearColor( 0x000000 );
export const applyMask = ( base, mask, inner ) => base.sub( base.mul( mask.r ) ).add( inner.sub( inner.mul( mask.r.oneMinus() ) ) );
export const applyInverseMask = ( base, mask, inner ) => base.sub( base.mul( mask.r.oneMinus() ) ).add( inner.sub( inner.mul( mask.r ) ) );
