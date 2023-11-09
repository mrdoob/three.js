export default /* glsl */`
#ifdef USE_OCCLUSION
    uniform sampler2DArray depthColor;
    uniform float depthWidth;
    uniform float depthHeight;

    float Depth_GetCameraDepthInMeters(const sampler2DArray depthTexture,
        const vec2 depthUv, int arrayIndex) {
        return texture(depthColor, vec3(depthUv.x, depthUv.y, arrayIndex)).r;
      }

    float Depth_GetOcclusion(const sampler2DArray depthTexture, const vec2 depthUv, float assetDepthM, int arrayIndex) {
        float depthMm = Depth_GetCameraDepthInMeters(depthTexture, depthUv, arrayIndex);

        // Instead of a hard z-buffer test, allow the asset to fade into the
        // background along a 2 * kDepthTolerancePerM * assetDepthM
        // range centered on the background depth.
        const float kDepthTolerancePerM = 0.001;
        return clamp(1.0 -
            0.5 * (depthMm - assetDepthM) /
                (kDepthTolerancePerM * assetDepthM) +
            0.5, 0.0, 1.0);
    }

    float Depth_GetBlurredOcclusionAroundUV(const sampler2DArray depthTexture, const vec2 uv, float assetDepthM, int arrayIndex) {
    // Kernel used:
    // 0   4   7   4   0
    // 4   16  26  16  4
    // 7   26  41  26  7
    // 4   16  26  16  4
    // 0   4   7   4   0
    const float kKernelTotalWeights = 269.0;
    float sum = 0.0;

    const float kOcclusionBlurAmount = 0.0005;
    vec2 blurriness =
    vec2(kOcclusionBlurAmount, kOcclusionBlurAmount /** u_DepthAspectRatio*/);

    float current = 0.0;

    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, -2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, -2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, +2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, +2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-2.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+2.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-2.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+2.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 4.0;

    current = 0.0;
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-2.0, -0.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+2.0, +0.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+0.0, +2.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-0.0, -2.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 7.0;

    current = 0.0;
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 16.0;

    current = 0.0;
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+0.0, +1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-0.0, -1.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(-1.0, -0.0) * blurriness, assetDepthM, arrayIndex);
    current += Depth_GetOcclusion(
    depthTexture, uv + vec2(+1.0, +0.0) * blurriness, assetDepthM, arrayIndex);
    sum += current * 26.0;

    sum += Depth_GetOcclusion(depthTexture, uv, assetDepthM, arrayIndex) * 41.0;

    return sum / kKernelTotalWeights;
    }
#endif
`;
