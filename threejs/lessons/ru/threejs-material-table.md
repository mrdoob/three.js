Title: Таблица характеристик материалов
Description: Таблица, показывающая, какие функции поддерживают каждый из материалов

Наиболее распространенными материалами в three.js являются материалы 
Mesh. Вот таблица, показывающая, какие функции поддерживают каждый из материалов.

<div>
<div id="material-table" class="threejs_center"></div>
<script>
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
      'refactionRatio',
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
      'refactionRatio',
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
      'refactionRatio',
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
      'evnMapIntensity',
      'lightMap',
      'lightMapIntensity',
      'map',
      'metalness',
      'metalnessMap',
      'normalMap',
      'normalMapType',
      'normalScale',
      'refactionRatio',
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
      'evnMapIntensity',
      'lightMap',
      'lightMapIntensity',
      'map',
      'metalness',
      'metalnessMap',
      'normalMap',
      'normalMapType',
      'normalScale',
      'refactionRatio',
      'roughness',
      'roughnessMap',
      'wireframe',
      'clearCoat',
      'clearCoatRoughness',
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
</script>
<style>
#material-table {
  font-family: monospace;
  display: flex;
  justify-content: center;
}
#material-table tr:nth-child(even) {
    background: #def;
}
#material-table thead>td {
    vertical-align: bottom;
    padding: .5em;
}
#material-table thead>td>a {
    text-orientation: upright;
    writing-mode: vertical-lr;
    text-decoration: none;
    display: block;
    letter-spacing: -2px;
}
#material-table table {
    border-collapse: collapse;
    background: #cde;
}
#material-table td:nth-child(1) {
    text-align: right;
}
#material-table td {
    border: 1px solid black;
    padding: .1em .5em .1em .5em;
}
#material-table td {
  border: 1px solid black;
}
@media (max-width: 500px) {
  #material-table {
    font-size: small;
  }
  #material-table thead>td {
      vertical-align: bottom;
      padding: .5em 0 .5em 0;
  }
}
</style>
</div>

<!--
```
phong
  normalScale: 1,1 (0-1)
  reflectivity: 0.5 (0-1)
  refactionRatio: ???




  MeshStandardMaterial
  alphaMap: green channel
  aoMap  (needs UV map, red channel)
  aoMapIntensity: 1
  bumpMap
  bumpScale: 1
  color
  displacementMap
  displacementScale
  displacementBias
  emissive
  emissiveMap
  emissiveIntensity: 1
  envMap
  evnMapIntensity: 1
  lightMap (needs map)
  lightMapIntensity: 1
  map
  metalness: 0.5 (0-1)
  metalnessMap: (blue)
  normalMap
  normalMapType:  THREE.TangentSpaceNormalMap (default), and
                  THREE.ObjectSpaceNormalMap.
  normalScale: 1,1 (0-1)
  refactionRatio: ???
  roughness: 0.5 (0-1)
  roughnessMap: (green)
   wireframe
```
-->