import fs from "fs";
import {spawn} from "child_process";
import {makeid} from "../../tools";
var kill  = require('tree-kill');

export class Application {
    constructor(config, main_path) {
        this.main_path = main_path;
        this.config = config;
        this.id = "application_" + makeid(8);
        this.name = this.config.name || this.id;
        this.status = {status: "init", code: 0}
    }

    update() {
        this.status.status = "update"
        if (this.config.version === 'latest') {
            console.log("Check for update:", this.config.path + "/apps/ + " + this.config.name)
            console.log("No new update");
        }
    }

    async run() {
        this.status.status = "run"
        let app_path = this.main_path + "/apps/" + this.config.path + "_" + this.config.version;
        const storage_path = (this.config.env.STORAGE_PATH !== undefined) ? (this.main_path + "/" + this.config.env.STORAGE_PATH) : (this.main_path + "/storage/" + this.config.path);
        fs.chmodSync(app_path + "/run.sh", 0o755);
        if (!fs.existsSync(storage_path)) {
            fs.mkdirSync(storage_path);
        }
        console.log("Running app:", this.config.name, this.config.path)
        let env = {
            ...this.config.env,
            STORAGE_PATH: storage_path,

        }
        console.log(env)
        this.process = spawn("./run.sh", {
            cwd: app_path,
            env: env
        });
        var self = this;
        return new Promise((resolve, reject) => {
            self.process.on('spawn', function(data) {
                self.status.status = "running"
                resolve();
            });
            self.process.on('error', function(data) {
                console.log('spawn: ' + data.toString());
                self.status.status = "error"
            });
            self.process.stdout.on('data', function (data) {
               console.log(data.toString());
            });
            self.process.stderr.on('data', function (data) {
                console.log(data.toString());
            });


            self.process.on('exit', function (code) {
                self.status.status = "exited"
                self.status.code = code;
                console.log(self.config.name, 'exited with code ' + code);
                console.log(env)
                if (code !== 0) {
                    reject();
                }

            });
        });
    }

    async stop() {
        var self = this;
        return new Promise((resolve, reject) => {
            if (self.status.status === "running") {
                self.process.on('exit', function (code) {
                    self.status.status = "exited"
                    self.status.code = code;
                    console.log(self.config.name, 'exited with code ' + code);
                    resolve();
                });
                kill(self.process.pid);
            } else {
                resolve();
            }
        })
    }

    show() {
        return {
            name: this.name,
            id: this.id,
            config: this.config,
            status: this.status
        }
    }
}