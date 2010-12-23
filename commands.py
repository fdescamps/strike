# Strike
import sys
import inspect
import os
import subprocess
import shutil

from play.utils import *

MODULE = 'strike'
COMMANDS = []

def after(**kargs):
    command = kargs.get("command")
    app = kargs.get("app")
    args = kargs.get("args")
    env = kargs.get("env")

    # ~~~~~~~~~~~~~~~~~~~~~~ new
    if command == 'new':
        print "Installing mobile template"
        module_dir = inspect.getfile(inspect.currentframe()).replace("commands.py", "")
        shutil.copyfile(os.path.join(module_dir, 'resources', 'indexTemplate.html'), os.path.join(app.path, 'app', 'views', 'Application', 'index.html'))
        shutil.copyfile(os.path.join(module_dir, 'resources', 'mainTemplate.html'), os.path.join(app.path, 'app', 'views', 'main.html'))
        shutil.copyfile(os.path.join(module_dir, 'resources', 'mobileTemplate.sass'), os.path.join(app.path, 'public', 'stylesheets', 'mobile.sass'))
        shutil.copyfile(os.path.join(module_dir, 'resources', 'mobileTemplate.js'), os.path.join(app.path, 'public', 'javascripts', 'mobile.js'))
        
        print "Adding SASS module requirement to conf"
        ac = open(os.path.join(app.path, 'conf/application.conf'), 'r')
        conf = ""
        for line in ac:
            conf = conf + line
            # print "!%s!" % line
            if line.find("---- MODULES ----") > 0:
                conf = conf + "module.sass=${play.path}/modules/sass\n"
        ac.close()
        
        # Write it.
        ac = open(os.path.join(app.path, 'conf/application.conf'), 'w')
        ac.write(conf)
        print "done"

