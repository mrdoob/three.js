import os
from .. import constants, logger
from . import (
    base_classes,
    texture,
    material,
    geometry, 
    object,
    io,
    api
)


class Scene(base_classes.BaseScene):
    _defaults = {
        constants.METADATA: constants.DEFAULT_METADATA.copy(),
        constants.GEOMETRIES: [],
        constants.MATERIALS: [],
        constants.IMAGES: [],
        constants.TEXTURES: []
    }

    def __init__(self, filepath, options=None):
        logger.debug('Scene().__init__(%s, %s)', filepath, options)
        base_classes.BaseScene.__init__(self, filepath, options or {})

        source_file = api.scene_name()
        if source_file:
            self[constants.METADATA][constants.SOURCE_FILE] = source_file

    @property
    def valid_types(self):
        valid_types = [api.constants.MESH]

        if self.options.get(constants.CAMERAS):
            logger.info('Adding cameras to valid object types') 
            valid_types.append(api.constants.CAMERA)

        if self.options.get(constants.LIGHTS):
            logger.info('Adding lights to valid object types') 
            valid_types.append(api.constants.LAMP)

        return valid_types

    def geometry(self, arg):
        logger.debug('Scene().geometry(%s)', arg)
        return self._find_node(arg, self[constants.GEOMETRIES])

    def image(self, arg):
        logger.debug('Scene().image%s)', arg)
        return self._find_node(arg, self[constants.IMAGES])

    def material(self, arg):
        logger.debug('Scene().material(%s)', arg)
        return self._find_node(arg, self[constants.MATERIALS])

    def parse(self):
        logger.debug('Scene().parse()')
        if self.options.get(constants.MAPS):
            self.__parse_textures()

        if self.options.get(constants.MATERIALS):
            self.__parse_materials()

        self.__parse_geometries()
        self.__parse_objects()

    def texture(self, arg):
        logger.debug('Scene().texture(%s)', arg)
        return self._find_node(arg, self[constants.TEXTURES])

    def write(self):
        logger.debug('Scene().write()')
        data = {}
        
        embed_anim = self.options.get(constants.EMBED_ANIMATION, True)
        embed = self.options[constants.EMBED_GEOMETRY]

        compression = self.options.get(constants.COMPRESSION)
        extension = constants.EXTENSIONS.get(compression, 
            constants.EXTENSIONS[constants.JSON])

        export_dir = os.path.dirname(self.filepath)
        for key, value in self.items():
            
            if key == constants.GEOMETRIES:
                geometries = []
                for geometry in value:

                    if not embed_anim:
                        geometry.write_animation(export_dir)

                    if embed:
                        for each in value:
                            geometries.append(each.copy())
                        continue

                    geom_data = geometry.copy()

                    geo_type = geom_data[constants.TYPE].lower()
                    if geo_type == constants.GEOMETRY.lower():
                        geom_data.pop(constants.DATA)
                    elif geo_type == constants.BUFFER_GEOMETRY.lower():
                        geom_data.pop(constants.ATTRIBUTES)
                        geom_data.pop(constants.METADATA)

                    url = 'geometry.%s%s' % (geometry.node, extension)
                    geometry_file = os.path.join(export_dir, url)

                    geometry.write(filepath=geometry_file)
                    geom_data[constants.URL] = os.path.basename(url)

                    geometries.append(geom_data)

                data[key] = geometries
            elif isinstance(value, list):
                data[key] = []
                for each in value:
                    data[key].append(each.copy())
            elif isinstance(value, dict):
                data[key] = value.copy()

        io.dump(self.filepath, data, options=self.options)

        if self.options.get(constants.COPY_TEXTURES):
            for geo in self[constants.GEOMETRIES]:
                logger.info('Copying textures from %s', geo.node)
                geo.copy_textures()

    def _find_node(self, arg, manifest):
        for index in manifest:
            uuid = index.get(constants.UUID) == arg
            name = index.node == arg
            if uuid or name:
                return index
        else:
            logger.debug('No matching node for %s', arg)

    def __parse_geometries(self):
        logger.debug('Scene().__parse_geometries()')

        # this is an important step. please refer to the doc string
        # on the function for more information
        api.object.prep_meshes(self.options)
        geometries = []

        # now iterate over all the extracted mesh nodes and parse each one
        for mesh in api.object.extracted_meshes():
            logger.info('Parsing geometry %s', mesh)
            geo = geometry.Geometry(mesh, self)
            geo.parse()
            geometries.append(geo)

        logger.info('Added %d geometry nodes', len(geometries))
        self[constants.GEOMETRIES] = geometries

    def __parse_materials(self):
        logger.debug('Scene().__parse_materials()')
        materials = []

        for material_name in api.material.used_materials():
            logger.info('Parsing material %s', material_name)
            materials.append(material.Material(material_name, parent=self)) 

        logger.info('Added %d material nodes', len(materials))
        self[constants.MATERIALS] = materials

    def __parse_objects(self): 
        logger.debug('Scene().__parse_objects()')
        self[constants.OBJECT] = object.Object(None, parent=self)
        self[constants.OBJECT][constants.TYPE] = constants.SCENE.title()

        objects = [] 
        for node in api.object.nodes(self.valid_types, self.options):
            logger.info('Parsing object %s', node)
            obj = object.Object(node, parent=self[constants.OBJECT])
            objects.append(obj)

        logger.info('Added %d object nodes', len(objects))
        self[constants.OBJECT][constants.CHILDREN] = objects

    def __parse_textures(self):
        logger.debug('Scene().__parse_textures()')
        textures = []

        for texture_name in api.texture.textures():
            logger.info('Parsing texture %s', texture_name)
            tex_inst = texture.Texture(texture_name, self)
            textures.append(tex_inst)

        logger.info('Added %d texture nodes', len(textures))
        self[constants.TEXTURES] = textures
