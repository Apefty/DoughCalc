# convert-i18n.ps1
# Usage:
# 1) Place a CSV file with headers: original,key  (UTF-8, no BOM). Example in mappings/example-mappings.csv
# 2) Run in repo root: .\scripts\convert-i18n.ps1 -Mappings .\scripts\mappings.csv -WhatIf
# 3) Remove -WhatIf to perform replacements. The script creates .bak backups of edited files.

param(
  [Parameter(Mandatory=$true)]
  [string]$Mappings,

  [switch]$WhatIf
)

$root = Get-Location
Write-Output "Running conversion in $root"

# Read mappings CSV: original,key
if (-not (Test-Path $Mappings)) { throw "Mappings file not found: $Mappings" }

$mappings = Import-Csv -Path $Mappings -Encoding UTF8
if ($mappings.Count -eq 0) { throw "No mappings found in $Mappings" }

# File types to consider. Adjust as needed.
$ext = @('*.html','*.htm','*.js','*.jsx','*.ts','*.tsx','*.vue')

# Directories to exclude
$excludeDirs = @('node_modules','.git')

foreach ($pattern in $ext) {
  $files = Get-ChildItem -Path $root -Recurse -Include $pattern -File -ErrorAction SilentlyContinue | Where-Object { 
    $p = $_.FullName
    -not ($excludeDirs | ForEach-Object { $p -like "*\\$_\\*" } | Where-Object { $_ })
  }

  foreach ($file in $files) {
    $content = Get-Content -Raw -Path $file.FullName -Encoding UTF8
    $originalContent = $content
    $changed = $false

    foreach ($m in $mappings) {
      $orig = $m.original
      $key = $m.key
      if ([string]::IsNullOrEmpty($orig) -or [string]::IsNullOrEmpty($key)) { continue }

      # Build replacement: preserve whitespace context by default; user may modify mapping
      $replacement = "{{lang.$key}}"

      # Regex-escape the original literal to match literally
      $esc = [Regex]::Escape($orig)
      # Replace only text nodes in HTML/JS is hard; this is a best-effort literal replacement.
      if ($content -match $esc) {
        $content = [Regex]::Replace($content, $esc, $replacement)
        $changed = $true
      }
    }

    if ($changed) {
      if ($WhatIf) {
        Write-Output "Would update: $($file.FullName)"
      } else {
        # backup
        $bak = $file.FullName + '.bak'
        Copy-Item -Path $file.FullName -Destination $bak -Force
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Output "Updated: $($file.FullName)  (backup: $bak)"
      }
    }
  }
}

Write-Output "Done."