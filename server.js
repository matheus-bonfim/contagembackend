import express from 'express';
import cors from 'cors';
import { info_table, reset_counter } from './datab.js';
import { handleRequest, removeStream } from './streamer/main.js';

const HTTP_PORT = 3500


export function createServer(){
    


    const app = express();
    const corsOptions = {
        origin: '*',
        methods: ['GET', 'POST']
    }
    app.use(cors(corsOptions));

    app.use(express.json({type: 'application/json'}));

    app.get('/api/data', (req, res) => {
        res.json({message: "hello from the backend"});
    });
    
    app.get('/api/info', async (req, res) => {
        const res_db = await info_table();
        res.json(res_db)
    })

    app.get('/api/reset', async (req, res) => {
        const res_db = await reset_counter(req.query.ponto);
        res.json(res_db)
    })
    return app
}



const serverHTTP = createServer();
const procSHttp = serverHTTP.listen(HTTP_PORT, () => {
    console.log(`\n Server HTTP rodando em http://localhost:${HTTP_PORT}`);

});