on run {input, parameters}

  set homeDir to POSIX path of (path to home folder)
  set js to read POSIX file (homeDir & "scripts/cardme.js")
  set waitForIt to 2

  tell application "Safari"

    tell front document to repeat
      do JavaScript "document.readyState"
      if the result = "complete" then exit repeat
      delay waitForIt
    end repeat

    tell front document to do JavaScript js

    delay waitForIt
    repeat
      if name of front document is not "Carding..." then exit repeat
      delay waitForIt
    end repeat

    set result to name of front document
  end tell

  return result
end run