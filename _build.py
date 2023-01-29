import os
import shutil
import subprocess
import pathlib
import yaml
import json

outDir = "site"
stylesDir = "styles"
scriptsDir = "scripts"
imagesDir = "img"
conditionsDir = "conditions"

# Create output site directory
if os.path.isdir(outDir): shutil.rmtree(outDir)
os.makedirs(outDir)
shutil.copytree(imagesDir, f"{outDir}/{imagesDir}")
shutil.copytree(stylesDir, f"{outDir}/{stylesDir}")
shutil.copytree(scriptsDir, f"{outDir}/{scriptsDir}")
shutil.copytree("dummy-area-data", f"{outDir}/dummy-area-data")
shutil.copyfile("air-values.json", f"{outDir}/air-values.json")
shutil.copyfile("air-data.txt", f"{outDir}/air-data.txt")
shutil.copyfile("google9c66b3b3d14f628e.html", f"{outDir}/google9c66b3b3d14f628e.html")

# Build pollutant condition mapping
conditions = {}
for conditionFileName in os.scandir(conditionsDir):
        condition = pathlib.Path(conditionFileName.name).stem
        with open(conditionFileName, "r", encoding="utf-8") as conditionFile:          
            conditions[condition] = yaml.safe_load(conditionFile)

with open(f"{outDir}/conditions.json", "w", encoding="utf-8") as conditionFile: 
    json.dump(conditions, conditionFile)

# Create index page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={outDir}/index.html", "--template=templates/index.html", "index.md"])