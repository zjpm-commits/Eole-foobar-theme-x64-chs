; ============================================================
; Eole 主题 x64 中文本地化版 —— Inno Setup 安装脚本
; 目标：释放主题文件到 foobar2000 根目录下的 profile 文件夹
; ============================================================

#define MyAppName "Eole 主题 x64 中文本地化版"
#define MyAppVersion "1.2.3b25chs"
#define MyAppPublisher "Eole-foobar-theme-x64-chs"
#define MyAppURL "https://github.com/Ottodix/Eole-foobar-theme"
#define Src "C:\Users\Administrator\Documents\GitHub\Eole-foobar-theme-x64-chs"

; 1 = 含 foo_mpv 插件与 MPV 配置；0 = 不含（编译时用 /DMyMpv=0 生成 nompv 版）
#ifndef MyMpv
  #define MyMpv "1"
#endif

#if MyMpv == "1"
  #define NameSuffix ""
#else
  #define NameSuffix "(nompv)"
#endif

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
OutputBaseFilename=Eole_x64_v{#MyAppVersion}{#NameSuffix}_setup
SetupIconFile={#Src}\assets\setup.ico
UninstallIconFile={#Src}\assets\setup.ico
Compression=lzma2/max
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
WizardStyle=modern
PrivilegesRequired=lowest
Uninstallable=yes
CreateUninstallRegKey=no

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Types]
Name: "full"; Description: "完整安装（全部组件）"
Name: "custom"; Description: "自定义安装（自行勾选组件）"; Flags: iscustom

[Components]
Name: "theme";        Description: "Eole 主题核心（必需，含 DUI_eole_x64_chs.fth）"; Types: full custom; Flags: fixed
Name: "lxbox";        Description: "Lxbox 洛雪音源脚本（必需）"; Types: full custom; Flags: fixed
Name: "eolesettings"; Description: "eole-settings 个人配置面板"; Types: full custom
Name: "jsplitter";    Description: "foo_uie_jsplitter 组件（必装插件）"; Types: full custom
Name: "eslyric";      Description: "foo_uie_eslyric 组件（歌词）"; Types: full custom
Name: "openhacks";    Description: "foo_openhacks 组件（无边框模式）"; Types: full custom
#if MyMpv == "1"
Name: "mpvcomp";      Description: "foo_mpv 组件（视频模式）"; Types: full custom
#endif
Name: "playcount";    Description: "foo_playcount 组件（播放统计）"; Types: full custom
#if MyMpv == "1"
Name: "mpvcfg";       Description: "MPV 播放器配置（mpv.conf / input.conf）"; Types: full custom
#endif
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
#if MyMpv == "1"
Source: "{#Src}\user-components-x64\foo_mpv\*"; DestDir: "{app}\profile\user-components-x64\foo_mpv"; Components: mpvcomp; Flags: recursesubdirs ignoreversion
#endif
Source: "{#Src}\user-components-x64\foo_playcount\*"; DestDir: "{app}\profile\user-components-x64\foo_playcount"; Components: playcount; Flags: recursesubdirs ignoreversion

; ---- 其他配置 ----
#if MyMpv == "1"
Source: "{#Src}\assets\mpv\*"; DestDir: "{app}\profile\mpv"; Components: mpvcfg; Flags: ignoreversion
#endif
Source: "{#Src}\assets\configuration\*"; DestDir: "{app}\profile\configuration"; Components: cfg; Flags: ignoreversion

; ---- 附带配置与主题文件（始终安装）----
Source: "{#Src}\assets\payload\config.sqlite"; DestDir: "{app}\profile"; Flags: ignoreversion
Source: "{#Src}\assets\payload\theme.fth"; DestDir: "{app}\profile"; Flags: ignoreversion
Source: "{#Src}\assets\payload\DUI_Eole_x64.fth"; DestDir: "{app}\themes"; Flags: ignoreversion

[Messages]
SelectDirDesc=选择 foobar2000 根目录
SelectDirLabel3=安装程序会把主题文件释放到所选 foobar2000 根目录下的 profile 文件夹。
SelectDirBrowseLabel=请确认下面的目录是 foobar2000 的根目录（即 foobar2000.exe 所在目录），然后点击“下一步”。

[Code]
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
    MsgBox('安装完成！' #13#10 #13#10
      + '请在 foobar2000 中按以下方式导入主题：' #13#10
      + '文件 → 参数选项 → 默认用户界面 → 导入主题' #13#10
      + '（或：参数选项 → 默认用户界面 → 快速设置 → 选择 DUI_Eole_x64.fth）' #13#10
      + '主题文件位于 profile\Eole\DUI_eole_x64_chs.fth 与 themes\DUI_Eole_x64.fth。' #13#10 #13#10
      + '若默认字体偏小：Ctrl + 鼠标滚轮 全局缩放，Shift + 鼠标滚轮 调整行间距。',
      mbInformation, MB_OK);
end;
