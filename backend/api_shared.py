from vtutils.confparser import env_config
from vtutils.misc import get_project_root
from vtutils.vtlogger import initLog, getLog
import sys
import os

ROOT_DIR = get_project_root()
sys.path.append(ROOT_DIR)

package_name = "pdf_input_api"
vtlog = initLog(package_name)

config = env_config("{0}/.env".format(ROOT_DIR))

vtstorage = None
