<#
  lx_tag.ps1 —— 给「洛雪音源」面板缓存的音频文件写入标签
  ---------------------------------------------------------------------------
  用法（由 main.js 自动调用，一般不用手写）：
    powershell -NoProfile -ExecutionPolicy Bypass -File lx_tag.ps1 -job job.json

  job.json（UTF-8）：
    {
      "file":      "D:\\...\\歌手 - 歌名.flac",   // 必填，要写标签的音频
      "title":     "...", "artist": "...", "album": "...",
      "date":      "2023-05-01", "genre": "...",
      "lyricFile": "D:\\...\\.tag\\lyric.txt",    // 可空：LRC 文本
      "coverFile": "D:\\...\\covers\\xxx.jpg"     // 可空：封面图片
    }

  支持的格式：
    .mp3  → ID3v2.3（TIT2/TPE1/TALB/TYER/TCON + USLT 歌词 + APIC 封面）
    .flac → Vorbis comment（ARTIST/TITLE/ALBUM/DATE/GENRE/LYRICS）+ PICTURE
  其它格式（m4a/aac/ogg…）输出 "SKIP:" 并退出码 2，面板会跳过写标签、照常播放。

  输出：成功 "OK"（退出码 0）；失败 "ERR: 原因"（退出码 1）。
  只改元数据块 / 头部，音频数据按原样搬运，不会重新编码。
#>
param(
  [Parameter(Mandatory = $true)][string]$job
)

$ErrorActionPreference = 'Stop'

function Say([string]$s) { [Console]::Out.WriteLine($s) }

# ---------------------------------------------------------------- 字节工具
function B_U8([string]$s)  { return ,([Text.Encoding]::UTF8.GetBytes($s)) }

function B_U16([string]$s) {
  $b = [Text.Encoding]::Unicode.GetBytes($s)
  $o = [byte[]]::new($b.Length + 2)
  $o[0] = 0xFF
  $o[1] = 0xFE
  [Array]::Copy($b, 0, $o, 2, $b.Length)
  return ,$o
}

function B_BE32([int]$v) {
  $b = [BitConverter]::GetBytes([uint32]$v)
  [Array]::Reverse($b)
  return ,([byte[]]$b)
}

function B_LE32([int]$v) {
  return ,([byte[]][BitConverter]::GetBytes([uint32]$v))
}

function B_SyncSafe([int]$v) {
  $o = [byte[]]::new(4)
  $o[0] = [byte]([math]::Floor($v / 2097152) % 128)
  $o[1] = [byte]([math]::Floor($v / 16384) % 128)
  $o[2] = [byte]([math]::Floor($v / 128) % 128)
  $o[3] = [byte]($v % 128)
  return ,$o
}

function NewMS { return (New-Object IO.MemoryStream) }

function Push($ms, [byte[]]$bytes) {
  if ($bytes -and $bytes.Length -gt 0) { $ms.Write($bytes, 0, $bytes.Length) }
}

function PushByte($ms, [byte]$b) { $ms.Write([byte[]]@($b), 0, 1) }

# 读文本：兼容面板写出的 UTF-8（有无 BOM）以及意外的 UTF-16
function ReadTextAuto([string]$path) {
  $b = [IO.File]::ReadAllBytes($path)
  if ($b.Length -ge 2 -and $b[0] -eq 0xFF -and $b[1] -eq 0xFE) {
    return [Text.Encoding]::Unicode.GetString($b, 2, $b.Length - 2)
  }
  if ($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) {
    return [Text.Encoding]::UTF8.GetString($b, 3, $b.Length - 3)
  }
  $t = [Text.Encoding]::UTF8.GetString($b)
  return $t.TrimStart([char]0xFEFF)
}

# ---------------------------------------------------------------- 图片信息
function GetImageInfo([byte[]]$b) {
  $r = @{ mime = 'image/jpeg'; w = 0; h = 0 }
  if (-not $b -or $b.Length -lt 24) { return $r }

  if ($b[0] -eq 0x89 -and $b[1] -eq 0x50 -and $b[2] -eq 0x4E -and $b[3] -eq 0x47) {
    $r.mime = 'image/png'
    $r.w = [int]$b[16] * 16777216 + [int]$b[17] * 65536 + [int]$b[18] * 256 + [int]$b[19]
    $r.h = [int]$b[20] * 16777216 + [int]$b[21] * 65536 + [int]$b[22] * 256 + [int]$b[23]
    return $r
  }

  if ($b[0] -eq 0xFF -and $b[1] -eq 0xD8) {
    $i = 2
    while ($i + 8 -lt $b.Length) {
      if ($b[$i] -ne 0xFF) { $i++; continue }
      $m = [int]$b[$i + 1]
      if ($m -eq 0xD8 -or $m -eq 0x01 -or ($m -ge 0xD0 -and $m -le 0xD7)) { $i += 2; continue }
      $len = [int]$b[$i + 2] * 256 + [int]$b[$i + 3]
      if ($m -ge 0xC0 -and $m -le 0xCF -and $m -ne 0xC4 -and $m -ne 0xC8 -and $m -ne 0xCC) {
        $r.h = [int]$b[$i + 5] * 256 + [int]$b[$i + 6]
        $r.w = [int]$b[$i + 7] * 256 + [int]$b[$i + 8]
        return $r
      }
      if ($len -le 0) { break }
      $i += 2 + $len
    }
  }
  return $r
}

# ---------------------------------------------------------------- ID3（MP3）
function Id3Frame([string]$id, [byte[]]$payload) {
  $ms = NewMS
  Push $ms ([Text.Encoding]::ASCII.GetBytes($id))
  Push $ms (B_BE32 $payload.Length)
  Push $ms ([byte[]]@(0, 0))
  Push $ms $payload
  return ,($ms.ToArray())
}

function Id3Text([string]$text) {
  $b = B_U16 $text
  $o = [byte[]]::new($b.Length + 1)
  $o[0] = 1                       # 0x01 = UTF-16 with BOM
  [Array]::Copy($b, 0, $o, 1, $b.Length)
  return ,$o
}

function Id3Uslt([string]$text) {
  $ms = NewMS
  PushByte $ms 1                  # UTF-16
  Push $ms ([Text.Encoding]::ASCII.GetBytes('chi'))
  Push $ms ([byte[]]@(0xFF, 0xFE, 0x00, 0x00))   # 空内容描述符
  Push $ms (B_U16 $text)
  return ,($ms.ToArray())
}

function Id3Apic([byte[]]$img, [string]$mime) {
  $ms = NewMS
  PushByte $ms 0                  # ISO-8859-1
  Push $ms ([Text.Encoding]::ASCII.GetBytes($mime))
  PushByte $ms 0
  PushByte $ms 3                  # front cover
  PushByte $ms 0
  Push $ms $img
  return ,($ms.ToArray())
}

# 读出已有 ID3v2 的帧（用来保留 foobar2000 写进去的其它字段 / 旧封面）
function GetId3Frames([byte[]]$data) {
  $out = @()
  if ($data.Length -lt 10) { return ,$out }
  if (-not ($data[0] -eq 0x49 -and $data[1] -eq 0x44 -and $data[2] -eq 0x33)) { return ,$out }

  $major = [int]$data[3]
  $size = [int]$data[6] * 2097152 + [int]$data[7] * 16384 + [int]$data[8] * 128 + [int]$data[9]
  $end = [math]::Min($data.Length, 10 + $size)
  $p = 10

  # 扩展头（通常不用，遇到了就跳过）
  if (($data[5] -band 0x40) -ne 0 -and $p + 4 -le $end) {
    $exLen = [int]$data[$p] * 2097152 + [int]$data[$p + 1] * 16384 + [int]$data[$p + 2] * 128 + [int]$data[$p + 3]
    $p += 4 + $exLen
  }

  while ($p + 10 -le $end) {
    $id = [Text.Encoding]::ASCII.GetString($data, $p, 4)
    if ($id -notmatch '^[A-Z0-9]{4}$') { break }
    if ($major -ge 4) {
      $flen = [int]$data[$p + 4] * 2097152 + [int]$data[$p + 5] * 16384 + [int]$data[$p + 6] * 128 + [int]$data[$p + 7]
    } else {
      $flen = [int]$data[$p + 4] * 16777216 + [int]$data[$p + 5] * 65536 + [int]$data[$p + 6] * 256 + [int]$data[$p + 7]
    }
    if ($flen -le 0 -or ($p + 10 + $flen) -gt $end) { break }
    $pl = [byte[]]::new($flen)
    [Array]::Copy($data, $p + 10, $pl, 0, $flen)
    $out += ,@{ id = $id; payload = $pl }
    $p += 10 + $flen
  }
  return ,$out
}

function ConvertMp3([byte[]]$data, [hashtable]$tags, [string]$lyric, [byte[]]$cover) {
  # 去掉文件开头已有的 ID3v2，避免叠加多个标签
  $start = 0
  if ($data.Length -gt 10 -and $data[0] -eq 0x49 -and $data[1] -eq 0x44 -and $data[2] -eq 0x33) {
    $sz = [int]$data[6] * 2097152 + [int]$data[7] * 16384 + [int]$data[8] * 128 + [int]$data[9]
    $start = 10 + $sz
    if (($data[5] -band 0x10) -ne 0) { $start += 10 }
    if ($start -ge $data.Length) { $start = 0 }
  }

  $old = GetId3Frames $data

  $frames = NewMS
  if ($tags.title)  { Push $frames (Id3Frame 'TIT2' (Id3Text $tags.title)) }
  if ($tags.artist) { Push $frames (Id3Frame 'TPE1' (Id3Text $tags.artist)) }
  if ($tags.album)  { Push $frames (Id3Frame 'TALB' (Id3Text $tags.album)) }
  if ($tags.date)   { Push $frames (Id3Frame 'TYER' (Id3Text $tags.date)) }
  if ($tags.genre)  { Push $frames (Id3Frame 'TCON' (Id3Text $tags.genre)) }
  if ($lyric)       { Push $frames (Id3Frame 'USLT' (Id3Uslt $lyric)) }

  if ($cover -and $cover.Length -gt 16) {
    $info = GetImageInfo $cover
    Push $frames (Id3Frame 'APIC' (Id3Apic $cover $info.mime))
  } else {
    # 这次没取到封面：把文件里原来的那张搬过来，别写一次就把图弄丢
    foreach ($f in $old) {
      if ($f.id -eq 'APIC') { Push $frames (Id3Frame 'APIC' $f.payload); break }
    }
  }

  # 其它帧（REPLAYGAIN、ALBUMARTIST 之类）原样保留，不因为重写标签而丢掉
  $mine = @('TIT2', 'TPE1', 'TALB', 'TYER', 'TCON', 'USLT', 'APIC', 'TDRC', 'TDAT', 'TIME')
  foreach ($f in $old) {
    if ($mine -contains $f.id) { continue }
    Push $frames (Id3Frame $f.id $f.payload)
  }

  $body = $frames.ToArray()
  $out = NewMS
  Push $out ([Text.Encoding]::ASCII.GetBytes('ID3'))
  Push $out ([byte[]]@(3, 0, 0))
  Push $out (B_SyncSafe $body.Length)
  Push $out $body
  Push $out ([byte[]]$data[$start..($data.Length - 1)])
  return ,($out.ToArray())
}

# ---------------------------------------------------------------- FLAC
function FlacPicture([byte[]]$img, [hashtable]$info) {
  $ms = NewMS
  Push $ms (B_BE32 3)                                    # picture type: front cover
  $mime = [Text.Encoding]::ASCII.GetBytes($info.mime)
  Push $ms (B_BE32 $mime.Length)
  Push $ms $mime
  Push $ms (B_BE32 0)                                    # 空描述
  Push $ms (B_BE32 ([int]$info.w))
  Push $ms (B_BE32 ([int]$info.h))
  Push $ms (B_BE32 24)                                   # 位深
  Push $ms (B_BE32 0)                                    # 索引色
  Push $ms (B_BE32 $img.Length)
  Push $ms $img
  return ,($ms.ToArray())
}

function ConvertFlac([byte[]]$data, [hashtable]$tags, [string]$lyric, [byte[]]$cover) {
  if ($data.Length -lt 8) { throw 'file too small' }
  if (-not ($data[0] -eq 0x66 -and $data[1] -eq 0x4C -and $data[2] -eq 0x61 -and $data[3] -eq 0x43)) {
    throw 'not a flac file'
  }

  # 遍历元数据块，记下每块类型与内容，直到最后一块（含 last 标志）
  $blocks = @()
  $off = 4
  while ($true) {
    if ($off + 4 -gt $data.Length) { throw 'metadata truncated' }
    $h = [int]$data[$off]
    $isLast = ($h -band 0x80) -ne 0
    $type = $h -band 0x7F
    $len = [int]$data[$off + 1] * 65536 + [int]$data[$off + 2] * 256 + [int]$data[$off + 3]
    $start = $off + 4
    if ($start + $len -gt $data.Length) { throw 'metadata overrun' }
    $bytes = [byte[]]::new(0)
    if ($len -gt 0) {
      $bytes = [byte[]]::new($len)
      [Array]::Copy($data, $start, $bytes, 0, $len)
    }
    $blocks += ,@{ type = $type; data = $bytes }
    $off = $start + $len
    if ($isLast) { break }
  }
  $audioOff = $off

  # 保留除 VORBIS_COMMENT(4) / PICTURE(6) 之外的块，稍后重新生成这两块。
  # 这次没取到封面时，旧的 PICTURE 块留在原地，不因为写标签把图弄丢。
  $keep = @()
  foreach ($b in $blocks) {
    if ($b.type -eq 4) { continue }
    if ($b.type -eq 6 -and $cover -and $cover.Length -gt 16) { continue }
    $keep += ,$b
  }

  # Vorbis comment
  $vc = NewMS
  $vendor = [Text.Encoding]::UTF8.GetBytes('LX-js')
  Push $vc (B_LE32 $vendor.Length)
  Push $vc $vendor

  $pairs = @()
  if ($tags.artist) { $pairs += ('ARTIST=' + $tags.artist) }
  if ($tags.title)  { $pairs += ('TITLE=' + $tags.title) }
  if ($tags.album)  { $pairs += ('ALBUM=' + $tags.album) }
  if ($tags.date)   { $pairs += ('DATE=' + $tags.date) }
  if ($tags.genre)  { $pairs += ('GENRE=' + $tags.genre) }
  if ($lyric)       { $pairs += ('LYRICS=' + $lyric) }

  Push $vc (B_LE32 $pairs.Count)
  foreach ($p in $pairs) {
    $pb = [Text.Encoding]::UTF8.GetBytes($p)
    Push $vc (B_LE32 $pb.Length)
    Push $vc $pb
  }
  $vcData = $vc.ToArray()

  $all = @()
  foreach ($b in $keep) { $all += ,$b }
  $all += ,@{ type = 4; data = $vcData }
  if ($cover -and $cover.Length -gt 16) {
    $info = GetImageInfo $cover
    $all += ,@{ type = 6; data = (FlacPicture $cover $info) }
  }

  $out = NewMS
  Push $out ([Text.Encoding]::ASCII.GetBytes('fLaC'))
  for ($i = 0; $i -lt $all.Count; $i++) {
    $typ = [int]$all[$i].type
    if ($i -eq $all.Count - 1) { $typ = $typ -bor 0x80 }
    $blk = [byte[]]$all[$i].data
    $len = $blk.Length
    $hdr = [byte[]]::new(4)
    $hdr[0] = [byte]$typ
    $hdr[1] = [byte]([math]::Floor($len / 65536) % 256)
    $hdr[2] = [byte]([math]::Floor($len / 256) % 256)
    $hdr[3] = [byte]($len % 256)
    Push $out $hdr
    Push $out $blk
  }
  Push $out ([byte[]]$data[$audioOff..($data.Length - 1)])
  return ,($out.ToArray())
}

# ---------------------------------------------------------------- 主流程
try {
  if (-not (Test-Path -LiteralPath $job)) { Say 'ERR: job file not found'; exit 1 }

  $raw = ReadTextAuto $job
  $j = $raw | ConvertFrom-Json

  $file = [string]$j.file
  if (-not $file) { Say 'ERR: no file in job'; exit 1 }
  if (-not (Test-Path -LiteralPath $file)) { Say 'ERR: audio file not found'; exit 1 }

  $tags = @{
    title  = [string]$j.title
    artist = [string]$j.artist
    album  = [string]$j.album
    date   = [string]$j.date
    genre  = [string]$j.genre
  }

  $lyric = ''
  $lf = [string]$j.lyricFile
  if ($lf -and (Test-Path -LiteralPath $lf)) {
    $lyric = (ReadTextAuto $lf).Trim()
  }

  $cover = $null
  $cf = [string]$j.coverFile
  if ($cf -and (Test-Path -LiteralPath $cf)) {
    $cover = [IO.File]::ReadAllBytes($cf)
  }

  if (-not ($tags.title -or $tags.artist -or $tags.album -or $lyric -or $cover)) {
    Say 'SKIP: nothing to write'
    exit 2
  }

  $ext = [IO.Path]::GetExtension($file).ToLower()
  if ($ext -ne '.mp3' -and $ext -ne '.flac') {
    Say ('SKIP: unsupported ' + $ext)
    exit 2
  }

  $data = [IO.File]::ReadAllBytes($file)
  if ($data.Length -lt 512) { Say 'ERR: file too small'; exit 1 }

  if ($ext -eq '.mp3') { $out = ConvertMp3 $data $tags $lyric $cover }
  else                 { $out = ConvertFlac $data $tags $lyric $cover }

  if (-not $out -or $out.Length -lt 100) { Say 'ERR: bad output size'; exit 1 }

  $tmp = $file + '.lxtag'
  [IO.File]::WriteAllBytes($tmp, $out)

  try {
    $fi = Get-Item -LiteralPath $file
    if ($fi.IsReadOnly) { $fi.IsReadOnly = $false }
  } catch { }

  Move-Item -LiteralPath $tmp -Destination $file -Force

  # 把「封面到底写进去多少字节」报给面板，方便判断嵌图是否成功
  $coverBytes = 0
  if ($cover) { $coverBytes = $cover.Length }
  Say ('OK ' + $ext.TrimStart('.') + ' cover=' + $coverBytes + ' size=' + $out.Length)
  exit 0
}
catch {
  $msg = $_.Exception.Message
  if ($msg -match '[^\x00-\x7F]') { $msg = 'error(see console)' }
  Say ('ERR: ' + $msg)
  exit 1
}
