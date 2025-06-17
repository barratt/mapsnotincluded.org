<#
  Oxygen Not Included Seed Browser Frontend
  Copyright (C) 2025 The Maps Not Included Authors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
  See the AUTHORS file in the project root for a full list of contributors.
#>

# Install Node.JS, or update it if it is already installed
winget install -e --id OpenJS.NodeJS

# Reload the PowerShell environment variables to allow npm to run
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Allow PowerShell to run npm
Set-ExecutionPolicy Bypass -Scope Process

# Get the directory of the currently running script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Get the frontend's directory
$ScriptDir = Join-Path -Path $ScriptDir -ChildPath ".."

# Set to the script's directory
Set-Location -Path $ScriptDir

# Print the current location for debugging
Write-Host "Running from: $ScriptDir"

# Install npm dependencies
npm install

# Run the frontend
npm run dev

# In case of failure, do not immediately close the window
pause