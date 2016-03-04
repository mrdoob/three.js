
#ifdef USE_LAYER_TEXTURE_MAPS

    // ***************
    // TEXTURE 2 (special masked texture)
    // ***************
    float mixAmount = 0.5;
    //diffuseColor = layerTexture(diffuseColor, mixAmount, layer2_textureIndex, layer2_textureRepeat, layer2_maskIndex, layer2_maskRepeat, layer2_LookupMode);
    diffuseColor = layerTexture(diffuseColor, mixAmount, layer2_textureIndex, layer2_textureRepeat, layer2_maskIndex, layer2_maskRepeat, layer2_LookupMode);

#endif