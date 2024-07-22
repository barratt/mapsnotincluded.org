#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

; Set the title of the window
SetTitleMatchMode, 2  ; This allows partial matching of window titles
windowTitle := "Oxygen Not Included"
; Ensure game is set to windowed 1024x768, press alt c, enjoy folder full of saves


; Hotkey to trigger the click (e.g., Ctrl + Alt + C)
!c::
Loop {
    ; Check if the window is active
    IfWinExist, %windowTitle%
    {
        ; Make the window active
        WinActivate
        
        MouseMove, 950, 275, 0  ; The last parameter is the speed (0 means instant)
        Click 

        Sleep 200

        MouseMove, 400, 400, 0
        Click

        Sleep 200
        Click

        Sleep 200
        MouseMove, 479, 358, 0 ; Shuffle
        Click


        MouseMove 820, 775
        Click
        
        Loop ; Wait for duplicant select menu
        {
            ; Search for the pixel color at the specified coordinates
            PixelGetColor, foundColor, 300, 180, RGB
            
            ; Check if the found color matches the desired color
            if (foundColor = 0x7f3d5e)
            {
                break
            }
            
            ; Optional: Add a small delay to prevent high CPU usage
            Sleep, 100
        }

        MouseMove 850, 730
        Click

        ; Wait for begin
        Loop 
        {
            PixelGetColor, foundColor, 550, 510, RGB

            if (foundColor = 0x874566)
            {
                break
            }

            ; MsgBox, %foundColor%
        
            Sleep, 100
        }

        Sleep 1000

        MouseMove 550, 510
        Click

        Sleep 3000

        Send {Escape}

        Sleep 200
        MouseMove 525, 514
        Click

        Sleep 200
        MouseMove 525, 430
        Click

        
        ; Wait for new game button
        Loop 
        {
            PixelGetColor, foundColor, 950, 275, RGB

            if (foundColor = 0x3e4357)
            {
                break
            }
        
            Sleep, 100
        }

        Sleep 100

    }
    else
    {
        MsgBox, Window "%windowTitle%" not found!
    }
}
return



; Hotkey to reload the script
^r::Reload  ; Ctrl+r to reload the script