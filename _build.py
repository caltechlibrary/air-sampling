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
pollutantsDir = "pollutants"

# Create output site directory
if os.path.isdir(outDir): shutil.rmtree(outDir)
os.makedirs(outDir)
shutil.copytree(imagesDir, f"{outDir}/{imagesDir}")
shutil.copytree(stylesDir, f"{outDir}/{stylesDir}")
shutil.copytree(scriptsDir, f"{outDir}/{scriptsDir}")
shutil.copyfile("air-values.json", f"{outDir}/air-values.json")
shutil.copyfile("air-data.txt", f"{outDir}/air-data.txt")
shutil.copyfile("google9c66b3b3d14f628e.html", f"{outDir}/google9c66b3b3d14f628e.html")

# Build pollutant mappings
mappingsDict = {}
for pollutantFilename in os.scandir(pollutantsDir):
        pollutantName = pathlib.Path(pollutantFilename.name).stem
        with open(pollutantFilename, "r", encoding="utf-8") as pollutantFile:          
            mappingsDict[pollutantName] = yaml.safe_load(pollutantFile)
            
with open(f"{outDir}/mappings.json", "w", encoding="utf-8") as mappingsFile: 
    json.dump(mappingsDict, mappingsFile)

# Create index page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={outDir}/index.html", "--template=templates/index.html", "index.md"])