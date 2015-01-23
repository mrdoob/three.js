from .. import constants, logger
from . import base_classes, api


class Object(base_classes.BaseNode):

    def __init__(self, node, parent=None, type=None):
        logger.debug('Object().__init__(%s)', node)
        base_classes.BaseNode.__init__(self, node, parent=parent, type=type)

        if self.node:
            self.__node_setup()
        else:
            self.__root_setup()

    def __init_camera(self):
        logger.debug('Object().__init_camera()')
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
    def __init_light(self):
        logger.debug('Object().__init_light()')
        self[constants.COLOR] = api.light.color(self.node)
        self[constants.INTENSITY] = api.light.intensity(self.node)

        if self[constants.TYPE] != constants.DIRECTIONAL_LIGHT:
            self[constants.DISTANCE] = api.light.distance(self.node)
    
        if self[constants.TYPE] == constants.SPOT_LIGHT:
            self[constants.ANGLE] = api.light.angle(self.node)

    def __init_mesh(self):
        logger.debug('Object().__init_mesh()')
        mesh = api.object.mesh(self.node, self.options)
        node = self.scene.geometry(mesh)
        if node:
            self[constants.GEOMETRY] = node[constants.UUID]
        else:
            msg = 'Could not find Geometry() node for %s'
            logger.error(msg, self.node)

    def __node_setup(self):
        logger.debug('Object().__node_setup()')
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
            logger.info('Parsing materials for %s', self.node)
            material_name = api.object.material(self.node)
            if material_name:
                logger.info('Material found %s', material_name)
                material_inst = self.scene.material(material_name)
                self[constants.MATERIAL] = material_inst[constants.UUID]
            else:
                logger.info('%s has no materials', self.node)

        casts_shadow = (constants.MESH, 
            constants.DIRECTIONAL_LIGHT,
            constants.SPOT_LIGHT)

        if self[constants.TYPE] in casts_shadow:
            logger.info('Querying shadow casting for %s', self.node)
            self[constants.CAST_SHADOW] = \
                api.object.cast_shadow(self.node)
        
        if self[constants.TYPE] == constants.MESH:
            logger.info('Querying shadow receive for %s', self.node)
            self[constants.RECEIVE_SHADOW] = \
                api.object.receive_shadow(self.node)

        camera = (constants.PERSPECTIVE_CAMERA,
            constants.ORTHOGRAPHIC_CAMERA)

        lights = (constants.AMBIENT_LIGHT, constants.DIRECTIONAL_LIGHT,
            constants.AREA_LIGHT, constants.POINT_LIGHT, 
            constants.SPOT_LIGHT, constants.HEMISPHERE_LIGHT)

        if self[constants.TYPE] == constants.MESH:
            self.__init_mesh()
        elif self[constants.TYPE] in camera:
            self.__init_camera()
        elif self[constants.TYPE] in lights:
            self.__init_light()

        #for child in api.object.children(self.node, self.scene.valid_types):
        #    if not self.get(constants.CHILDREN):
        #        self[constants.CHILDREN] = [Object(child, parent=self)]
        #    else:
        #        self[constants.CHILDREN].append(Object(child, parent=self))

    def __root_setup(self):
        logger.debug('Object().__root_setup()')
        self[constants.MATRIX] = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
