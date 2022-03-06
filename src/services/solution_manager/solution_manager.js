import fs from "fs";
import {Solution} from "./solution";

export default class {

    constructor(main_path, start_port) {
        this.main_path = main_path;
        this.start_port = start_port;
        this.storage_dir = this.main_path + '/storage';
        this.bin_dir = this.main_path + '/binaries';
        this.app_dir = this.main_path + '/apps';

        this.solutions = {};
    }

    async run_solutions(solutions) {
        for (let solution_index in solutions) {
            let solution = solutions[solution_index];
            const file = fs.readFileSync(solution);
            let config = JSON.parse(file.toString());
            await this.run_solution(config)
        }
    }

    get_solutions() {
        return this.solutions;
    }

    async run_solution(config) {
        let solution = new Solution(config, this.main_path);
        this.solutions[solution.id] = solution;
        solution.update();
        await solution.run();
        return solution;
    }

    async stop_solution(solution_id) {
        let solution = this.solutions[solution_id];
        if (solution === undefined) {
            throw "Cette solution n'existe pas: " + solution_id;
        }
        await solution.stop();
        delete this.solutions[solution_id];
    }

    async stop() {
        for (let solution_index in this.solutions) {
            let solution = this.solutions[solution_index];
            await solution.stop();
        }
    }

    show() {
        let solutions = []
        Object.keys(this.solutions).forEach((solution_id) => {
            let solution = this.solutions[solution_id];
            solutions.push(solution.show());
        })
        return solutions;
    }
}