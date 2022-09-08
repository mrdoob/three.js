import { fn } from '../../../Nodes.js';

// Original shader code from:
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_hsv.glsl

export const mx_hsvtorgb = fn( `vec3 mx_hsvtorgb(vec3 hsv)
{
    // Reference for this technique: Foley & van Dam
    float h = hsv.x; float s = hsv.y; float v = hsv.z;
    if (s < 0.0001f) {
      return vec3 (v, v, v);
    } else {
        h = 6.0f * (h - floor(h));  // expand to [0..6)
        int hi = int(trunc(h));
        float f = h - float(hi);
        float p = v * (1.0f-s);
        float q = v * (1.0f-s*f);
        float t = v * (1.0f-s*(1.0f-f));
        if (hi == 0)
            return vec3 (v, t, p);
        else if (hi == 1)
            return vec3 (q, v, p);
        else if (hi == 2)
            return vec3 (p, v, t);
        else if (hi == 3)
            return vec3 (p, q, v);
        else if (hi == 4)
            return vec3 (t, p, v);
        return vec3 (v, p, q);
    }
}` );

export const mx_rgbtohsv = fn( `vec3 mx_rgbtohsv(vec3 c)
{
    // See Foley & van Dam
    float r = c.x; float g = c.y; float b = c.z;
    float mincomp = min (r, min(g, b));
    float maxcomp = max (r, max(g, b));
    float delta = maxcomp - mincomp;  // chroma
    float h, s, v;
    v = maxcomp;
    if (maxcomp > 0.0f)
        s = delta / maxcomp;
    else s = 0.0f;
    if (s <= 0.0f)
        h = 0.0f;
    else {
        if      (r >= maxcomp) h = (g-b) / delta;
        else if (g >= maxcomp) h = 2.0f + (b-r) / delta;
        else                   h = 4.0f + (r-g) / delta;
        h *= (1.0f/6.0f);
        if (h < 0.0f)
            h += 1.0f;
    }
    return vec3(h, s, v);
}` );
