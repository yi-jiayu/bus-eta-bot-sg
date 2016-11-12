param([string]$env_file='.env', [string]$out_file='out\build.zip', [switch]$v)

Write-Output "$(Get-Date) [START] build"

# clean out folder
Write-Output "$(Get-Date)   [START] Cleaning output directory"

if ($v) { rm -R out/* }
else { rm -R out/* | out-null }

Write-Output "$(Get-Date)   [END] Cleaning output directory"

# create out/build

Write-Output "$(Get-Date)   [START] Creating build folder"

if ($v) { mkdir out/build }
else { mkdir out/build | out-null }

Write-Output "$(Get-Date)   [END] Creating build folder"

# babel into lib
Write-Output "$(Get-Date)   [START] Running babel"

if ($v) { npm run babel }
else { npm run babel | out-null }

Write-Output "$(Get-Date)   [END] Running babel"

# copy lib into out/build folder
Write-Output "$(Get-Date)   [START] Copying source files"

if ($v) { cp -R lib/* out/build }
else { cp -R lib/* out/build | out-null }

Write-Output "$(Get-Date)   [END] Copying source files"

# copy environment file into out/build folder
Write-Output "$(Get-Date)   [START] Copying environment file ($($env_file))"

if ($v) { cp $env_file out/build/.env }
else { cp $env_file out/build/.env | out-null }

Write-Output "$(Get-Date)   [END] Copying environment file ($($env_file))"

# npm install into out/build folder
Write-Output "$(Get-Date)   [START] Installing node modules"

if ($v) { npm install --prefix out/build --production }
else { npm install --prefix out/build --production | out-null }

Write-Output "$(Get-Date)   [END] Installing node modules"

# zip out into out/build.zip
Write-Output "$(Get-Date)   [START] Zipping files into $out_file"

Add-Type -assembly "system.io.compression.filesystem"
[io.compression.zipfile]::CreateFromDirectory('out\build', $out_file)

Write-Output "$(Get-Date)   [STOP] Zipping files into $out_file"

Write-Output "$(Get-Date) [END] build"
