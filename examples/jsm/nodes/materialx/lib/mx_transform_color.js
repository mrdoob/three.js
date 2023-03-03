import { code } from '../../core/CodeNode.js';
import { fn } from '../../core/FunctionNode.js';

// Original shader code from:
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_transform_color.glsl

export const mx_transform_color = code( `#define M_AP1_TO_REC709 mat3(1.705079555511475, -0.1297005265951157, -0.02416634373366833, -0.6242334842681885, 1.138468623161316, -0.1246141716837883, -0.0808461606502533, -0.008768022060394287, 1.148780584335327)

vec3 mx_srgb_texture_to_lin_rec709(vec3 color)
{
    bvec3 isAbove = greaterThan(color, vec3(0.04045));
    vec3 linSeg = color / 12.92;
    vec3 powSeg = pow(max(color + vec3(0.055), vec3(0.0)) / 1.055, vec3(2.4));
    return mix(linSeg, powSeg, isAbove);
}` );

const includes = [ mx_transform_color ];

export const mx_srgb_texture_to_lin_rec709 = fn( 'vec3 mx_srgb_texture_to_lin_rec709( vec3 color )', includes );
