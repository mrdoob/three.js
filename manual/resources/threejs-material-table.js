const materials = [
  {
    name: 'MeshBasicMaterial',
    shortName: 'Basic',
    properties: [
      'alphaMap',
      'aoMap',
      'aoMapIntensity',
      'color',
      'combine',
      'envMap',
      'lightMap',
      'lightMapIntensity',
      'map',
      'reflectivity',
      'refractionRatio',
      'specularMap',
      'wireframe',
    ],
  },
  {
    name: 'MeshLambertMaterial',
    shortName: 'Lambert',
    properties: [
      'alphaMap',
      'aoMap',
      'aoMapIntensity',
      'color',
      'combine',
      'emissive',
      'emissiveMap',
      'emissiveIntensity',
      'envMap',
      'lightMap',
      'lightMapIntensity',
      'map',
      'reflectivity',
      'refractionRatio',
      'specularMap',
      'wireframe',
    ],
  },
  {
    name: 'MeshPhongMaterial',
    shortName: 'Phong',
    properties: [
      'alphaMap',
      'aoMap',
      'aoMapIntensity',
      'bumpMap',
      'bumpScale',
      'color',
      'combine',
      'displacementMap',
      'displacementScale',
      'displacementBias',
      'emissive',
      'emissiveMap',
      'emissiveIntensity',
      'envMap',
      'lightMap',
      'lightMapIntensity',
      'map',
      'normalMap',
      'normalMapType',
      'normalScale',
      'reflectivity',
      'refractionRatio',
      'shininess',
      'specular',
      'specularMap',
      'wireframe',
    ],
  },
  {
    name: 'MeshStandardMaterial',
    shortName: 'Standard',
    properties: [
      'alphaMap',
      'aoMap',
      'aoMapIntensity',
      'bumpMap',
      'bumpScale',
      'color',
      'displacementMap',
      'displacementScale',
      'displacementBias',
      'emissive',
      'emissiveMap',
      'emissiveIntensity',
      'envMap',
      'envMapIntensity',
      'lightMap',
      'lightMapIntensity',
      'map',
      'metalness',
      'metalnessMap',
      'normalMap',
      'normalMapType',
      'normalScale',
      'refractionRatio',
      'roughness',
      'roughnessMap',
      'wireframe',
    ],
  },
  {
    name: 'MeshPhysicalMaterial',
    shortName: 'Physical',
    properties: [
      'alphaMap',
      'aoMap',
      'aoMapIntensity',
      'bumpMap',
      'bumpScale',
      'color',
      'displacementMap',
      'displacementScale',
      'displacementBias',
      'emissive',
      'emissiveMap',
      'emissiveIntensity',
      'envMap',
      'envMapIntensity',
      'lightMap',
      'lightMapIntensity',
      'map',
      'metalness',
      'metalnessMap',
      'normalMap',
      'normalMapType',
      'normalScale',
      'refractionRatio',
      'roughness',
      'roughnessMap',
      'wireframe',
      'clearcoat',
      'clearcoatRoughness',
      'reflectivity',
    ],
  },
];

const allProperties = {};
materials.forEach((material) => {
  material.properties.forEach((property) => {
    allProperties[property] = true;
  });
});

function addElem(type, parent, content) {
  const elem = document.createElement(type);
  if (content) {
    elem.textContent = content;
  }
  if (parent) {
    parent.appendChild(elem);
  }
  return elem;
}

const table = document.createElement('table');
const thead = addElem('thead', table);
{
  addElem('td', thead);
  materials.forEach((material) => {
    const td = addElem('td', thead);
    const a = addElem('a', td, material.shortName);
    a.href = `https://threejs.org/docs/#api/materials/${material.name}`;
  });
}
Object.keys(allProperties).sort().forEach((property) => {
  const tr = addElem('tr', table);
  addElem('td', tr, property);
  materials.forEach((material) => {
    const hasProperty = material.properties.indexOf(property) >= 0;
    const td = addElem('td', tr);
    const a = addElem('a', td, hasProperty ? '•' : '');
    a.href = `https://threejs.org/docs/#api/materials/${material.name}.${property}`;
  });
});
document.querySelector('#material-table').appendChild(table);
