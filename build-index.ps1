# build-index.ps1
# crawls Sure and SureKomentari folders and injects the index into search.html
# only the block between INDEX-START and INDEX-END markers is replaced
# everything else in search.html is preserved
#
# usage: .\build-index.ps1

$root = $PSScriptRoot
$searchFile = Join-Path $root "search.html"

Add-Type -AssemblyName System.Web

function Decode-Html($text) { return [System.Web.HttpUtility]::HtmlDecode($text) }
function Escape-Json($text) { return $text -replace '\\', '\\' -replace '"', '\"' -replace "`r`n", ' ' -replace "`n", ' ' -replace "`r", ' ' }

function Get-FolderPages($folderPath, $folderTag) {
    $entries = @()
    if (-not (Test-Path $folderPath)) { Write-Warning "folder not found: $folderPath"; return $entries }
    Get-ChildItem -Path $folderPath -Recurse -Include "*.htm","*.html" |
        Where-Object { $_.Name -notmatch "^search" } |
        ForEach-Object {
            $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
            $title = $_.BaseName
            if ($content -match "(?i)<title>(.*?)</title>") { $title = $matches[1].Trim() }
            $body = $content -replace "(?s)<style[^>]*>.*?</style>", " "
            $body = $body -replace "(?s)<script[^>]*>.*?</script>", " "
            $body = $body -replace "<[^>]+>", " "
            $body = $body -replace "\s+", " "
            $body = $body.Trim()
            $title = Decode-Html $title
            $body = Decode-Html $body
            $rel = $_.FullName.Substring($root.Length).TrimStart("\").Replace("\", "/")
            $entries += "  { `"id`": `"$(Escape-Json $rel)`", `"title`": `"$(Escape-Json $title)`", `"body`": `"$(Escape-Json $body)`", `"folder`": `"$folderTag`" }"
            Write-Host "  [$folderTag] $($_.Name)"
        }
    return $entries
}

Write-Host ""; Write-Host "indexing Sure..."
$pages = Get-FolderPages (Join-Path $root "Sure") "Sure"
Write-Host ""; Write-Host "indexing SureKomentari..."
$pages += Get-FolderPages (Join-Path $root "SureKomentari") "SureKomentari"

if ($pages.Count -eq 0) { Write-Warning "no html files found."; exit 1 }

$indexBlock = "const pages = [`n" + ($pages -join ",`n") + "`n];"

$html = [System.IO.File]::ReadAllText($searchFile, [System.Text.Encoding]::UTF8)

$startMarker = "// INDEX-START"
$endMarker = "// INDEX-END"
$s = $html.IndexOf($startMarker)
$e = $html.IndexOf($endMarker)

if ($s -lt 0 -or $e -lt 0) {
    Write-Warning "markers not found in search.html. add // INDEX-START and // INDEX-END inside a <script> block."
    exit 1
}

$before = $html.Substring(0, $s + $startMarker.Length)
$after = $html.Substring($e)
$html = $before + "`n" + $indexBlock + "`n" + $after

[System.IO.File]::WriteAllText($searchFile, $html, [System.Text.UTF8Encoding]::new($false))
Write-Host ""; Write-Host "done. $($pages.Count) pages indexed into search.html"