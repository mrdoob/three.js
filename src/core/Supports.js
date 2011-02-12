/**
 * @author alteredq / http://alteredqualia.com/
 */
 
THREE.Supports = {
	
	canvas	: !!document.createElement( 'canvas' ).getContext,
	webgl	: window.Uint8Array != undefined,
	workers : !!window.Worker
	
};