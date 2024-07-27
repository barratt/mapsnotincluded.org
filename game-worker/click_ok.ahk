; Sometimes the game says more than one instance, when there isnt. This script will click the OK button automatically

#Persistent  ; Keeps the script running indefinitely
SetTitleMatchMode, 2  ; Allows partial matching of window titles

; Loop to keep checking for the message box
Loop
{
    ; Check for the presence of a window with a title containing "Error"
    IfWinExist, Fatal error
    {
        ; If the window is found, activate it
        WinActivate
        ; Send the {Enter} key to click the OK button
        Send, {Enter}
    }
    ; Wait for 1 second before checking again
    Sleep, 1000
}