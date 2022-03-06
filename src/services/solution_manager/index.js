import SolutionManager from "./solution_manager";
import routes from "./routes";

export class Solution_manager_service {

    solution_manager = null;

    constructor() {
        let storage_path = process.env.STORAGE_PATH || process.cwd();
        this.solution_manager = new SolutionManager(storage_path)
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
                        "DEBUG": debug
                    }
                }
            ]
        }
        await this.solution_manager.run_solution(mega_solution)
    }

    routes(app) {
        routes(app, "/solution_manager", this.solution_manager);
    }

    async created() {
        let solutions = process.argv.slice(2);
        await this.solution_manager.run_solutions(solutions);
    }

    async stop() {
        await this.solution_manager.stop();
    }
}

let port_start = process.env.PORT_START || "25000";
let debug = process.env.DEBUG || false;