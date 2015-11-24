from .. import constants, logger
from . import base_classes, utilities, api


class Material(base_classes.BaseNode):
    """Class that wraps material nodes"""
    def __init__(self, node, parent):
        logger.debug("Material().__init__(%s)", node)
        base_classes.BaseNode.__init__(self, node, parent,
                                       constants.MATERIAL)

        self._common_attributes()
        if self[constants.TYPE] == constants.THREE_PHONG:
            self._phong_attributes()

        textures = self.parent.options.get(constants.MAPS)
        if textures:
            self._update_maps()

    def _common_attributes(self):
        """Parse the common material attributes"""
        logger.debug('Material()._common_attributes()')
        dispatch = {
            constants.PHONG: constants.THREE_PHONG,
            constants.LAMBERT: constants.THREE_LAMBERT,
            constants.BASIC: constants.THREE_BASIC
        }
        shader_type = api.material.type(self.node)
        self[constants.TYPE] = dispatch[shader_type]

        diffuse = api.material.diffuse_color(self.node)
        self[constants.COLOR] = utilities.rgb2int(diffuse)

        if self[constants.TYPE] != constants.THREE_BASIC:
            ambient = api.material.ambient_color(self.node)
            self[constants.AMBIENT] = utilities.rgb2int(ambient)

            emissive = api.material.emissive_color(self.node)
            self[constants.EMISSIVE] = utilities.rgb2int(emissive)

        vertex_color = api.material.use_vertex_colors(self.node)
        self[constants.VERTEX_COLORS] = vertex_color

        self[constants.BLENDING] = api.material.blending(self.node)

        if api.material.transparent(self.node):
            self[constants.TRANSPARENT] = True

        if api.material.double_sided(self.node):
            self[constants.SIDE] = constants.SIDE_DOUBLE

        self[constants.DEPTH_TEST] = api.material.depth_test(self.node)

        self[constants.DEPTH_WRITE] = api.material.depth_write(self.node)

    def _phong_attributes(self):
        """Parse phong specific attributes"""
        logger.debug("Material()._phong_attributes()")
        specular = api.material.specular_color(self.node)
        self[constants.SPECULAR] = utilities.rgb2int(specular)
        self[constants.SHININESS] = api.material.specular_coef(self.node)

    def _update_maps(self):
        """Parses maps/textures and updates the textures array
        with any new nodes found.
        """
        logger.debug("Material()._update_maps()")

        mapping = (
            (api.material.diffuse_map, constants.MAP),
            (api.material.specular_map, constants.SPECULAR_MAP),
            (api.material.light_map, constants.LIGHT_MAP)
        )

        for func, key in mapping:
            map_node = func(self.node)
            if map_node:
                logger.info('Found map node %s for %s', map_node, key)
                tex_inst = self.scene.texture(map_node.name)
                self[key] = tex_inst[constants.UUID]

        if self[constants.TYPE] == constants.THREE_PHONG:
            mapping = (
                (api.material.bump_map, constants.BUMP_MAP,
                 constants.BUMP_SCALE, api.material.bump_scale),
                (api.material.normal_map, constants.NORMAL_MAP,
                 constants.NORMAL_SCALE, api.material.normal_scale)
            )

            for func, map_key, scale_key, scale_func in mapping:
                map_node = func(self.node)
                if not map_node: 
                    continue
                logger.info("Found map node %s for %s", map_node, map_key)
                tex_inst = self.scene.texture(map_node.name)
                self[map_key] = tex_inst[constants.UUID]
                self[scale_key] = scale_func(self.node)
