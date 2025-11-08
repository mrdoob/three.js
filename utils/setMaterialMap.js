export function setMaterialMap(material, map) {
    material.map = map;
    material.needsUpdate = true;
    if (map && map.isVideoTexture) {
        map.needsUpdate = true;
    }
}
