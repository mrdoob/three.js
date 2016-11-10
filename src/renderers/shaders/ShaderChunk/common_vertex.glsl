#ifdef USE_INSTANCING

    mat4 modelMatrix = getModelMatrix();
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    mat3 normalMatrix = getNormalMatrix();

#endif
