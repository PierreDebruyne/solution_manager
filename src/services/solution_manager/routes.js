export default (app, route_path, solution_manager) => {
    app.get(route_path + "/solutions", async (req, res) => {
        try {

            let response = solution_manager.show();
            return res.status(200).json(response).end();
        } catch (e) {
            console.log(e)
            return res.status(500).json(e.message).end();
        }
    })

    app.post(route_path + "/solutions", async (req, res) => {
        try {
            let solution_config = req.body.solution
            if (!solution_config) {
                return res.status(400).json("Wrong body").end();
            }

            let solution = await solution_manager.run_solution(solution_config);
            console.log(solution)
            return res.status(200).json(solution.show()).end();
        } catch (e) {
            console.log(e)
            return res.status(500).json(e.message).end();
        }
    })
    app.delete(route_path + "/solutions/:solution_id", async (req, res) => {
        try {
            let solution_id = req.params.solution_id;
            if (!solution_id) {
                return res.status(400).json("Wrong params").end();
            }

            let response = {};
            await solution_manager.stop_solution(solution_id);

            return res.status(200).json(response).end();
        } catch (e) {
            console.log(e)
            return res.status(500).json(e.message).end();
        }
    })
}