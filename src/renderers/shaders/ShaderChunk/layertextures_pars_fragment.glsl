
#ifdef USE_LAYER_TEXTURE_MAPS
    // Material.parameters.layerTextureMaps

    // Supports pulling texture from an image with tiled textures. 0 - normal, 1..4 = top left, top right, bottom left, bottom right; Lookup points.
    uniform int layer1_LookupMode;
    uniform int layer2_LookupMode;
    uniform int layer3_LookupMode;
    uniform int layer4_LookupMode;
    uniform int layer5_LookupMode;
    uniform int layer6_LookupMode;

    // TEXTURE TO LOAD INTO LAYER
    uniform int layer1_textureIndex;
    uniform int layer2_textureIndex;
    uniform int layer3_textureIndex;
    uniform int layer4_textureIndex;
    uniform int layer5_textureIndex;
    uniform int layer6_textureIndex;

    // MASK TO USE FOR LAYER
    uniform int layer1_maskIndex;
    uniform int layer2_maskIndex;
    uniform int layer3_maskIndex;
    uniform int layer4_maskIndex;
    uniform int layer5_maskIndex;
    uniform int layer6_maskIndex;

    // LAYER REPEAT VALUES FOR TEXTURES.
    uniform float layer1_textureRepeat;
    uniform float layer2_textureRepeat;
    uniform float layer3_textureRepeat;
    uniform float layer4_textureRepeat;
    uniform float layer5_textureRepeat;
    uniform float layer6_textureRepeat;

    // LAYER REPEAT VALUES FOR MASKS.
    uniform float layer1_maskRepeat;
    uniform float layer2_maskRepeat;
    uniform float layer3_maskRepeat;
    uniform float layer4_maskRepeat;
    uniform float layer5_maskRepeat;
    uniform float layer6_maskRepeat;

    // *********************
    // MASKS
    // *********************
    uniform sampler2D layerMask1;
    uniform float layerMask1_Loaded;

    uniform sampler2D layerMask2;
    uniform float layerMask2_Loaded;

    // *********************
    // Texture 1
    // *********************
    uniform sampler2D layerTexture1;
    uniform float layerTexture1_Loaded;

    // *********************
    // Texture 2
    // *********************
    uniform sampler2D layerTexture2;
    uniform float layerTexture2_Loaded;

    // *********************
    // Texture 3
    // *********************
    uniform sampler2D layerTexture3;
    uniform float layerTexture3_Loaded;

    // *********************
    // Texture 4
    // *********************
    uniform sampler2D layerTexture4;
    uniform float layerTexture4_Loaded;

    // *********************
    // Texture 5
    // *********************
    uniform sampler2D layerTexture5;
    uniform float layerTexture5_Loaded;

    // *********************
    // Texture 6
    // *********************
    uniform sampler2D layerTexture6;
    uniform float layerTexture6_Loaded;

    // Look up texture based on UV and if texture has multiple tiles.
    vec4 textureLookup(vec2 vUv, sampler2D texture, int quadrant){

        if(quadrant == 0)
        {
            return texture2D(texture, vUv);
        }else{

            // texturePack is 1024
            vec2 offset = vec2 (0.0,0.5);
            if(quadrant == 2)
            {
                offset = vec2 (0.5,0.5);
            }
            if(quadrant == 3)
            {
                offset = vec2 (0.5,0.0);
            }
            if(quadrant == 4)
            {
                offset = vec2 (0.0,0.0);
            }
            vec2 texSize = normalize(vec2(512.0,512.0));

            // Step 1 - Modulus or rather tile.
            // Step 2 - my texture is twice the size.
            // Step 3 - My texture has 4 textures, set the offset.

            vUv = mod(vUv,texSize);
            //vUv /= 2.0;
            //vUv += offset;
            vUv = offset + texSize * fract(vUv);
            // image 1024 x 1024

            return texture2D(texture, vUv);
        }
    }
    float isTextureLoaded( int textureIndex){
        float loaded = 0.0;
        if(textureIndex == 1)
        {
           loaded = layerTexture1_Loaded;
        }

        if(textureIndex == 2)
        {
           loaded = layerTexture2_Loaded;
        }

        if(textureIndex == 3)
        {
            loaded = layerTexture3_Loaded;
        }

        if(textureIndex == 4)
        {
            loaded = layerTexture4_Loaded;
        }

        if(textureIndex == 5)
        {
            loaded = layerTexture5_Loaded;
        }

        if(textureIndex == 6)
        {
            loaded = layerTexture6_Loaded;
        }

        return loaded;
    }

    float isMaskLoaded( int maskIndex){
        float loaded = 0.0;
        if(maskIndex == 1)
        {
           loaded = layerMask1_Loaded;
        }

        if(maskIndex == 2)
        {
           loaded = layerMask1_Loaded;
        }

        if(maskIndex == 3)
        {
            loaded = layerMask1_Loaded;
        }

        if(maskIndex == 4)
        {
            loaded = layerMask2_Loaded;
        }

        if(maskIndex == 5)
        {
            loaded = layerMask2_Loaded;
        }

        if(maskIndex == 6)
        {
            loaded = layerMask2_Loaded;
        }

        return loaded;
    }

    // Masks texture.
    vec4 layerTexture( vec4 color, float mixAmount, int textureIndex,  float repeatTexture,  int maskIndex, float repeatMask, int textureLookupMode)
    {

        //
        // GET TEXTURE AND CLAMP IF NOT LOADED
        //
        vec4 map = vec4(0.0,0.0,0.0,1.0);
        if(textureIndex == 1)
        {
           map = textureLookup(vUv * repeatTexture, layerTexture1, textureLookupMode);
        }
        if(textureIndex == 2)
        {
            map = textureLookup(vUv * repeatTexture, layerTexture2, textureLookupMode);
        }
        if(textureIndex == 3)
        {
            map = textureLookup(vUv * repeatTexture, layerTexture3, textureLookupMode);
        }
        if(textureIndex == 4)
        {
            map = textureLookup(vUv * repeatTexture, layerTexture4, textureLookupMode);
        }
        if(textureIndex == 5)
        {
            map = textureLookup(vUv * repeatTexture, layerTexture5, textureLookupMode);
        }
        if(textureIndex == 6)
        {
            map = textureLookup(vUv * repeatTexture, layerTexture6, textureLookupMode);
        }
        float textureLoaded = isTextureLoaded(textureIndex);
        map = clamp(map+vec4(textureLoaded), 0.0, 1.0);


        //
        // GET MASK AND CLAMP IF NOT LOADED
        //
        vec3 mask = vec3(0.0,0.0,0.0);//texture2D(maskTexture, vUv * repeatMask).rgb;
        vec3 maskColor = vec3(0.0);
        float maskLoaded = 1.0;
        if(maskIndex == 1)
        {
           mask = textureLookup(vUv * repeatMask, layerMask1, 0).rgb;
           maskColor = vec3(1.0,0.0,0.0);
           maskLoaded = layerMask1_Loaded;
        }

        if(maskIndex == 2)
        {
            mask = textureLookup(vUv * repeatMask, layerMask1, 0).rgb;
            maskColor = vec3(0.0,1.0,0.0);
            maskLoaded = layerMask1_Loaded;
        }

        if(maskIndex == 3)
        {
            mask = textureLookup(vUv * repeatMask, layerMask1, 0).rgb;
            maskColor = vec3(0.0,0.0,1.0);
            maskLoaded = layerMask1_Loaded;
        }

        if(maskIndex == 4)
        {
            mask = textureLookup(vUv * repeatMask, layerMask2, 0).rgb;
            maskColor = vec3(1.0,0.0,0.0);
            maskLoaded = layerMask2_Loaded;
        }

        if(maskIndex == 5)
        {
            mask = textureLookup(vUv * repeatMask, layerMask2, 0).rgb;
            maskColor = vec3(0.0,1.0,0.0);
            maskLoaded = layerMask2_Loaded;
        }

        if(maskIndex == 6)
        {
            mask = textureLookup(vUv * repeatMask, layerMask2, 0).rgb;
            maskColor = vec3(0.0,0.0,1.0);
            maskLoaded = layerMask2_Loaded;
        }

        mask = clamp(mask, vec3(0.0), maskColor);                   // THRESHOLD
        mask = clamp(mask+maskLoaded, 0.0, 1.0);                    // UNLOADED == VISIBLE

        //
        // CONVERT MASK VALUE TO BLACK AND WHITE
        //
        float maskValue = (dot(mask,vec3(1.0)));
        maskValue = smoothstep(0.2,1.0,maskValue); // 0.0 if x < edge; step(edge,x); ++ Smoothing.
        vec4 finalMask = vec4(vec3(maskValue),1.0);

        //
        // MIX EXISTING COLOUR WITH TEXTURE COLOUR.
        //
        // for Mixing; 0 = color 1 = texture;
        // Given unloaded mask = 1.0
        // Given unloaded map = 1.0
        // if textureLoaded.x == 1. then mixAmount should be 0. ... mixAmount = clamp(mixAmount - textureLoaded.x,0,1)
        mixAmount = clamp(mixAmount - textureLoaded,0.0,1.0);
        color = mix(color,map, (maskValue * mixAmount)); // maskValue was mask.x

        //
        return color;
        //return mix(color, texture2D(layerTexture1, vUv), mixAmount);

    }

#endif