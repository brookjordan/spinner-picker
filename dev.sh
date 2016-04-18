[ `uname -s` != "Darwin" ] && return

function tab () {
  local cmd=""
  local cdto="$PWD"
  local args="$@"

  if [ -d "$1" ]; then
    cdto=`cd "$1"; pwd`
    args="${@:2}"
  fi

  if [ -n "$args" ]; then
    cmd="; $args"
  fi

  osascript &>/dev/null <<EOF
    tell application "iTerm"
      tell current terminal
        launch session "Default Session"
        tell the last session
          write text "cd \"$cdto\"$cmd"
        end tell
      end tell
    end tell
EOF
}

npm run setup;
tab "npm run pages:watch";
tab "npm run styles:watch";
npm run scripts:watch;
