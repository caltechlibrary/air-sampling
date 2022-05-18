import os
import shutil
import subprocess

outDir = "site"
stylesDir = "styles"
scriptsDir = "scripts"
imagesDir = "img"

# Create output site directory
if os.path.isdir(outDir): shutil.rmtree(outDir)
os.makedirs(outDir)
shutil.copytree(imagesDir, f"{outDir}/{imagesDir}")
shutil.copytree(stylesDir, f"{outDir}/{stylesDir}")
shutil.copytree(scriptsDir, f"{outDir}/{scriptsDir}")
shutil.copyfile("citaqs.txt", f"{outDir}/citaqs.txt")
shutil.copyfile("mappings.json", f"{outDir}/mappings.json")
shutil.copyfile("google9c66b3b3d14f628e.html", f"{outDir}/google9c66b3b3d14f628e.html")

# Create index page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={outDir}/index.html", "--template=templates/index.html", "index.md"])