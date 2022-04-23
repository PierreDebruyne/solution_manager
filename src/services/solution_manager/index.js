import SolutionManager from "./methods/solution_manager";
import routes from "./routes";
import {ResourceManagerController} from "resource_manager_controller";
import config from "../../config";

export class Solution_manager_service {

    solution_manager = null;

    constructor() {
        let storage_path = process.env.STORAGE_PATH || process.cwd();
        this.resource_manager_controller = new ResourceManagerController("localhost", Number.parseInt(port_start) + 2)
        this.solution_manager = new SolutionManager(storage_path, this.resource_manager_controller)
    }

    async init() {
        let mega_solution = {
            "name": "base",
            "check_for_update": false,
            "apps": [
                {
                    "name": "MongoDB",
                    "host": "localhost",
                    "path": "mongodb-linux",
                    "version": "latest",
                    "env": {
                        "PORT": Number.parseInt(port_start) + 1,
                        "DEBUG": debug
                    }
                },
                {
                    "name": "Resource Manager",
                    "host": "localhost",
                    "path": "resource_manager-linux",
                    "version": "latest",
                    "env": {
                        "MONGO_URL": "localhost",
                        "MONGO_PORT": Number.parseInt(port_start) + 1,
                        "MONGO_DB": "mega_resources",
                        "PORT": Number.parseInt(port_start) + 2,
                        "PARENT_URL": parent_url,
                        "PARENT_PORT": Number.parseInt(parent_port_start) + 2,
                        "DEBUG": debug
                    }
                }
            ]
        }
        await this.solution_manager.run_solution(mega_solution);
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        await sleep(2000);
    }

    routes(app) {
        routes(app, "/solution_manager", this.solution_manager);
    }

    async created() {
        let first_param = process.argv[2];
        console.log(first_param)
        if (first_param === 'update') {
            console.log("Updating...")
                this.auto_update().then(async () => {
                    await this.stop();
                    process.exit(0);
                }).catch(async (e) => {
                    console.log(e.message);
                    await this.stop();
                    process.exit(0);
                });

        } else {
            let solutions = process.argv.slice(2);
            console.log(solutions)
            await this.solution_manager.run_solutions(solutions);
        }
    }

    async stop() {
        await this.solution_manager.stop();
    }

    async auto_update() {
        let mega_solution = {
            "name": "base",
            "apps": [
                {
                    "name": "Solution Manager",
                    "host": "localhost",
                    "path": "solution_manager-linux",
                    "version": "latest"
                },
                {
                    "name": "MongoDB",
                    "host": "localhost",
                    "path": "mongodb-linux",
                    "version": "latest"
                },
                {
                    "name": "Resource Manager",
                    "host": "localhost",
                    "path": "resource_manager-linux",
                    "version": "latest",
                }
            ]
        }
        await this.solution_manager.update_solution(mega_solution);
    }
}

let port_start = config.PORT_START || "25000";
let debug = config.DEBUG || false;
let parent_url = config.PARENT_URL || 'localhost';
let parent_port_start = config.PARENT_PORT_START || '30000';