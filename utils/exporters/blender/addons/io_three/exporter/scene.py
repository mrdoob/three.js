import os
from .. import constants, logger
from . import (
    base_classes,
    texture,
    material,
    geometry,
    object as object_,
    utilities,
    io,
    api
)


class Scene(base_classes.BaseScene):
    """Class that handles the contruction of a Three scene"""

    def __init__(self, filepath, options=None):
        logger.debug("Scene().__init__(%s, %s)", filepath, options)
        self._defaults = {
            constants.METADATA: constants.DEFAULT_METADATA.copy(),
            constants.GEOMETRIES: [],
            constants.MATERIALS: [],
            constants.IMAGES: [],
            constants.TEXTURES: []
        }
        base_classes.BaseScene.__init__(self, filepath, options or {})

        source_file = api.scene_name()
        if source_file:
            self[constants.METADATA][constants.SOURCE_FILE] = source_file

    @property
    def valid_types(self):
        """

        :return: list of valid node types

        """
        valid_types = [api.constants.MESH]

        if self.options.get(constants.HIERARCHY, False):
            valid_types.append(api.constants.EMPTY)

        if self.options.get(constants.CAMERAS):
            logger.info("Adding cameras to valid object types")
            valid_types.append(api.constants.CAMERA)

        if self.options.get(constants.LIGHTS):
            logger.info("Adding lights to valid object types")
            valid_types.append(api.constants.LAMP)

        return valid_types

    def geometry(self, value):
        """Find a geometry node that matches either a name
        or uuid value.

        :param value: name or uuid
        :type value: str

        """
        logger.debug("Scene().geometry(%s)", value)
        return _find_node(value, self[constants.GEOMETRIES])

    def image(self, value):
        """Find a image node that matches either a name
        or uuid value.

        :param value: name or uuid
        :type value: str

        """
        logger.debug("Scene().image%s)", value)
        return _find_node(value, self[constants.IMAGES])

    def material(self, value):
        """Find a material node that matches either a name
        or uuid value.

        :param value: name or uuid
        :type value: str

        """
        logger.debug("Scene().material(%s)", value)
        return _find_node(value, self[constants.MATERIALS])

    def parse(self):
        """Execute the parsing of the scene"""
        logger.debug("Scene().parse()")
        if self.options.get(constants.MAPS):
            self._parse_textures()

        if self.options.get(constants.MATERIALS):
            self._parse_materials()

        self._parse_geometries()
        self._parse_objects()

    def texture(self, value):
        """Find a texture node that matches either a name
        or uuid value.

        :param value: name or uuid
        :type value: str

        """
        logger.debug("Scene().texture(%s)", value)
        return _find_node(value, self[constants.TEXTURES])

    def write(self):
        """Write the parsed scene to disk."""
        logger.debug("Scene().write()")
        data = {}

        embed_anim = self.options.get(constants.EMBED_ANIMATION, True)
        embed = self.options.get(constants.EMBED_GEOMETRY, True)

        compression = self.options.get(constants.COMPRESSION)
        extension = constants.EXTENSIONS.get(
            compression,
            constants.EXTENSIONS[constants.JSON])

        export_dir = os.path.dirname(self.filepath)
        for key, value in self.items():

            if key == constants.GEOMETRIES:
                geometries = []
                for geom in value:

                    if not embed_anim:
                        geom.write_animation(export_dir)

                    geom_data = geom.copy()
                    if embed:
                        geometries.append(geom_data)
                        continue

                    geo_type = geom_data[constants.TYPE].lower()
                    if geo_type == constants.GEOMETRY.lower():
                        geom_data.pop(constants.DATA)
                    elif geo_type == constants.BUFFER_GEOMETRY.lower():
                        geom_data.pop(constants.ATTRIBUTES)
                        geom_data.pop(constants.METADATA)

                    url = 'geometry.%s%s' % (geom.node, extension)
                    geometry_file = os.path.join(export_dir, url)

                    geom.write(filepath=geometry_file)
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
            texture_folder = self.options.get(constants.TEXTURE_FOLDER)
            for geo in self[constants.GEOMETRIES]:
                logger.info("Copying textures from %s", geo.node)
                geo.copy_textures(texture_folder)

    def _parse_geometries(self):
        """Locate all geometry nodes and parse them"""
        logger.debug("Scene()._parse_geometries()")

        # this is an important step. please refer to the doc string
        # on the function for more information
        api.object.prep_meshes(self.options)
        geometries = []

        # now iterate over all the extracted mesh nodes and parse each one
        for mesh in api.object.extracted_meshes():
            logger.info("Parsing geometry %s", mesh)
            geo = geometry.Geometry(mesh, self)
            geo.parse()
            geometries.append(geo)

        logger.info("Added %d geometry nodes", len(geometries))
        self[constants.GEOMETRIES] = geometries

    def _parse_materials(self):
        """Locate all non-orphaned materials and parse them"""
        logger.debug("Scene()._parse_materials()")
        materials = []

        for material_name in api.material.used_materials():
            logger.info("Parsing material %s", material_name)
            materials.append(material.Material(material_name, parent=self))

        logger.info("Added %d material nodes", len(materials))
        self[constants.MATERIALS] = materials

    def _parse_objects(self):
        """Locate all valid objects in the scene and parse them"""
        logger.debug("Scene()._parse_objects()")
        try:
            scene_name = self[constants.METADATA][constants.SOURCE_FILE]
        except KeyError:
            scene_name = constants.SCENE
        self[constants.OBJECT] = object_.Object(None, parent=self)
        self[constants.OBJECT][constants.TYPE] = constants.SCENE.title()
        self[constants.UUID] = utilities.id_from_name(scene_name)

        objects = []
        if self.options.get(constants.HIERARCHY, False):
            nodes = api.object.assemblies(self.valid_types, self.options)
        else:
            nodes = api.object.nodes(self.valid_types, self.options)

        for node in nodes:
            logger.info("Parsing object %s", node)
            obj = object_.Object(node, parent=self[constants.OBJECT])
            objects.append(obj)

        logger.info("Added %d object nodes", len(objects))
        self[constants.OBJECT][constants.CHILDREN] = objects

    def _parse_textures(self):
        """Locate all non-orphaned textures and parse them"""
        logger.debug("Scene()._parse_textures()")
        textures = []

        for texture_name in api.texture.textures():
            logger.info("Parsing texture %s", texture_name)
            tex_inst = texture.Texture(texture_name, self)
            textures.append(tex_inst)

        logger.info("Added %d texture nodes", len(textures))
        self[constants.TEXTURES] = textures


def _find_node(value, manifest):
    """Find a node that matches either a name
    or uuid value.

    :param value: name or uuid
    :param manifest: manifest of nodes to search
    :type value: str
    :type manifest: list

    """
    for index in manifest:
        uuid = index.get(constants.UUID) == value
        name = index.node == value
        if uuid or name:
            return index
    else:
        logger.debug("No matching node for %s", value)

