import { Vector3 } from './Vector3.js';

const _direction = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();

export function intersectPlanes( planeA, planeB, target ) {

	_direction.crossVectors( planeA.normal, planeB.normal );

	const denominator = _direction.lengthSq();

	if ( denominator === 0 ) return null;

	target.direction.copy( _direction ).normalize();

	target.origin
		.copy( planeA.normal )
		.multiplyScalar( planeB.constant )
		.add( _normal.copy( planeB.normal ).multiplyScalar( - planeA.constant ) )
		.cross( _direction )
		.divideScalar( denominator );

	return target;

}
