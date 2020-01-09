DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function loadFile {
  VARS=$(grep -v '^#' $1 | xargs -0)
  if [[ "$VARS" ]]; then
    export $VARS
  fi
}

loadFile "$DIR/local.config"