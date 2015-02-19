from .. import constants, logger
from . import base_classes, api


class Object(base_classes.BaseNode):
    """Class that wraps an object node"""
    def __init__(self, node, parent=None, type=None):
        logger.debug("Object().__init__(%s)", node)
        base_classes.BaseNode.__init__(self, node, parent=parent, type=type)

        if self.node:
            self._node_setup()
        else:
            self._root_setup()

    def _init_camera(self):
        """Initialize camera attributes"""
        logger.debug("Object()._init_camera()")
        self[constants.FAR] = api.camera.far(self.node)
        self[constants.NEAR] = api.camera.near(self.node)

        if self[constants.TYPE] == constants.PERSPECTIVE_CAMERA:
            self[constants.ASPECT] = api.camera.aspect(self.node)
            self[constants.FOV] = api.camera.fov(self.node)
        elif self[constants.TYPE] == constants.ORTHOGRAPHIC_CAMERA:
            self[constants.LEFT] = api.camera.left(self.node)
            self[constants.RIGHT] = api.camera.right(self.node)
            self[constants.TOP] = api.camera.top(self.node)
            self[constants.BOTTOM] = api.camera.bottom(self.node)

    #@TODO: need more light attributes. Some may have to come from
    #       custom blender attributes.
    def _init_light(self):
        """Initialize light attributes"""
        logger.debug("Object()._init_light()")
        self[constants.COLOR] = api.light.color(self.node)
        self[constants.INTENSITY] = api.light.intensity(self.node)

        if self[constants.TYPE] != constants.DIRECTIONAL_LIGHT:
            self[constants.DISTANCE] = api.light.distance(self.node)

        if self[constants.TYPE] == constants.SPOT_LIGHT:
            self[constants.ANGLE] = api.light.angle(self.node)

    def _init_mesh(self):
        """Initialize mesh attributes"""
        logger.debug("Object()._init_mesh()")
        mesh = api.object.mesh(self.node, self.options)
        node = self.scene.geometry(mesh)
        if node:
            self[constants.GEOMETRY] = node[constants.UUID]
        else:
            msg = "Could not find Geometry() node for %s"
            logger.error(msg, self.node)

    def _node_setup(self):
        """Parse common node attributes of all objects"""
        logger.debug("Object()._node_setup()")
        self[constants.NAME] = api.object.name(self.node)

        self[constants.POSITION] = api.object.position(
            self.node, self.options)

        self[constants.ROTATION] = api.object.rotation(
            self.node, self.options)

        self[constants.SCALE] = api.object.scale(
            self.node, self.options)

        self[constants.VISIBLE] = api.object.visible(self.node)

        self[constants.TYPE] = api.object.node_type(self.node)

        if self.options.get(constants.MATERIALS):
            logger.info("Parsing materials for %s", self.node)
            material_name = api.object.material(self.node)
            if material_name:
                logger.info("Material found %s", material_name)
                material_inst = self.scene.material(material_name)
                self[constants.MATERIAL] = material_inst[constants.UUID]
            else:
                logger.info("%s has no materials", self.node)

        casts_shadow = (constants.MESH,
                        constants.DIRECTIONAL_LIGHT,
                        constants.SPOT_LIGHT)

        if self[constants.TYPE] in casts_shadow:
            logger.info("Querying shadow casting for %s", self.node)
            self[constants.CAST_SHADOW] = \
                api.object.cast_shadow(self.node)

        if self[constants.TYPE] == constants.MESH:
            logger.info("Querying shadow receive for %s", self.node)
            self[constants.RECEIVE_SHADOW] = \
                api.object.receive_shadow(self.node)

        camera = (constants.PERSPECTIVE_CAMERA,
                  constants.ORTHOGRAPHIC_CAMERA)

        lights = (constants.AMBIENT_LIGHT,
                  constants.DIRECTIONAL_LIGHT,
                  constants.AREA_LIGHT, constants.POINT_LIGHT,
                  constants.SPOT_LIGHT, constants.HEMISPHERE_LIGHT)

        if self[constants.TYPE] == constants.MESH:
            self._init_mesh()
        elif self[constants.TYPE] in camera:
            self._init_camera()
        elif self[constants.TYPE] in lights:
            self._init_light()

        #for child in api.object.children(self.node, self.scene.valid_types):
        #    if not self.get(constants.CHILDREN):
        #        self[constants.CHILDREN] = [Object(child, parent=self)]
        #    else:
        #        self[constants.CHILDREN].append(Object(child, parent=self))

    def _root_setup(self):
        """Applies to a root/scene object"""
        logger.debug("Object()._root_setup()")
        self[constants.MATRIX] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                                  1, 0, 0, 0, 0, 1]
