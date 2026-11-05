// Eole DWM frame patch: works with both Columns UI and Default UI.
// One-shot: no resident process, no system settings, nothing left behind.
using System;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text;

internal static class EoleBorder
{
    // DWMWA_BORDER_COLOR / DWMWA_CAPTION_COLOR (Windows 11).
    private const int BorderColor = 34;
    private const int CaptionColor = 35;

    // Columns UI host window, and the stock foobar2000 window class used by Default UI.
    private const string ColumnsClass = "{E7076D1C-A7BF-4f39-B771-BCBE88F2A2A8}";
    private const string DefaultUiClass = "{97E27FAA-C0B3-4b8e-A693-ED7881E99FC1}";

    private const int MinWindowSize = 200;

    private delegate bool EnumProc(IntPtr hwnd, IntPtr param);

    [DllImport("user32.dll")] private static extern bool EnumWindows(EnumProc callback, IntPtr param);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetClassName(IntPtr hwnd, StringBuilder name, int size);
    [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern IntPtr SendMessage(IntPtr hwnd, uint message, IntPtr wParam, ref WindowPos position);
    [DllImport("dwmapi.dll")] private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, ref uint value, int size);
    [DllImport("dwmapi.dll")] private static extern int DwmGetWindowAttribute(IntPtr hwnd, int attribute, out uint value, int size);

    [StructLayout(LayoutKind.Sequential)] private struct Rect { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)] private struct WindowPos { public IntPtr Hwnd, After; public int X, Y, Width, Height; public uint Flags; }

    private static bool IsFoobar(IntPtr hwnd)
    {
        uint pid;
        GetWindowThreadProcessId(hwnd, out pid);
        if (pid == 0) return false;
        try
        {
            using (var process = Process.GetProcessById((int)pid))
                return string.Equals(process.ProcessName, "foobar2000", StringComparison.OrdinalIgnoreCase);
        }
        catch { return false; }
    }

    // 1st pass: the two known host classes. 2nd pass: biggest visible foobar2000 window.
    private static IntPtr FindTarget()
    {
        IntPtr exact = IntPtr.Zero;
        IntPtr biggest = IntPtr.Zero;
        int biggestArea = 0;

        EnumWindows(delegate(IntPtr hwnd, IntPtr param)
        {
            if (!IsWindowVisible(hwnd)) return true;
            if (!IsFoobar(hwnd)) return true;

            var name = new StringBuilder(128);
            GetClassName(hwnd, name, name.Capacity);
            string cls = name.ToString();
            if (cls == ColumnsClass || cls == DefaultUiClass) { exact = hwnd; return false; }

            Rect r;
            if (!GetWindowRect(hwnd, out r)) return true;            int w = r.Right - r.Left;
            int h = r.Bottom - r.Top;
            if (w < MinWindowSize || h < MinWindowSize) return true;
            if (w * h > biggestArea) { biggestArea = w * h; biggest = hwnd; }
            return true;
        }, IntPtr.Zero);

        return exact != IntPtr.Zero ? exact : biggest;
    }

    [STAThread] private static int Main(string[] args)
    {
        uint rgb;
        if (args.Length != 1 || !uint.TryParse(args[0], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out rgb) || rgb > 0xFFFFFF) return 2;
        uint colorRef = ((rgb & 255) << 16) | (rgb & 0xFF00) | ((rgb >> 16) & 255);

        IntPtr hwnd = FindTarget();
        if (hwnd == IntPtr.Zero) return 3;

        try
        {
            uint observed;
            uint noBorder = 0xFFFFFFFE; // DWMWA_COLOR_NONE keeps the rounded corners.
            int hr = DwmSetWindowAttribute(hwnd, BorderColor, ref noBorder, 4);

            // CUI: the retained resize strip above a custom caption uses this color.
            // DUI: the system caption bar gets this color (Windows 11 22H2 and later).
            DwmSetWindowAttribute(hwnd, CaptionColor, ref colorRef, 4);

            // Columns UI resizes its children on WM_WINDOWPOSCHANGED, whereas changing the
            // frame only produces WM_SIZE. Re-notify with the current geometry; do not move
            // or resize the window.
            Rect bounds;
            if (GetWindowRect(hwnd, out bounds))
            {
                var position = new WindowPos { Hwnd = hwnd, X = bounds.Left, Y = bounds.Top,
                    Width = bounds.Right - bounds.Left, Height = bounds.Bottom - bounds.Top, Flags = 0x16 };
                SendMessage(hwnd, 0x47, IntPtr.Zero, ref position);
            }

            return hr == 0 && DwmGetWindowAttribute(hwnd, BorderColor, out observed, 4) == 0 && observed == noBorder ? 0 : 4;
        }
        catch { return 5; }
    }
}
