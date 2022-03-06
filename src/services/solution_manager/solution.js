import {Application} from "./application";
import {makeid} from "../../tools";

export class Solution {
    constructor(config, main_path) {
        this.main_path = main_path;
        this.config = config;
        this.id = "solution_" + makeid(4);
        this.name = this.config.name || this.id
        this.applications = {};
        if (config.apps) {
            for (let appIndex in config.apps) {
                let app_config = config.apps[appIndex];
                let application = new Application(app_config, main_path);
                this.applications[application.id] = application;
            }
        }
    }

    update() {
        let must_update = this.config.check_for_update || true
        if (must_update) {
            for (let application_index in this.applications) {
                let application = this.applications[application_index];
                application.update();
            }
        }
    }

    async run() {
        for (let application_index in this.applications) {
            let application = this.applications[application_index];
            await application.run();
        }
    }

    async stop() {
        for (let application_index in this.applications) {
            console.log(application_index)
            let application = this.applications[application_index];
            await application.stop();
            delete this.applications[application_index];
        }
    }

    show() {
        let applications = []
        Object.keys(this.applications).forEach((application_id) => {
            let application = this.applications[application_id];
            applications.push(application.show());
        })
        return {
            name: this.name,
            id: this.id,
            config: this.config,
            applications: applications
        }
    }
}