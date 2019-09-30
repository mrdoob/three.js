Title: Three.js Setup
Description: How to setup your development environment for three.js
TOC: Setup

This article is one in a series of articles about three.js.
The first article was [about three.js fundamentals](threejs-fundamentals.html).
If you haven't read that yet you might want to start there.

Before we go any further we need to talk about setting up your
computer to do development. In particular, for security reasons,
WebGL cannot use images from your hard drive directly. That means
in order to do development you need to use a web server. Fortunately
development web servers are super easy to setup and use.

First off if you'd like you can download this entire site from [this link](https://github.com/gfxfundamentals/threejsfundamentals/archive/gh-pages.zip).
Once downloaded double click the zip file to unpack the files.

Next download one of these simple web servers.

If you'd prefer a web server with a user interface there's
[Servez](https://greggman.github.io/servez)

{{{image url="resources/servez.gif" className="border" }}}

Just point it at the folder where you unzipped the files, click "Start", then go to
in your browser [`http://localhost:8080/`](http://localhost:8080/) or if you'd
like to browse the samples go to [`http://localhost:8080/threejs`](http://localhost:8080/threejs).

To stop serving pick stop or quit Servez.

If you prefer the command line (I do), another way is to use [node.js](https://nodejs.org).
Download it, install it, then open a command prompt / console / terminal window. If you're on Windows the installer will add a special "Node Command Prompt" so use that.

Then install the [`http-server`](https://github.com/indexzero/http-server) by typing

    npm -g install http-server

If you're on OSX use

    sudo npm -g install http-server

Once you've done that type

    http-server path/to/folder/where/you/unzipped/files

Or if you're like me

    cd path/to/folder/where/you/unzipped/files
    http-server

It should print something like

{{{image url="resources/http-server-response.png" }}}

Then in your browser go to [`http://localhost:8080/`](http://localhost:8080/).

If you don't specify a path then http-server will serve the current folder.

If either of those options are not to your liking
[there are many other simple servers to choose from](https://stackoverflow.com/questions/12905426/what-is-a-faster-alternative-to-pythons-http-server-or-simplehttpserver).

Now that you have a server setup we can move on to [textures](threejs-textures.html).
