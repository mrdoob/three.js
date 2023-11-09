export default /* glsl */`
#ifdef USE_OCCLUSION
    if (gl_FragColor.a > 0.0) {
        int arrayIndex = 0;
        vec2 depthUv;
        if (gl_FragCoord.x>=depthWidth) {
            arrayIndex = 1;
            depthUv = vec2((gl_FragCoord.x-depthWidth)/depthWidth, gl_FragCoord.y/depthHeight);
        } else {
            depthUv = vec2(gl_FragCoord.x/depthWidth, gl_FragCoord.y/depthHeight);
        }
        float assetDepthM = gl_FragCoord.z;
        
        //float occlusion = Depth_GetOcclusion(depthColor, depthUv, assetDepthM, arrayIndex);
        float occlusion = Depth_GetBlurredOcclusionAroundUV(depthColor, depthUv, assetDepthM, arrayIndex);

        gl_FragColor *= 1.0 - occlusion;
    }
#endif
`;
