// Fixture that exercises only the functional Frustum API on plain
// FrustumLike objects, with no Frustum/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import {
	frustumContainsPoint,
	frustumCreate,
	frustumIntersectsSphere,
	frustumSetFromProjectionMatrix,
	mat4MakePerspective
} from '../..';

const f = frustumSetFromProjectionMatrix( mat4MakePerspective( - 1, 1, 1, - 1, 1, 100 ), undefined, false, frustumCreate() );

console.log( frustumContainsPoint( f, { x: 0, y: 0, z: - 50 } ) );
console.log( frustumIntersectsSphere( f, { center: { x: 0, y: 0, z: 0 }, radius: 1.1 } ) );
