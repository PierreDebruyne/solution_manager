if [ -f "$STORAGE_PATH" ]; then
  echo "$STORAGE_PATH exists."
else
    echo "$STORAGE_PATH does not exist."

  wget http://localhost:25565/resources/localhost/types/installers/resources/mega_installer/releases/latest/download -O "$STORAGE_PATH"/mega_installer

  chmod +x mega_installer
  ./"$STORAGE_PATH"mega_installer $STORAGE_PATH
  exit 0
fi
