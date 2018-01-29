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

    @property
    def data(self):
        """

        :return: returns the data block of the node

        """
        return api.data(self.node)


    def _init_camera(self):
        """Initialize camera attributes"""
        logger.debug("Object()._init_camera()")
        self[constants.FAR] = api.camera.far(self.data)
        self[constants.NEAR] = api.camera.near(self.data)

        if self[constants.TYPE] == constants.PERSPECTIVE_CAMERA:
            self[constants.ASPECT] = api.camera.aspect(self.data)
            self[constants.FOV] = api.camera.fov(self.data)
        elif self[constants.TYPE] == constants.ORTHOGRAPHIC_CAMERA:
            self[constants.LEFT] = api.camera.left(self.data)
            self[constants.RIGHT] = api.camera.right(self.data)
            self[constants.TOP] = api.camera.top(self.data)
            self[constants.BOTTOM] = api.camera.bottom(self.data)

    #@TODO: need more light attributes. Some may have to come from
    #       custom blender attributes.
    def _init_light(self):
        """Initialize light attributes"""
        logger.debug("Object()._init_light()")
        self[constants.COLOR] = api.light.color(self.data)
        self[constants.INTENSITY] = api.light.intensity(self.data)

        # Commented out because Blender's distance is not a cutoff value.
        #if self[constants.TYPE] != constants.DIRECTIONAL_LIGHT:
        #    self[constants.DISTANCE] = api.light.distance(self.data)
        self[constants.DISTANCE] = 0;

        lightType = self[constants.TYPE]

        # TODO (abelnation): handle Area lights
        if lightType == constants.SPOT_LIGHT:
            self[constants.ANGLE] = api.light.angle(self.data)
            self[constants.DECAY] = api.light.falloff(self.data)
        elif lightType == constants.POINT_LIGHT:
            self[constants.DECAY] = api.light.falloff(self.data)

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

        transform = api.object.matrix(self.node, self.options)
        matrix = []
        for col in range(0, 4):
            for row in range(0, 4):
                matrix.append(transform[row][col])

        self[constants.MATRIX] = matrix

        self[constants.VISIBLE] = api.object.visible(self.node)

        self[constants.TYPE] = api.object.node_type(self.node)

        if self.options.get(constants.MATERIALS):
            logger.info("Parsing materials for %s", self.node)


            material_names = api.object.material(self.node) #manthrax: changes for multimaterial start here
            if material_names:

                logger.info("Got material names for this object:%s",str(material_names));

                materialArray = [self.scene.material(objname)[constants.UUID] for objname in material_names]
                if len(materialArray) == 0:  # If no materials.. dont export a material entry
                    materialArray = None
                elif len(materialArray) == 1: # If only one material, export material UUID singly, not as array
                    materialArray = materialArray[0]
                # else export array of material uuids
                self[constants.MATERIAL] = materialArray

                logger.info("Materials:%s",str(self[constants.MATERIAL]));
            else:
                logger.info("%s has no materials", self.node) #manthrax: end multimaterial

        # TODO (abelnation): handle Area lights
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

        # TODO (abelnation): handle Area lights
        lights = (constants.AMBIENT_LIGHT,
                  constants.DIRECTIONAL_LIGHT,
                  constants.POINT_LIGHT,
                  constants.SPOT_LIGHT, constants.HEMISPHERE_LIGHT)

        if self[constants.TYPE] == constants.MESH:
            self._init_mesh()
        elif self[constants.TYPE] in camera:
            self._init_camera()
        elif self[constants.TYPE] in lights:
            self._init_light()

        no_anim = (None, False, constants.OFF)
        if self.options.get(constants.KEYFRAMES) not in no_anim:
            logger.info("Export Transform Animation for %s", self.node)
            if self._scene:
                # only when exporting scene
                tracks = api.object.animated_xform(self.node, self.options)
                merge = self._scene[constants.ANIMATION][0][constants.KEYFRAMES]
                for track in tracks:
                    merge.append(track)

        if self.options.get(constants.HIERARCHY, False):
            for child in api.object.children(self.node, self.scene.valid_types):
                if not self.get(constants.CHILDREN):
                    self[constants.CHILDREN] = [Object(child, parent=self)]
                else:
                    self[constants.CHILDREN].append(Object(child, parent=self))

        if self.options.get(constants.CUSTOM_PROPERTIES, False):
            self[constants.USER_DATA] = api.object.custom_properties(self.node)

    def _root_setup(self):
        """Applies to a root/scene object"""
        logger.debug("Object()._root_setup()")
        self[constants.MATRIX] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                                  1, 0, 0, 0, 0, 1]
