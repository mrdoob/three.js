// Fixture that exercises only the functional SphericalHarmonics3 API on plain
// SphericalHarmonics3Like objects, with no SphericalHarmonics3/Object3D/renderer
// usage. Used to verify that consumers of the functional API do not pull in
// the rest of three.js (see test/rollup.treeshake.config.js).
import { sh3Create, sh3GetAt, sh3Scale, sh3Set } from '../..';

const a = sh3Create();
sh3Set( [
	{ x: 1, y: 0, z: 0 },
	{ x: 0, y: 1, z: 0 },
	{ x: 0, y: 0, z: 1 },
	{ x: 1, y: 1, z: 0 },
	{ x: 0, y: 1, z: 1 },
	{ x: 1, y: 0, z: 1 },
	{ x: 1, y: 1, z: 1 },
	{ x: 0.5, y: 0.5, z: 0.5 },
	{ x: 0.25, y: 0.25, z: 0.25 }
], a );
sh3Scale( a, 2, a );

const radiance = sh3GetAt( a, { x: 0, y: 1, z: 0 } );

console.log( radiance.x, radiance.y, radiance.z );
