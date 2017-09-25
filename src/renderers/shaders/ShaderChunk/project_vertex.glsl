// mat4 viewMatrixEye = isVRPresenting ? (VIEW_ID == 0u ? leftViewMatrix : rightViewMatrix) : viewMatrix;
// mat4 projectionMatrixEye = isVRPresenting ? (VIEW_ID == 0u ? leftProjectionMatrix : rightProjectionMatrix) : projectionMatrix;


mat4 viewMatrixEye = VIEW_ID == 0u ? leftViewMatrix : rightViewMatrix;
mat4 projectionMatrixEye = VIEW_ID == 0u ? leftProjectionMatrix : rightProjectionMatrix;

//viewMatrixEye = leftViewMatrix;
//projectionMatrixEye = leftProjectionMatrix;

viewMatrixEye = rightViewMatrix;
projectionMatrixEye = rightProjectionMatrix;

vec4 mvPosition = viewMatrixEye * modelMatrix * vec4( transformed, 1.0 );

gl_Position = projectionMatrixEye * mvPosition;
