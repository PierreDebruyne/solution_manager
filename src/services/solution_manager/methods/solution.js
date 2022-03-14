import {Application} from "./application";
import {make_id} from "js_tools";

export class Solution {
    constructor(config, main_path, resource_manager_controller) {
        this.main_path = main_path;
        this.resource_manager_controller = resource_manager_controller;
        console.log(this.resource_manager_controller);

        this.config = config;
        this.id = "solution_" + make_id(4);
        this.name = this.config.name || this.id
        this.applications = {};
        if (config.apps) {
            for (let appIndex in config.apps) {
                let app_config = config.apps[appIndex];
                let application = new Application(app_config, main_path, this.resource_manager_controller);
                this.applications[application.id] = application;
            }
        }
    }

    async update() {
        let must_update = (this.config.check_for_update === undefined) ? true : this.config.check_for_update
        if (must_update) {
            for (let application_index in this.applications) {
                let application = this.applications[application_index];
                await application.prepare();
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