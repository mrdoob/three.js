export default /* glsl */ `

#ifndef STANDARD

vec3 clearCoatNormal = clearCoatGeometryNormals ?
  geometryNormal: // use the unperturbed normal of the geometry
  normal; // Use the (maybe) perturbed normal

#endif
`;
