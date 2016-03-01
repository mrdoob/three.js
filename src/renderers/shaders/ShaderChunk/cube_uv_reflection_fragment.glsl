#ifdef ENVMAP_TYPE_CUBE_UV

int getFaceFromDirection(vec3 direction) {
    vec3 absDirection = abs(direction);
    int face = -1;
    if( absDirection.x > absDirection.z ) {
        if(absDirection.x > absDirection.y )
            face = direction.x > 0.0 ? 0 : 3;
        else
            face = direction.y > 0.0 ? 1 : 4;
    }
    else {
        if(absDirection.z > absDirection.y )
            face = direction.z > 0.0 ? 2 : 5;
        else
            face = direction.y > 0.0 ? 1 : 4;
    }
    return face;
}

vec2 MipLevelInfo( vec3 vec, float textureSize, float roughnessLevel, float roughness ) {
    float s = log2(textureSize*0.25) - 1.0;
    float scale = pow(2.0, s - roughnessLevel);
    float dxRoughness = dFdx(roughness);
    float dyRoughness = dFdy(roughness);
    vec3 dx = dFdx( vec * scale * dxRoughness );
    vec3 dy = dFdy( vec * scale * dyRoughness );
    float d = max( dot( dx, dx ), dot( dy, dy ) );
    // Clamp the value to the max mip level counts. hard coded to 6 mips
    float rangeClamp = pow(2.0, (6.0 - 1.0) * 2.0);
    d = clamp(d, 1.0, rangeClamp);
    float mipLevel = 0.5 * log2(d);
    return vec2(floor(mipLevel), fract(mipLevel));
}

vec2 getCubeUV(vec3 direction, float roughnessLevel, float mipLevel, float textureSize) {
    float maxLods =  log2(textureSize*0.25) - 2.0;
    mipLevel = roughnessLevel > maxLods - 3.0 ? 0.0 : mipLevel;
    float a = 16.0/textureSize;
    float powScale = pow(2.0,roughnessLevel + mipLevel);
    float scale = 1.0/pow(2.0,roughnessLevel + 2.0 + mipLevel);
    float mipOffset = 0.75*(1.0 - 1.0/pow(2.0, mipLevel))/pow(2.0,roughnessLevel);
    bool bRes = mipLevel == 0.0;
    scale =  bRes && (scale < a) ? a : scale;

    vec3 r;
    vec2 offset;
    int face = getFaceFromDirection(direction);

    if( face == 0) {
        r = vec3(direction.x, -direction.z, direction.y);
        offset = vec2(0.0+mipOffset,0.75/powScale);
        offset.y = bRes && (offset.y < 2.0*a) ?  a : offset.y;
    }
    else if( face == 1) {
        r = vec3(direction.y, direction.x, direction.z);
        offset = vec2(scale+mipOffset, 0.75/powScale);
        offset.y = bRes && (offset.y < 2.0*a) ?  a : offset.y;
    }
    else if( face == 2) {
        r = vec3(direction.z, direction.x, direction.y);
        offset = vec2(2.0*scale+mipOffset, 0.75/powScale);
        offset.y = bRes && (offset.y < 2.0*a) ?  a : offset.y;
    }
    else if( face == 3) {
        r = vec3(direction.x, direction.z, direction.y);
        offset = vec2(0.0+mipOffset,0.5/powScale);
        offset.y = bRes && (offset.y < 2.0*a) ?  0.0 : offset.y;
    }
    else if( face == 4) {
        r = vec3(direction.y, direction.x, -direction.z);
        offset = vec2(scale+mipOffset, 0.5/powScale);
        offset.y = bRes && (offset.y < 2.0*a) ?  0.0 : offset.y;
    }
    else {
        r = vec3(direction.z, -direction.x, direction.y);
        offset = vec2(2.0*scale+mipOffset, 0.5/powScale);
        offset.y = bRes && (offset.y < 2.0*a) ?  0.0 : offset.y;
    }
    r = normalize(r);
    float texelOffset = 0.5/textureSize;
    float s1 = (r.y/abs(r.x) + 1.0)*0.5;
    float s2 = (r.z/abs(r.x) + 1.0)*0.5;
    vec2 uv = offset + vec2(s1*scale, s2*scale);
    float min_x = offset.x + texelOffset; float max_x = offset.x + scale - texelOffset;
    float min_y = offset.y + texelOffset;
    float max_y = offset.y + scale - texelOffset;
    float delx = max_x - min_x;
    float dely = max_y - min_y;
    uv.x = min_x + s1*delx;
    uv.y = min_y + s2*dely;
    return uv;
}

vec4 textureCubeUV(vec3 reflectedDirection, float roughness, float textureSize) {
    float maxLods =  log2(textureSize*0.25) - 3.0;
    float roughnessVal = roughness*maxLods;
    float r1 = floor(roughnessVal);
    float r2 = r1 + 1.0;
    float t = fract(roughnessVal);
    vec2 mipInfo = MipLevelInfo(reflectedDirection, textureSize, r1, roughness);
    float s = mipInfo.y;
    float level0 = mipInfo.x;
    float level1 = level0 + 1.0;
    level1 = level1 > 5.0 ? 5.0 : level1;
    // Tri linear interpolation.
    vec2 uv_10 = getCubeUV(reflectedDirection, r1, level0, textureSize);
    vec2 uv_11 = getCubeUV(reflectedDirection, r1, level1, textureSize);
    vec2 uv_20 = getCubeUV(reflectedDirection, r2, level0, textureSize);
    vec2 uv_21 = getCubeUV(reflectedDirection, r2, level1, textureSize);
    vec4 color10 = envMapTexelToLinear(texture2D(envMap, uv_10));
    vec4 color11 = envMapTexelToLinear(texture2D(envMap, uv_11));
    vec4 color20 = envMapTexelToLinear(texture2D(envMap, uv_20));
    vec4 color21 = envMapTexelToLinear(texture2D(envMap, uv_21));
    vec4 c1 = mix(color10 , color11,  s);
    vec4 c2 = mix(color20 , color21,  s);
    vec4 c3 = mix(c1 , c2,  t);
    return vec4(c3.rgb, 1.0);
}

#endif
