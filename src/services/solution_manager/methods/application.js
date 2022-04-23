import fs from "fs";
import {spawn} from "child_process";
import {make_id, unzip} from "js_tools";

var kill = require('tree-kill');

export class Application {
    constructor(config, main_path, resource_manager_controller) {
        this.main_path = main_path;
        this.resource_manager_controller = resource_manager_controller;
        console.log(this.resource_manager_controller);
        this.config = config;
        this.id = "application_" + make_id(8);
        this.name = this.config.name || this.id;
        this.status = {status: "init", code: 0}
        this.release_obj = null;
    }

    async resource_exist() {
        try {
            console.log(this.resource_manager_controller);
            return await this.resource_manager_controller.get_release(this.config.host, "apps", this.config.path, this.config.version);
        } catch (e) {
            console.log(e);
            throw "La resource n'existe pas: " + this.config.host + "/apps/" + this.config.path + "/" + this.config.version
        }
    }

    async import_resource() {
        try {
            console.log("Import resource: " + this.config.host + "/apps/" + this.config.path + "/" + this.config.version)
            return await this.resource_manager_controller.import_release(this.config.host, "apps", this.config.path, this.config.version);
        } catch (e) {
            throw "IMPORT La resource n'existe pas: " + this.config.host + "/apps/" + this.config.path + "/" + this.config.version
        }
    }

    async application_installed(version) {
        let app_path = this.main_path + "/apps/" + this.config.path + "_" + version;
        if (fs.existsSync(app_path + "/run.sh")) {
            console.log("Application already installed")
            return true;
        } else {
            console.log("Application not installed")
            return false;
        }
    }

    async install(version) {
        console.log("Installing " + this.config.host + "/apps/" + this.config.path + "/" + this.config.version)
        let app_path = this.main_path + "/apps/" + this.config.path + "_" + version;
        fs.mkdirSync(app_path, {recursive: true});
        let zip_path = this.main_path + "/storage/resource_manager-linux/" + this.config.host + "/apps/" + this.config.path + "/" + this.config.path + "_" + version + ".zip";
        await unzip(zip_path, app_path);

        if (this.config.version === 'latest') {
            let latest_path = this.main_path + "/apps/" + this.config.path + "_latest";
            if (fs.existsSync(latest_path)) {
                fs.unlinkSync(latest_path);
            }
            fs.symlinkSync(app_path, latest_path)
        }

        fs.chmodSync(app_path + "/install.sh", 0o755);
        return new Promise((resolve, reject) => {
            let process = spawn("./install.sh", {
                cwd: app_path
            });
            process.stdout.on('data', function (data) {
                console.log('stdout: ' + data.toString());
            });
            process.stderr.on('data', function (data) {

            });

            process.on('exit', async function (code) {
                resolve();
            });
        });
    }

    async prepare() {
        console.log("Preparing: /apps/" + this.config.path + "_" + this.config.version)
        if (this.config.version === 'latest') {
            if (!await this.application_installed('latest')) {
                let latest_release = await this.import_resource();
                await this.install(latest_release.version);
                this.current_release = latest_release;
            } else {
                let latest_release = await this.import_resource();
                if (!await this.application_installed(latest_release.version)) {
                    await this.install(latest_release.version);
                }
                this.current_release = latest_release;
            }
        } else {
            if (!await this.application_installed(this.config.version)) {
                let release = await this.import_resource();
                await this.install(release.version);
                this.current_release = release;
            }
        }
    }

    async run() {

        this.status.status = "run"
        let app_path = this.main_path + "/apps/" + this.config.path + "_" + this.config.version;
        const storage_path = (this.config.env.STORAGE_PATH !== undefined) ? (this.config.env.STORAGE_PATH) : (this.main_path + "/storage/" + this.config.path);
        fs.chmodSync(app_path + "/run.sh", 0o755);
        if (!fs.existsSync(storage_path)) {
            fs.mkdirSync(storage_path);
        }
        console.log("Running app:", this.config.name, this.config.path)
        let env = {
            ...this.config.env,
            STORAGE_PATH: storage_path,
        }
        for (let env_index in env) {
            if (env[env_index].constructor == Object) {
                env[env_index] = JSON.stringify(env[env_index]);
            }
        }
        console.log(env)
        this.process = spawn("./run.sh", {
            cwd: app_path,
            env: env
        });
        var self = this;
        return new Promise((resolve, reject) => {
            self.process.on('spawn', function (data) {
                self.status.status = "running"
                resolve();
            });
            self.process.on('error', function (data) {
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
            status: this.status,
            current_release: this.current_release
        }
    }
}