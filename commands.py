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
		print "hello from strike!"
        