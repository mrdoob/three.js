import { BufferAttribute } from 'three';
import { normalView, positionView } from 'three/tsl';
import { mergeVertices } from '../../utils/BufferGeometryUtils.js';

// Keep parts indexed and tag their material zone before merging.
function part( geometry, id ) {

	const g = geometry.index ? geometry : mergeVertices( geometry );
	g.setAttribute( 'partId', new BufferAttribute( new Float32Array( g.attributes.position.count ).fill( id ), 1 ) );
	return g;

}

// derivative-based bump for a procedural, world-space height field. the built-in bumpMap
// offsets the UV to read its height, so it returns a zero gradient for a height keyed off
// world position; this feeds the hardware screen-space derivatives of the height into
// Mikkelsen's surface-gradient method so the relief actually perturbs the normal.
function bumpNormal( height ) {

	const dpdx = positionView.dFdx();
	const dpdy = positionView.dFdy();
	const r1 = dpdy.cross( normalView );
	const r2 = normalView.cross( dpdx );
	const det = dpdx.dot( r1 );
	const grad = det.sign().mul( height.dFdx().mul( r1 ).add( height.dFdy().mul( r2 ) ) );

	return det.abs().mul( normalView ).sub( grad ).normalize();

}

export { part, bumpNormal };
