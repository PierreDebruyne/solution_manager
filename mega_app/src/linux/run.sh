if [ -f "$STORAGE_PATH"/Mega ]; then
  echo "$STORAGE_PATH exists."
  cd $STORAGE_PATH &&
  ./Mega update &&
  ./Mega
else
    echo "$STORAGE_PATH does not exist."


  cd $STORAGE_PATH &&
  wget http://localhost:30002/resources/hosts/localhost/types/installers/resources/mega_installer-linux/releases/latest/download -O mega_installer &&

  chmod +x mega_installer &&
  echo pwd &&
  ./mega_installer '' &&
  ./Mega
  exit 0
fi