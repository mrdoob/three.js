import { time } from './Timer.js';

export const oscSine = ( t = time ) => t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );
export const oscSquare = ( t = time ) => t.fract().round();
export const oscTriangle = ( t = time ) => t.add( 0.5 ).fract().mul( 2 ).sub( 1 ).abs();
export const oscSawtooth = ( t = time ) => t.fract();
