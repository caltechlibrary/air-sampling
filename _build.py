import os
import shutil
import subprocess
import argparse

outDir = "site"
dummyDataDir = "dummy"
stylesDir = "styles"
scriptsDir = "scripts"
imagesDir = "img"
conditionsDir = "conditions"

def buildPage(page, template):
    cmd = []
    cmd.append("pandoc")
    cmd.append("--from=markdown")
    cmd.append("--to=html")
    cmd.append(f"--output={outDir}/{page}.html")
    cmd.append(f"--template=templates/{template}.html")

    if (args.dummy): cmd.append(f"--metadata=dummy")

    cmd.append(f"pages/{page}.md")

    subprocess.run(cmd)

argParser = argparse.ArgumentParser()
argParser.add_argument("--dummy", action="store_true", help="set a flag to include dummy data")
args = argParser.parse_args()

# Create output site directory
if os.path.isdir(outDir): shutil.rmtree(outDir)
os.makedirs(outDir)
os.makedirs(f"{outDir}/phoenix")
shutil.copytree(imagesDir, f"{outDir}/{imagesDir}")
shutil.copytree(stylesDir, f"{outDir}/{stylesDir}")
shutil.copytree(scriptsDir, f"{outDir}/{scriptsDir}")
shutil.copyfile("google9c66b3b3d14f628e.html", f"{outDir}/google9c66b3b3d14f628e.html")
shutil.copyfile("favicon.ico", f"{outDir}/favicon.ico")

if args.dummy: shutil.copytree("dummy", f"{outDir}/{dummyDataDir}")

buildPage("index", "index")
buildPage("aqi-data", "aqi-data")
buildPage("OZONE-data", "pollutant-data")
buildPage("PM2.5-data", "pollutant-data")
buildPage("PM10-data", "pollutant-data")
buildPage("CO-data", "pollutant-data")
buildPage("NO2-data", "pollutant-data")
buildPage("how-is-aqi-defined-here", "how-is-aqi-defined-here")
buildPage("phoenix/index", "phoenix/index")
