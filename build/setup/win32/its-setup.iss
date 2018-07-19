; use full mode by default
#define FullMode

[Setup]
AppId={#AppId}
AppName={#NameLong}
AppVerName={#NameVersion}
AppPublisher=XES
AppPublisherURL=https://rts.reallyedu.com/
AppSupportURL=https://rts.reallyedu.com/
AppUpdatesURL=https://rts.reallyedu.com/
DefaultDirName={sd}\{#DirName}
DefaultGroupName={#NameLong}
OutputDir={#OutputDir}
OutputBaseFilename={#OutputBaseFilename}

DisableDirPage=yes
DisableProgramGroupPage=yes
Compression=lzma
SolidCompression=yes
AppMutex={#AppMutex}
SetupMutex={#AppMutex}setup
; WizardImageFile={#RepoDir}\resources\win32\inno-big.bmp
; WizardSmallImageFile={#RepoDir}\resources\win32\inno-small.bmp
SetupIconFile={#RepoDir}\resources\win32\rts.ico
UninstallDisplayIcon={app}\{#ExeBasename}.exe
ChangesEnvironment=true
ChangesAssociations=true
MinVersion=6.1.7600
SourceDir={#SourceDir}
AppVersion={#Version}
VersionInfoVersion={#RawVersion}
;ShowLanguageDialog=auto
ArchitecturesAllowed={#ArchitecturesAllowed}
ArchitecturesInstallIn64BitMode={#ArchitecturesInstallIn64BitMode}
AppCopyright={#AppCopyright}

[Languages]
Name: "chs"; MessagesFile: "{#RepoDir}\build\setup\win32\i18n\Default.zh-cn.isl,{#RepoDir}\build\setup\win32\i18n\messages.zh-cn.isl"

[InstallDelete]
; Type: filesandordirs; Name: {app}\resources\app\plugins
; Type: filesandordirs; Name: {app}\resources\app\extensions
; Type: filesandordirs; Name: {app}\resources\app\node_modules
; Type: files; Name: {app}\resources\app\Credits_45.0.2454.85.html

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1
Name: "runcode"; Description: "{cm:RunAfter,{#NameShort}}"; GroupDescription: "{cm:Other}"; Check: WizardSilent

[Files]
#ifdef UpdateMode
#undef FullMode
  #ifdef IncludeNodeModule
    Source: "resources/*"; DestDir: "{app}/resources"; Flags: ignoreversion recursesubdirs createallsubdirs
  #endif
  #ifndef IncludeNodeModule
    Source: "resources\*"; Excludes: "node_modules\*"; DestDir: "{app}\resources"; Flags: ignoreversion recursesubdirs createallsubdirs
  #endif
#endif

#ifdef FullMode
  Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
#endif


[Icons]
Name: "{group}\{#NameLong}"; Filename: "{app}\{#ExeBasename}.exe"; AppUserModelID: "{#AppUserId}"
Name: "{commondesktop}\{#NameLong}"; Filename: "{app}\{#ExeBasename}.exe"; Tasks: desktopicon; AppUserModelID: "{#AppUserId}"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#NameLong}"; Filename: "{app}\{#ExeBasename}.exe"; Tasks: quicklaunchicon; AppUserModelID: "{#AppUserId}"

[Run]
Filename: "{app}\{#ExeBasename}.exe"; Description: "{cm:LaunchProgram,{#NameLong}}"; Tasks: runcode; Flags: nowait postinstall; Check: WizardSilent
Filename: "{app}\{#ExeBasename}.exe"; Description: "{cm:LaunchProgram,{#NameLong}}"; Flags: nowait postinstall skipifsilent; Check: WizardNotSilent

[Code]
function WizardNotSilent(): Boolean;
begin
  Result := not WizardSilent();
end;


