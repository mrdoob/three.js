import os
from .. import constants, logger
from . import base_classes, io, api


class Image(base_classes.BaseNode):
    def __init__(self, node, parent):
        logger.debug('Image().__init__(%s)', node)
        base_classes.BaseNode.__init__(self, node, parent, constants.IMAGE)

        self[constants.URL] = api.image.file_name(self.node)

    @property
    def destination(self):
        dirname = os.path.dirname(self.scene.filepath)
        return os.path.join(dirname, self[constants.URL])

    @property
    def filepath(self):
        return api.image.file_path(self.node)

    def copy_texture(self, func=io.copy):
        logger.debug('Image().copy_texture()')
        func(self.filepath, self.destination)
        return self.destination
