import fs from "fs";

function read_config() {

    const file = fs.readFileSync("config.json");
    let config = JSON.parse(file.toString());
    return config;
}

export default read_config()