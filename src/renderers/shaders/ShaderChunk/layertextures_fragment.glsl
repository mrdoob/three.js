
#ifdef USE_LAYER_TEXTURE_MAPS

    // ***************
    // TEXTURE 2 (special masked texture)
    // ***************
    float mixAmount = 1.0;
    //diffuseColor = layerTexture(diffuseColor, mixAmount, layer2_textureIndex, layer2_textureRepeat, layer2_maskIndex, layer2_maskRepeat, layer2_LookupMode);

    // diffuseColor - Original Material/Texture Color.
    // mixAmount - How much of the overlay texture to mix.
    // textureIndex - which texture to use as the source.
    // textureRepeat - how much to tile the texture
    // maskIndex - Which texture to use as the mask
    // maskRepeate - How much to tile the mask
    // LookupMode - Supports basic atlas from the texture. Currrently hardcoded to an atlas of 512,
    int texture_index = 1;
    float texture_repeat = 4.0;
    int texture_lookupMode = 0;
    int maskIndex = 1;
    float maskRepeat = 4.0;

    //layerTexture( vec4 color, float mixAmount, int textureIndex,  float repeatTexture,  int maskIndex, float repeatMask, int textureLookupMode)
    diffuseColor = layerTexture(diffuseColor, mixAmount, texture_index, texture_repeat, maskIndex, maskRepeat, texture_lookupMode);

#endif