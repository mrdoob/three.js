    gl_Position = projectionMatrix * modelViewMatrix * position;

    var_position_es = vec3(modelViewMatrix * position);
    var_normal_es = vec3(modelViewMatrix * vec4(normal, 0.0));
    var_tangent_es = vec3(modelViewMatrix * vec4(tangent, 0.0));

    var_mainUv = uv.xy;
    var_d1Uv = uv.xy;
    var_d2Uv = uv.xy;
