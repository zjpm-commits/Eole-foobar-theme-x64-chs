; ============================================================
; Eole 主题 x64 中文本地化版 —— Inno Setup 安装脚本
; 目标：释放主题文件到 foobar2000 根目录下的 profile 文件夹
; ============================================================

#define MyAppName "Eole 主题 x64 中文本地化版"
#define MyAppVersion "1.2.3b25chs"
#define MyAppPublisher "Eole-foobar-theme-x64-chs"
#define MyAppURL "https://github.com/Ottodix/Eole-foobar-theme"
#define Src "C:\Users\Administrator\Documents\GitHub\Eole-foobar-theme-x64-chs"

; 视频模式由 foo_ui_webview2 的 WebView2 面板承担，不再打包 foo_mpv

[Setup]
AppId={{8E1F4A52-6B0D-4E6E-9A3B-E01E00000001}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={code:GetDefaultFb2kRoot}
UsePreviousAppDir=yes
AppendDefaultDirName=no
DirExistsWarning=no
DisableProgramGroupPage=yes
OutputDir=release
OutputBaseFilename=Eole_x64_v{#MyAppVersion}_setup
SetupIconFile={#Src}\assets\setup.ico
UninstallIconFile={#Src}\assets\setup.ico
Compression=lzma2/max
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
WizardStyle=modern
PrivilegesRequired=admin
Uninstallable=yes
CreateUninstallRegKey=no

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Types]
Name: "full"; Description: "完整安装（全部组件）"
Name: "custom"; Description: "自定义安装（自行勾选组件）"; Flags: iscustom

[Components]
Name: "theme";        Description: "Eole 主题核心（必需，脚本 / 图片 / 样式）"; Types: full custom; Flags: fixed
Name: "fontsremix";   Description: "图标字体 Remix Icon（图标字符主用，建议勾选；用户级安装，免管理员）"; Types: full custom
Name: "fontsfluent";  Description: "补位字体 Segoe Fluent Icons（Win11 一般已自带，仅在缺字时勾选）"; Types: custom
Name: "lxbox";        Description: "Lxbox 洛雪音源脚本（必需）"; Types: full custom; Flags: fixed
Name: "eolesettings"; Description: "eole-settings 个人配置面板"; Types: full custom
Name: "jsplitter";    Description: "foo_uie_jsplitter 组件（必装插件）"; Types: full custom
Name: "eslyric";      Description: "foo_uie_eslyric 组件（歌词）"; Types: full custom
Name: "openhacks";    Description: "foo_openhacks 组件（无边框模式）"; Types: full custom
Name: "webview2";     Description: "foo_ui_webview2 组件（视频模式，替代 foo_mpv）"; Types: full custom
Name: "playcount";    Description: "foo_playcount 组件（播放统计）"; Types: full custom
Name: "yttm";         Description: "yttm 个人面板配置"; Types: full custom
Name: "cfg";          Description: "组件配置文件（configuration\*.cfg，会覆盖现有组件设置）"; Types: full custom

[Files]
; ---- 主题核心 ----
Source: "{#Src}\Eole\*"; DestDir: "{app}\profile\Eole"; Components: theme; Flags: recursesubdirs ignoreversion
Source: "{#Src}\Lxbox\*"; DestDir: "{app}\profile\Lxbox"; Components: lxbox; Flags: recursesubdirs ignoreversion

; ---- 个人配置 ----
Source: "{#Src}\assets\eole-settings\*"; DestDir: "{app}\profile\Eole\eole-settings"; Components: eolesettings; Flags: recursesubdirs ignoreversion
Source: "{#Src}\assets\yttm\*"; DestDir: "{app}\profile\yttm"; Components: yttm; Flags: recursesubdirs ignoreversion

; ---- 用户组件（五个独立勾选项）----
Source: "{#Src}\user-components-x64\foo_uie_jsplitter\*"; DestDir: "{app}\profile\user-components-x64\foo_uie_jsplitter"; Components: jsplitter; Flags: recursesubdirs ignoreversion
Source: "{#Src}\user-components-x64\foo_uie_eslyric\*"; DestDir: "{app}\profile\user-components-x64\foo_uie_eslyric"; Components: eslyric; Flags: recursesubdirs ignoreversion
Source: "{#Src}\user-components-x64\foo_openhacks\*"; DestDir: "{app}\profile\user-components-x64\foo_openhacks"; Components: openhacks; Flags: recursesubdirs ignoreversion
Source: "{#Src}\user-components-x64\foo_ui_webview2\*"; DestDir: "{app}\profile\user-components-x64\foo_ui_webview2"; Components: webview2; Flags: recursesubdirs ignoreversion
Source: "{#Src}\user-components-x64\foo_playcount\*"; DestDir: "{app}\profile\user-components-x64\foo_playcount"; Components: playcount; Flags: recursesubdirs ignoreversion

; ---- 视频模板 ----
; assets\webview-ui\video\index.html 落到 profile\webview-ui\video。
; 模板必须在 webview-ui 下，页面才走受信虚拟主机 https://foo-ui-webview2.local/，
; media.getStreamUrl 才可用；面板按模板名 "video" 加载它。
Source: "{#Src}\assets\webview-ui\*"; DestDir: "{app}\profile\webview-ui"; Components: webview2; Flags: recursesubdirs ignoreversion

; ---- 其他配置 ----
Source: "{#Src}\assets\configuration\*"; DestDir: "{app}\profile\configuration"; Components: cfg; Flags: ignoreversion

; ---- 附带配置与主题文件（始终安装）----
Source: "{#Src}\assets\payload\config.sqlite"; DestDir: "{app}\profile"; Flags: ignoreversion
Source: "{#Src}\assets\payload\theme.fth"; DestDir: "{app}\profile"; Flags: ignoreversion
Source: "{#Src}\assets\payload\DUI_Eole_x64.fth"; DestDir: "{app}\themes"; Flags: ignoreversion

; ---- 字体（可选组件，系统级安装，需要管理员）----
; Remix Icon 供图标字符主用，默认勾选；Segoe Fluent Icons 供 Win10 缺字时补位，默认不勾。
; 释放到 C:\Windows\Fonts（{commonfonts}）。Check 先查是否已装（注册值或任一常见路径），
; 已装则整条跳过——不复制、不覆盖、不注册，避免同一族名出现两份。
; uninsneveruninstall：卸载时保留字体文件和注册值，字体继续可用。
; FontInstall 让 Setup 在本次会话内注册字体，[Registry] 负责持久化。
Source: "{#Src}\assets\fonts\RemixIcon.ttf"; DestDir: "{commonfonts}"; DestName: "remixicon.ttf"; Components: fontsremix; Check: NeedFontRemix; Flags: ignoreversion uninsneveruninstall; FontInstall: "remixicon"
Source: "{#Src}\assets\fonts\Segoe Fluent Icons.ttf"; DestDir: "{commonfonts}"; Components: fontsfluent; Check: NeedFontFluent; Flags: ignoreversion uninsneveruninstall; FontInstall: "Segoe Fluent Icons"

[Registry]
; 字体注册（HKLM；[Registry] 默认卸载不删除安装创建的值，故不写任何 uninsdelete* 标志）
; 已设 ArchitecturesInstallIn64BitMode=x64compatible，64 位安装模式下默认写入注册表 64 位视图
; Check 与 [Files] 同源，已装则跳过，避免写入指向不存在文件的路径
Root: HKLM; Subkey: "Software\Microsoft\Windows NT\CurrentVersion\Fonts"; ValueType: string; ValueName: "remixicon (TrueType)"; ValueData: "{commonfonts}\remixicon.ttf"; Components: fontsremix; Check: NeedFontRemix
Root: HKLM; Subkey: "Software\Microsoft\Windows NT\CurrentVersion\Fonts"; ValueType: string; ValueName: "Segoe Fluent Icons (TrueType)"; ValueData: "{commonfonts}\Segoe Fluent Icons.ttf"; Components: fontsfluent; Check: NeedFontFluent

[Messages]
SelectDirDesc=选择 foobar2000 根目录
SelectDirLabel3=安装程序会把主题文件释放到所选 foobar2000 根目录下的 profile 文件夹。
SelectDirBrowseLabel=请确认下面的目录是 foobar2000 的根目录（即 foobar2000.exe 所在目录），然后点击“下一步”。

[Code]
function AddFontResourceW(lpFilename: String): Integer;
  external 'AddFontResourceW@gdi32.dll stdcall';

function FontValueExists(ValueName: String): Boolean;
var
  S: String;
begin
  Result := RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts', ValueName, S)
         or RegQueryStringValue(HKCU, 'Software\Microsoft\Windows NT\CurrentVersion\Fonts', ValueName, S);
end;

function NeedFontRemix: Boolean;
begin
  Result := not (
    FontValueExists('remixicon (TrueType)') or
    FileExists(ExpandConstant('{commonfonts}\remixicon.ttf')) or
    FileExists(ExpandConstant('{userfonts}\remixicon.ttf'))
  );
end;

function NeedFontFluent: Boolean;
begin
  Result := not (
    FontValueExists('Segoe Fluent Icons (TrueType)') or
    FileExists(ExpandConstant('{commonfonts}\SegoeIcons.ttf')) or
    FileExists(ExpandConstant('{commonfonts}\Segoe Fluent Icons.ttf'))
  );
end;

procedure RegisterBundledFonts;
var
  F: String;
begin
  if IsComponentSelected('fontsremix') then
  begin
    F := ExpandConstant('{commonfonts}\remixicon.ttf');
    if not FileExists(F) then F := ExpandConstant('{userfonts}\remixicon.ttf');
    if FileExists(F) then AddFontResourceW(F);
  end;
  if IsComponentSelected('fontsfluent') then
  begin
    F := ExpandConstant('{commonfonts}\Segoe Fluent Icons.ttf');
    if FileExists(F) then AddFontResourceW(F);
  end;
end;

function GetDefaultFb2kRoot(Param: string): string;
begin
  if DirExists(ExpandConstant('{pf}\foobar2000')) then
    Result := ExpandConstant('{pf}\foobar2000')
  else if DirExists('D:\foobar2k\foobar2000') then
    Result := 'D:\foobar2k\foobar2000'
  else
    Result := ExpandConstant('{userdocs}\foobar2000');
end;

function IsFoobarRunning: Boolean;
var
  WMI, Objs: Variant;
begin
  Result := False;
  try
    WMI := CreateOleObject('WbemScripting.SWbemLocator');
    Objs := WMI.ConnectServer('.', 'root\cimv2').ExecQuery('SELECT Name FROM Win32_Process WHERE Name=''foobar2000.exe''');
    Result := Objs.Count > 0;
  except
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): string;
begin
  Result := '';
  if IsFoobarRunning then
    Result := '检测到 foobar2000 正在运行。' #13#10 '请先关闭 foobar2000，然后重新运行本安装程序。';
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    RegisterBundledFonts;
    MsgBox('安装完成！' #13#10 #13#10
      + '请在 foobar2000 中按以下方式导入主题：' #13#10
      + '文件 → 参数选项 → 默认用户界面 → 导入主题' #13#10
      + '（或：参数选项 → 默认用户界面 → 快速设置 → 选择 DUI_Eole_x64.fth）' #13#10
      + '主题文件位于 profile\Eole\DUI_Eole_x64.fth 与 themes\DUI_Eole_x64.fth。' #13#10 #13#10
      + '若默认字体偏小：Ctrl + 鼠标滚轮 全局缩放，Shift + 鼠标滚轮 调整行间距。',
      mbInformation, MB_OK);
  end;
end;
