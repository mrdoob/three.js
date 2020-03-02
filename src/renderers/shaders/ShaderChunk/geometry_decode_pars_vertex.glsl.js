export default /* glsl */`
#ifdef USE_PACKED_NORMAL
#if USE_PACKED_NORMAL == 0
    vec3 decodeNormal(vec3 packedNormal)
    {
        float x = packedNormal.x * 2.0 - 1.0;
        float y = packedNormal.y * 2.0 - 1.0;
        vec2 scth = vec2(sin(x * PI), cos(x * PI));
        vec2 scphi = vec2(sqrt(1.0 - y * y), y);
        return normalize( vec3(scth.y * scphi.x, scth.x * scphi.x, scphi.y) );
    }
#endif

#if USE_PACKED_NORMAL == 1
    vec3 decodeNormal(vec3 packedNormal)
    {
        vec3 v = vec3(packedNormal.xy, 1.0 - abs(packedNormal.x) - abs(packedNormal.y));
        if (v.z < 0.0)
        {
            v.xy = (1.0 - abs(v.yx)) * vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
        }
        return normalize(v);
    }
#endif

#if USE_PACKED_NORMAL == 2
    vec3 decodeNormal(vec3 packedNormal)
    {
        vec3 v = (packedNormal * 2.0) - 1.0;
        return normalize(v);
    }
#endif
#endif

#ifdef USE_PACKED_POSITION
#if USE_PACKED_POSITION == 0
    uniform mat4 quantizeMatPos;
#endif
#endif

#ifdef USE_PACKED_UV
#if USE_PACKED_UV == 1
    uniform mat3 quantizeMatUV;
#endif
#endif

#ifdef USE_PACKED_UV
#if USE_PACKED_UV == 0
    vec2 decodeUV(vec2 packedUV)
    {
        vec2 uv = (packedUV * 2.0) - 1.0;
        return uv;
    }
#endif

#if USE_PACKED_UV == 1
    vec2 decodeUV(vec2 packedUV)
    {
        vec2 uv = ( vec3(packedUV, 1.0) * quantizeMatUV ).xy;
        return uv;
    }
#endif
#endif
`;