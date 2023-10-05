import os
import shutil
import subprocess
import pathlib
import yaml
import json
import argparse

outDir = "site"
dummyDataDir = "dummy"
stylesDir = "styles"
scriptsDir = "scripts"
imagesDir = "img"
conditionsDir = "conditions"

argParser = argparse.ArgumentParser()
argParser.add_argument("--dummy", action="store_true", help="set a flag to include dummy data")
args = argParser.parse_args()

# Create output site directory
if os.path.isdir(outDir): shutil.rmtree(outDir)
os.makedirs(outDir)
shutil.copytree(imagesDir, f"{outDir}/{imagesDir}")
shutil.copytree(stylesDir, f"{outDir}/{stylesDir}")
shutil.copytree(scriptsDir, f"{outDir}/{scriptsDir}")
shutil.copyfile("google9c66b3b3d14f628e.html", f"{outDir}/google9c66b3b3d14f628e.html")

if args.dummy: shutil.copytree("dummy", f"{outDir}/{dummyDataDir}")

# Build pollutant condition mapping
conditions = {}
for conditionFileName in os.scandir(conditionsDir):
        condition = pathlib.Path(conditionFileName.name).stem
        with open(conditionFileName, "r", encoding="utf-8") as conditionFile:          
            conditions[condition] = yaml.safe_load(conditionFile)

with open(f"{outDir}/conditions.json", "w", encoding="utf-8") as conditionFile: 
    json.dump(conditions, conditionFile)

# Create index page
pandocCmd = []
pandocCmd.append("pandoc")
pandocCmd.append("--from=markdown")
pandocCmd.append("--to=html")
pandocCmd.append(f"--output={outDir}/index.html")
pandocCmd.append("--template=templates/index.html")

if (args.dummy): pandocCmd.append(f"--metadata=dummy")

pandocCmd.append("index.md")

subprocess.run(pandocCmd)