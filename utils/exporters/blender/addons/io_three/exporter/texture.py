from .. import constants, logger
from . import base_classes, image, api


class Texture(base_classes.BaseNode):
    """Class that wraps a texture node"""
    def __init__(self, node, parent):
        logger.debug("Texture().__init__(%s)", node)
        base_classes.BaseNode.__init__(self, node, parent, constants.TEXTURE)

        num = constants.NUMERIC

        img_inst = self.scene.image(api.texture.file_name(self.node))

        if not img_inst:
            image_node = api.texture.image_node(self.node)
            img_inst = image.Image(image_node.name, self.scene)
            self.scene[constants.IMAGES].append(img_inst)


        self[constants.IMAGE] = img_inst[constants.UUID]

        wrap = api.texture.wrap(self.node)
        self[constants.WRAP] = (num[wrap[0]], num[wrap[1]])

        if constants.WRAPPING.REPEAT in wrap:
            self[constants.REPEAT] = api.texture.repeat(self.node)

        self[constants.ANISOTROPY] = api.texture.anisotropy(self.node)
        self[constants.MAG_FILTER] = num[api.texture.mag_filter(self.node)]
        self[constants.MIN_FILTER] = num[api.texture.min_filter(self.node)]
        self[constants.MAPPING] = num[api.texture.mapping(self.node)]

    @property
    def image(self):
        """

        :return: the image object of the current texture
        :rtype: image.Image

        """
        return self.scene.image(self[constants.IMAGE])
