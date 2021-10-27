import os
import shutil
import subprocess

outDir = "site"
stylesDir = "styles"
scriptsDir = "scripts"

# Create output site directory
if os.path.isdir(outDir):
    shutil.rmtree(outDir)
os.makedirs(outDir)
shutil.copytree(stylesDir, f"{outDir}/{stylesDir}")
shutil.copytree(scriptsDir, f"{outDir}/{scriptsDir}")

# Create index page
subprocess.run([
    "pandoc",
    "--from=markdown",
    "--to=html",
    f"--output={outDir}/index.html",
    "--template=templates/index.html",
    "index.md"
])