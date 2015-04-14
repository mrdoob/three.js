from bpy import context

CONTEXT = {
    0: {
        'title': "Error Message",
        'icon': 'CANCEL'
    },
    1: {
        'title': "Warning Message",
        'icon': 'ERROR' # I prefer this icon for warnings
    },
    2: {
        'title': "Message",
        'icon': 'NONE'
    },
    3: {
        'title': "Question",
        'icon': 'QUESTION'
    }
}


def error(message, title="", wrap=40):
    """Creates an error dialog.

    :param message: text of the message body
    :param title: text to append to the title
                  (Default value = "")
    :param wrap: line width (Default value = 40)

    """
    _draw(message, title, wrap, 0)


def warning(message, title="", wrap=40):
    """Creates an error dialog.

    :param message: text of the message body
    :param title: text to append to the title
                  (Default value = "")
    :param wrap: line width (Default value = 40)

    """
    _draw(message, title, wrap, 1)



def info(message, title="", wrap=40):
    """Creates an error dialog.

    :param message: text of the message body
    :param title: text to append to the title
                  (Default value = "")
    :param wrap: line width (Default value = 40)

    """
    _draw(message, title, wrap, 2)



def question(message, title="", wrap=40):
    """Creates an error dialog.

    :param message: text of the message body
    :param title: text to append to the title
                  (Default value = "")
    :param wrap: line width (Default value = 40)

    """
    _draw(message, title, wrap, 3)



# Great idea borrowed from
# http://community.cgcookie.com/t/code-snippet-easy-error-messages/203
def _draw(message, title, wrap, key):
    """

    :type message: str
    :type title: str
    :type wrap: int
    :type key: int

    """
    lines = []
    if wrap > 0:
        while len(message) > wrap:
            i = message.rfind(' ', 0, wrap)
            if i == -1:
                lines += [message[:wrap]]
                message = message[wrap:]
            else:
                lines += [message[:i]]
                message = message[i+1:]
    if message:
        lines += [message]

    def draw(self, *args):
        """

        :param self:
        :param *args:

        """
        for line in lines:
            self.layout.label(line)

    title = "%s: %s" % (title, CONTEXT[key]['title'])
    icon = CONTEXT[key]['icon']

    context.window_manager.popup_menu(
        draw, title=title.strip(), icon=icon)
