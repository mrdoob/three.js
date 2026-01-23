import {
	abs, floor, ceil, round, trunc, sign,
	min, max, clamp,
	sin, cos, tan, asin, acos, atan,
	exp, log, log2, sqrt,
	length, distance, normalize,
	dot, cross,
	mix
} from '../math/MathNode.js';
import { add, sub } from '../math/OperatorNode.js';
import { triNoise3D } from '../math/TriNoise3D.js';
import { positionLocal, positionWorld } from '../accessors/Position.js';
import { normalLocal, normalWorld, normalView } from '../accessors/Normal.js';
import { tangentLocal, tangentWorld, tangentView } from '../accessors/Tangent.js';
import { uv } from '../accessors/UV.js';
import { float, vec3 } from '../tsl/TSLBase.js';
import { blendBurn, blendDodge, blendScreen, blendOverlay } from '../display/BlendModes.js';

// math

export const mx_abs = (val) => abs(val);
export const mx_floor = (val) => floor(val);
export const mx_ceil = (val) => ceil(val);
export const mx_round = (val) => round(val);
export const mx_trunc = (val) => trunc(val);
export const mx_sign = (val) => sign(val);

export const mx_min = (val1, val2) => min(val1, val2);
export const mx_max = (val1, val2) => max(val1, val2);
export const mx_clamp = (val, minVal, maxVal) => clamp(val, minVal, maxVal);

export const mx_sin = (val) => sin(val);
export const mx_cos = (val) => cos(val);
export const mx_tan = (val) => tan(val);
export const mx_asin = (val) => asin(val);
export const mx_acos = (val) => acos(val);
export const mx_atan = (val) => atan(val);

export const mx_exp = (val) => exp(val);
export const mx_log = (val) => log(val);
export const mx_ln = (val) => log2(val);
export const mx_sqrt = (val) => sqrt(val);

export const mx_magnitude = (val) => length(val);
export const mx_distance = (val1, val2) => distance(val1, val2);
export const mx_normalize = (val) => normalize(val);
export const mx_dot = (val1, val2) => dot(val1, val2);
export const mx_cross = (val1, val2) => cross(val1, val2);

// noise

export const mx_noise_float = (texcoord, amplitude = 1, pivot = 0) => triNoise3D(texcoord, 1.0, 0.0).mul(amplitude).add(pivot);
export const mx_noise_vec3 = (texcoord, amplitude = 1, pivot = 0) => vec3(triNoise3D(texcoord, 1.0, 0.0), triNoise3D(texcoord.add(10.0), 1.0, 0.0), triNoise3D(texcoord.add(20.0), 1.0, 0.0)).mul(amplitude).add(pivot);

// geometric

export const mx_position = (space = 'local') => {

	if (space === 'local') return positionLocal;
	if (space === 'world') return positionWorld;

	return positionWorld;

};

export const mx_normal = (space = 'local') => {

	if (space === 'local') return normalLocal;
	if (space === 'world') return normalWorld;
	if (space === 'view') return normalView;

	return normalWorld;

};

export const mx_tangent = (space = 'local') => {

	if (space === 'local') return tangentLocal;
	if (space === 'world') return tangentWorld;
	if (space === 'view') return tangentView;

	return tangentWorld;

};

export const mx_texcoord = (index = 0) => uv(index);

// compositing

export const mx_burn = (base, fg) => blendBurn(base, fg);
export const mx_dodge = (base, fg) => blendDodge(base, fg);
export const mx_screen = (base, fg) => blendScreen(base, fg);
export const mx_overlay = (base, fg) => blendOverlay(base, fg);
export const mx_plus = (base, fg) => add(base, fg);
export const mx_minus = (base, fg) => sub(base, fg);
export const mx_difference = (base, fg) => abs(sub(base, fg));
