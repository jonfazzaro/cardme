on run {input, parameters}

	set homeDir to POSIX path of (path to home folder)
	set js to read POSIX file (homeDir & "scripts/cardme.js")

	tell application "Safari"
		tell front document
			do JavaScript js
		end tell

		delay 1
		repeat
			if name of front document is not "Carding..." then exit repeat
			delay 0.5
		end repeat

		set result to name of front document
	end tell

	return result
end run