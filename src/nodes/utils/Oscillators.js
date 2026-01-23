import { time } from './Timer.js';

/**
 * Generates a sine wave oscillation based on a timer.
 *
 * @tsl
 * @function
 * @param {Node<float>} t - The timer to generate the oscillation with.
 * @return {Node<float>} The oscillation node.
 */
export const oscSine = ( t = time ) => t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

/**
 * Generates a square wave oscillation based on a timer.
 *
 * @tsl
 * @function
 * @param {Node<float>} t - The timer to generate the oscillation with.
 * @return {Node<float>} The oscillation node.
 */
export const oscSquare = ( t = time ) => t.fract().round();

/**
 * Generates a triangle wave oscillation based on a timer.
 *
 * @tsl
 * @function
 * @param {Node<float>} t - The timer to generate the oscillation with.
 * @return {Node<float>} The oscillation node.
 */
export const oscTriangle = ( t = time ) => t.add( 0.5 ).fract().mul( 2 ).sub( 1 ).abs();

/**
 * Generates a sawtooth wave oscillation based on a timer.
 *
 * @tsl
 * @function
 * @param {Node<float>} t - The timer to generate the oscillation with.
 * @return {Node<float>} The oscillation node.
 */
export const oscSawtooth = ( t = time ) => t.fract();
