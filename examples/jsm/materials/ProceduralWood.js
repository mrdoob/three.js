import * as THREE from "three";
import * as TSL from "three/tsl";

// some helpers below are ported from Blender
const map_range = TSL.wgslFn(`
    fn map_range(x: f32, from_min: f32, from_max: f32, to_min: f32, to_max: f32, clmp: bool) -> f32
    {
        let factor = (x - from_min) / (from_max - from_min);
        var result = to_min + factor * (to_max - to_min);

        if (clmp && to_min < to_max)
        {
            result = clamp(result, to_min, to_max);
        }
        else if (clmp && to_min > to_max)
        {
            result = clamp(result, to_max, to_min);
        }

        return result;
    }
`);

const voronoi3d = TSL.wgslFn(`
    fn voronoi3d(x: vec3<f32>, smoothness: f32, randomness: f32) -> f32
    {
        let p = floor(x);
        let f = fract(x);

        var res = 0.0;
        var total_weight = 0.0;
        
        for (var k = -1; k <= 1; k++)
        {
            for (var j = -1; j <= 1; j++)
            {
                for (var i = -1; i <= 1; i++)
                {
                    let b = vec3<f32>(f32(i), f32(j), f32(k));
                    let hash_offset = hash3d(p + b) * randomness;
                    let r = b - f + hash_offset;
                    let d = length(r);
                    
                    let weight = exp(-d * d / max(smoothness * smoothness, 0.001));
                    res += d * weight;
                    total_weight += weight;
                }
            }
        }
        
        if (total_weight > 0.0)
        {
            res /= total_weight;
        }
        
        return smoothstep(0.0, 1.0, res);
    }

    fn hash3d(p: vec3<f32>) -> vec3<f32>
    {
        var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xxy + p3.yzz) * p3.zyx);
    }
`);

const soft_light_mix = TSL.wgslFn(`
    fn node_mix_soft(t: f32, col1: vec3<f32>, col2: vec3<f32>) -> vec3<f32>
    {
        let tm = 1.0 - t;

        let one = vec3<f32>(1.0);
        let scr = one - (one - col2) * (one - col1);

        return tm * col1 + t * ((one - col1) * col2 * col1 + col1 * scr);
    }
`);

const noise_fbm = TSL.Fn(([p, detail, roughness, lacunarity, use_normalize]) =>
{
    let fscale = TSL.float(1.0).toVar();
    let amp = TSL.float(1.0).toVar();
    let maxamp = TSL.float(0.0).toVar();
    let sum = TSL.float(0.0).toVar();

    const iterations = detail.floor();
    
    TSL.Loop(iterations, ({ i }) =>
    {
        const t = TSL.mx_noise_float(p.mul(fscale));
        sum.addAssign(t.mul(amp));
        maxamp.addAssign(amp);
        amp.mulAssign(roughness);
        fscale.mulAssign(lacunarity);
    });

    const rmd = detail.sub(iterations);
    const has_remainder = rmd.greaterThan(0.001);
    
    return TSL.select(
        has_remainder,
        TSL.select(
            use_normalize.equal(1),
            (() => {
                const t = TSL.mx_noise_float(p.mul(fscale));
                const sum2 = sum.add(t.mul(amp));
                const maxamp2 = maxamp.add(amp);
                const normalized_sum = sum.div(maxamp).mul(0.5).add(0.5);
                const normalized_sum2 = sum2.div(maxamp2).mul(0.5).add(0.5);
                return TSL.mix(normalized_sum, normalized_sum2, rmd);
            })(),
            (() => {
                const t = TSL.mx_noise_float(p.mul(fscale));
                const sum2 = sum.add(t.mul(amp));
                return TSL.mix(sum, sum2, rmd);
            })()
        ),
        TSL.select(
            use_normalize.equal(1),
            sum.div(maxamp).mul(0.5).add(0.5),
            sum
        )
    );
});

const noise_fbm_3d = TSL.Fn(([p, detail, roughness, lacunarity, use_normalize]) =>
{
    let fscale = TSL.float(1.0).toVar();
    let amp = TSL.float(1.0).toVar();
    let maxamp = TSL.float(0.0).toVar();
    let sum = TSL.vec3(0.0).toVar();

    const iterations = detail.floor();
    
    TSL.Loop(iterations, ({ i }) =>
    {
        const t = TSL.mx_noise_vec3(p.mul(fscale));
        sum.addAssign(t.mul(amp));
        maxamp.addAssign(amp);
        amp.mulAssign(roughness);
        fscale.mulAssign(lacunarity);
    });

    const rmd = detail.sub(iterations);
    const has_remainder = rmd.greaterThan(0.001);
    
    return TSL.select(
        has_remainder,
        TSL.select(
            use_normalize.equal(1),
            (() =>
            {
                const t = TSL.mx_noise_vec3(p.mul(fscale));
                const sum2 = sum.add(t.mul(amp));
                const maxamp2 = maxamp.add(amp);
                const normalized_sum = sum.div(maxamp).mul(0.5).add(0.5);
                const normalized_sum2 = sum2.div(maxamp2).mul(0.5).add(0.5);
                return TSL.mix(normalized_sum, normalized_sum2, rmd);
            })(),
            (() =>
            {
                const t = TSL.mx_noise_vec3(p.mul(fscale));
                const sum2 = sum.add(t.mul(amp));
                return TSL.mix(sum, sum2, rmd);
            })()
        ),
        TSL.select(
            use_normalize.equal(1),
            sum.div(maxamp).mul(0.5).add(0.5),
            sum
        )
    );
});

const wood_center = TSL.Fn(([p, center_size]) =>
{
    const pxy_center = p.mul(TSL.vec3(1, 1, 0)).length();
    const center = map_range(pxy_center, 0, 1, 0, center_size, true);
    
    return center;
});

const space_warp = TSL.Fn(([p, warp_strength, xy_scale, z_scale]) =>
{
    const combined_xyz  = TSL.vec3(xy_scale, xy_scale, z_scale).mul(p);
    const noise         = noise_fbm_3d(combined_xyz.mul(1.6*1.5), TSL.float(1), TSL.float(0.5), TSL.float(2), TSL.int(1)).sub(0.5).mul(warp_strength);
    const p_xy          = p.mul(TSL.vec3(1, 1, 0));
    const normalized_xy = p_xy.normalize();
    const warp          = noise.mul(normalized_xy).add(p_xy); 

    return warp;
});

const wood_rings = TSL.Fn(([w, ring_count, ring_bias, ring_size_variance, ring_variance_scale, bark_thickness]) =>
{
    const rings = noise_fbm(w.mul(ring_variance_scale), TSL.float(1), TSL.float(0.5), TSL.float(2), TSL.int(1)).mul(ring_size_variance).add(w).mul(ring_count).fract().mul(bark_thickness);

    return TSL.min(map_range(rings, 0, ring_bias, 0, 1, TSL.bool(true)), map_range(rings, ring_bias, 1, 1, 0, TSL.bool(true)));
});

const wood_detail = TSL.Fn(([warp, p, y, splotch_scale]) =>
{
    const radial_coords = TSL.clamp(TSL.atan(warp.y, warp.x).div(TSL.PI2).add(0.5), 0, 1).mul(TSL.PI2.mul(3));
    const combined_xyz = TSL.vec3(radial_coords.sin(), y, radial_coords.cos().mul(p.z));
    const scaled = TSL.vec3(0.1, 1.19, 0.05).mul(combined_xyz);

    return noise_fbm(scaled.mul(splotch_scale), TSL.float(1), TSL.float(0.5), TSL.float(2), TSL.bool(true));
});

const cell_structure = TSL.Fn(([p, cell_scale, cell_size]) =>
{   
    const warp = space_warp(p.mul(cell_scale.div(50)), cell_scale.div(1000), 0.1, 1.77);
    const cells = voronoi3d(warp.xy.mul(75), 0.5, 1);

    return map_range(cells, cell_size, cell_size.add(0.21), 0, 1, TSL.bool(true));
});

const wood = TSL.Fn(([p,
        center_size,
        large_warp_scale,
        large_grain_stretch,
        small_warp_strength,
        small_warp_scale,
        fine_warp_strength,
        fine_warp_scale,
        ring_count,
        ring_bias,
        ring_size_variance,
        ring_variance_scale,
        bark_thickness,
        splotch_scale,
        splotch_intensity,
        cell_scale,
        cell_size,
        dark_wood_color,
        light_wood_color
]) =>
{
    const center      = wood_center(p, center_size);
    const main_warp   = space_warp(space_warp(p, center, large_warp_scale, large_grain_stretch), small_warp_strength, small_warp_scale, 0.17);
    const detail_warp = space_warp(main_warp, fine_warp_strength, fine_warp_scale, 0.17);
    const rings       = wood_rings(detail_warp.length(), ring_count, ring_bias, ring_size_variance, ring_variance_scale, bark_thickness); 
    const detail      = wood_detail(detail_warp, p, detail_warp.length(), splotch_scale);
    const cells       = cell_structure(main_warp, cell_scale, cell_size);
    const base_color  = TSL.mix(dark_wood_color.rgb, light_wood_color.rgb, rings);
    
    return soft_light_mix(splotch_intensity, soft_light_mix(0.407, base_color, cells), detail);
});

const wood_params =
{
    teak:
    {
        center_size: 1.11, large_warp_scale: 0.32, large_grain_stretch: 0.24, small_warp_strength: 0.059,
        small_warp_scale: 2, fine_warp_strength: 0.006, fine_warp_scale: 32.8, ring_count: 34,
        ring_bias: 0.59, ring_size_variance: 0.16, ring_variance_scale: 1.4, bark_thickness: 0.61,
        splotch_scale: 0.2, splotch_intensity: 0.541, cell_scale: 910, cell_size: 0.1,
        dark_wood_color: "#0c0504", light_wood_color: "#533319"
    },
    walnut:
    {
        center_size: 1.07, large_warp_scale: 0.42, large_grain_stretch: 0.34, small_warp_strength: 0.016,
        small_warp_scale: 10.3, fine_warp_strength: 0.028, fine_warp_scale: 12.7, ring_count: 32,
        ring_bias: 0.08, ring_size_variance: 0.03, ring_variance_scale: 5.5, bark_thickness: 0.98,
        splotch_scale: 1.84, splotch_intensity: 0.97, cell_scale: 710, cell_size: 0.31,
        dark_wood_color: "#311e13", light_wood_color: "#523424"
    },
    white_oak:
    {
        center_size: 1.23, large_warp_scale: 0.21, large_grain_stretch: 0.21, small_warp_strength: 0.034,
        small_warp_scale: 2.44, fine_warp_strength: 0.01, fine_warp_scale: 14.3, ring_count: 34,
        ring_bias: 0.82, ring_size_variance: 0.16, ring_variance_scale: 1.4, bark_thickness: 0.7,
        splotch_scale: 0.2, splotch_intensity: 0.541, cell_scale: 800, cell_size: 0.28,
        dark_wood_color: "#8b4c21", light_wood_color: "#c57e43"
    },
    pine:
    {
        center_size: 1.23, large_warp_scale: 0.21, large_grain_stretch: 0.18, small_warp_strength: 0.041,
        small_warp_scale: 2.44, fine_warp_strength: 0.006, fine_warp_scale: 23.2, ring_count: 24,
        ring_bias: 0.1, ring_size_variance: 0.07, ring_variance_scale: 5, bark_thickness: 0.35,
        splotch_scale: 0.51, splotch_intensity: 3.32, cell_scale: 1480, cell_size: 0.07,
        dark_wood_color: "#c58355", light_wood_color: "#d19d61"
    },
    poplar:
    {
        center_size: 1.43, large_warp_scale: 0.33, large_grain_stretch: 0.18, small_warp_strength: 0.04,
        small_warp_scale: 4.3, fine_warp_strength: 0.004, fine_warp_scale: 33.6, ring_count: 37,
        ring_bias: 0.07, ring_size_variance: 0.03, ring_variance_scale: 3.8, bark_thickness: 0.3,
        splotch_scale: 1.92, splotch_intensity: 0.71, cell_scale: 830, cell_size: 0.04,
        dark_wood_color: "#716347", light_wood_color: "#998966"
    },
    maple:
    {
        center_size: 1.4, large_warp_scale: 0.38, large_grain_stretch: 0.25, small_warp_strength: 0.067,
        small_warp_scale: 2.5, fine_warp_strength: 0.005, fine_warp_scale: 33.6, ring_count: 35,
        ring_bias: 0.1, ring_size_variance: 0.07, ring_variance_scale: 4.6, bark_thickness: 0.61,
        splotch_scale: 0.46, splotch_intensity: 1.49, cell_scale: 800, cell_size: 0.03,
        dark_wood_color: "#b08969", light_wood_color: "#bc9d7d"
    },
    red_oak:
    {
        center_size: 1.21, large_warp_scale: 0.24, large_grain_stretch: 0.25, small_warp_strength: 0.044,
        small_warp_scale: 2.54, fine_warp_strength: 0.01, fine_warp_scale: 14.5, ring_count: 34,
        ring_bias: 0.92, ring_size_variance: 0.03, ring_variance_scale: 5.6, bark_thickness: 1.01,
        splotch_scale: 0.28, splotch_intensity: 3.48, cell_scale: 800, cell_size: 0.25,
        dark_wood_color: "#af613b", light_wood_color: "#e0a27a"
    },
    cherry:
    {
        center_size: 1.33, large_warp_scale: 0.11, large_grain_stretch: 0.33, small_warp_strength: 0.024,
        small_warp_scale: 2.48, fine_warp_strength: 0.01, fine_warp_scale: 15.3, ring_count: 36,
        ring_bias: 0.02, ring_size_variance: 0.04, ring_variance_scale: 6.5, bark_thickness: 0.09,
        splotch_scale: 1.27, splotch_intensity: 1.24, cell_scale: 1530, cell_size: 0.15,
        dark_wood_color: "#913f27", light_wood_color: "#b45837"
    },
    cedar: 
    {
        center_size: 1.11, large_warp_scale: 0.39, large_grain_stretch: 0.12, small_warp_strength: 0.061,
        small_warp_scale: 1.9, fine_warp_strength: 0.006, fine_warp_scale: 4.8, ring_count: 25,
        ring_bias: 0.01, ring_size_variance: 0.07, ring_variance_scale: 6.7, bark_thickness: 1.21,
        splotch_scale: 0.61, splotch_intensity: 2.54, cell_scale: 330, cell_size: 0.36,
        dark_wood_color: "#90462c", light_wood_color: "#83442a"
    },
    mahogany:
    {
        center_size: 1.25, large_warp_scale: 0.26, large_grain_stretch: 0.29, small_warp_strength: 0.044,
        small_warp_scale: 2.54, fine_warp_strength: 0.01, fine_warp_scale: 15.3, ring_count: 38,
        ring_bias: 0.01, ring_size_variance: 0.33, ring_variance_scale: 1.2, bark_thickness: 0.07,
        splotch_scale: 0.77, splotch_intensity: 1.39, cell_scale: 1400, cell_size: 0.23,
        dark_wood_color: "#501d12", light_wood_color: "#6d3722"
    }
};

export const WoodTypes = ["teak", "walnut", "white_oak", "pine", "poplar", "maple", "red_oak", "cherry", "cedar", "mahogany"];
export const FinishTypes = ["raw", "matte", "semigloss", "gloss"];

export function GetWoodPreset(type, finish)
{
    const params = wood_params[type] || wood_params.white_oak;
    
    let clearcoat, clearcoat_roughness, clearcoat_darken;
    
    switch (finish)
    {
        case "gloss":
            clearcoat_darken = 0.2; clearcoat_roughness = 0.1; clearcoat = 1;
        break;

        case "semigloss":
            clearcoat_darken = 0.4; clearcoat_roughness = 0.4; clearcoat = 1;
        break;

        case "matte":
            clearcoat_darken = 0.6; clearcoat_roughness = 1; clearcoat = 1;
        break;

        case "raw":
        default:
            clearcoat_darken = 1; clearcoat_roughness = 0; clearcoat = 0;
    }

    return { wood_type: type, wood_finish: finish, wood_params: params, wood_clearcoat: clearcoat, wood_clearcoat_roughness: clearcoat_roughness, wood_clearcoat_darken: clearcoat_darken };
}

export function GenerateWoodMaterial(params)
{
    const material = new THREE.MeshPhysicalMaterial();

    material.colorNode = wood(
        TSL.positionLocal.add(TSL.vec3(-0.4, (Math.random()-0.5)*2, Math.random()*2)),
        params.wood_params.center_size, params.wood_params.large_warp_scale, params.wood_params.large_grain_stretch, params.wood_params.small_warp_strength,
        params.wood_params.small_warp_scale, params.wood_params.fine_warp_strength, params.wood_params.fine_warp_scale, params.wood_params.ring_count,
        params.wood_params.ring_bias, params.wood_params.ring_size_variance, params.wood_params.ring_variance_scale, params.wood_params.bark_thickness,
        params.wood_params.splotch_scale, params.wood_params.splotch_intensity, params.wood_params.cell_scale, params.wood_params.cell_size,
        new THREE.Color(params.wood_params.dark_wood_color).convertLinearToSRGB(),
        new THREE.Color(params.wood_params.light_wood_color).convertLinearToSRGB()
    ).mul(params.wood_clearcoat_darken);

    material.customProgramCacheKey = () => params.wood_type + params.wood_finish;
    material.clearcoatNode = params.wood_clearcoat;
    material.clearcoatRoughness = params.wood_clearcoat_roughness;

    return material;
}
