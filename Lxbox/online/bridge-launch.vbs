' wscript launcher.vbs <node> <app> <data> <key> <sources> <port>  隐藏启动桥
Dim c, a, i
Set a = WScript.Arguments
c = """" & a(0) & """ """ & a(1) & """ --data """ & a(2) & """ --key " & a(3) & " --sources """ & a(4) & """ --port " & a(5)
CreateObject("WScript.Shell").Run c, 0, False
