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
        src_dir = os.path.join(module_dir, 'resources', 'skeleton')

        # TODO: automatically recurse skeleton (shutil.copytree won't work when dest folder exists)
        template_files = [
            'app/views/Application/index.html',
            'app/views/main.html',
            'public/javascripts/mobile.js',
            'public/stylesheets/mobile.sass'
        ]
        
        # copy the files to the project
        for url in template_files:
            os_url = os.path.join(*url.split('/'))
            src_file = os.path.join(module_dir, src_dir, os_url)
            dst_file = os.path.join(app.path, os_url)
            shutil.copyfile(src_file, dst_file)
        
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
