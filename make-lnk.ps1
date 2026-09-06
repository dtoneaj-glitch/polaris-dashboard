$ErrorActionPreference = 'Stop'
$desktop = [Environment]::GetFolderPath('Desktop')
$ws = New-Object -ComObject WScript.Shell
$name = [string][char]21271 + [char]26997 + [char]26143 + ' Polaris.lnk'
$lnk = $ws.CreateShortcut((Join-Path $desktop $name))
$proj = [string][char]23560 + [char]26696 + [char]20736 + [char]37686 + [char]29256
$lnk.TargetPath = "D:\ZCODE\" + $proj + "\start-polaris.bat"
$lnk.WorkingDirectory = "D:\ZCODE\" + $proj
$lnk.WindowStyle = 7
$lnk.Hotkey = 'Ctrl+Alt+P'
$lnk.IconLocation = 'C:\Users\amydo\AppData\Local\Vivaldi\Application\vivaldi.exe,0'
$desc = [string][char]21271 + [char]26997 + [char]26143 + ' Polaris - Ctrl+Alt+P'
$lnk.Description = $desc
$lnk.Save()
Write-Output ("created: " + (Join-Path $desktop $name))
$check = $ws.CreateShortcut((Join-Path $desktop $name))
Write-Output ("hotkey: " + $check.Hotkey)
Write-Output ("target: " + $check.TargetPath)
