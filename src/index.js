import express from 'express';
import bodyParser from "body-parser";
import {Solution_manager_service} from "./services/solution_manager";
import cors from "cors";
import config from "./config"

var corsOptions = {
    origin: function (origin, callback) {
        console.log(origin)
        callback(null, true)
        /*if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }*/
    }
}



let port_start = config.PORT_START || "25000";

let solution_manager_service = new Solution_manager_service();


    solution_manager_service.init().then(() => {
        const app = express()

        app.use(bodyParser.json({limit: '1000mb', extended: true}))

        app.get('/', function (req, res) {
            res.send('Hello World')
        })

        app.post('/stop', function(req, res) {
            setTimeout(async ()=> {
                await solution_manager_service.stop()
                process.exit();
            }, 2000);
            return res.status(200).json({}).end();
        });

        app.use(cors(corsOptions));

        solution_manager_service.routes(app);


        app.listen(port_start, async () => {
            console.log('Server ready!')
            console.log('Listening on port', port_start)
            try {
                await solution_manager_service.created();

            } catch (e) {
                console.log(e);
            }
        })
    });