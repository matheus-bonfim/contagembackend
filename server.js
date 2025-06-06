import express from 'express';
import cors from 'cors';
import { delete_waiting_cams, delete_cam_contagem, get_cam_ip, info_table, insert_cam_contagem, reset_counter, start_counting } from './datab.js';
import { handleRequest, listActiveContainers, removeStream } from './streamer/main.js';
import { stop_machine } from './api-machine.js';

const HTTP_PORT = 3500


export function createServer(){
    
    //setInterval(delete_waiting_cams, 1000);


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

    app.get('/api/infocam', async (req, res) => {
        const res_db = await info_table(req.query.ponto);
        res.json(res_db)
    })

    app.get('/api/reset', async (req, res) => {
        const res_db = await reset_counter(req.query.ponto);
        res.json(res_db)
    })

    app.get('/api/watch', async (req, res) => {
        let ports = false;
        const ip = await get_cam_ip(req.query.cam);
        if(ip){
            ports = await handleRequest(req.query.cam, ip);
        }
        if(ports){
            res.json(ports)
        }
        else{
            res.json({})
        }
    })
    
    app.get('/api/remove', async (req, res) => {
        await removeStream(req.query.cam);
        res.status(202).send("deletado");
    })

    app.get('/api/listActiveStreams', async (req, res) => {
        const list = await listActiveContainers();
        res.status(202).json(list);
    })

    app.get('/api/insertcamContagem', async (req, res) => {
        const r = await insert_cam_contagem(req.query.ponto);
        res.status(202).send(r);
    })

    app.get('/api/startContagem', async (req, res) => {
        const r = await start_counting(req.query.ponto, req.query.p1, req.query.p2);
        if(r.affectedRows > 0){
            res.status(202).send("Contagem ativada");
        }
        else {
            res.send("Erro");
        }
    })

    app.get('/api/stopContagem', async (req, res) => {
        const r = await stop_machine(req.query.ponto);
        
        res.status(202).send(r)
    })
    
    app.get('/api/deletecamContagem', async (req, res) => {
        const r = await delete_cam_contagem(req.query.ponto);
        res.status(202).send(r)
    })



    return app
}



const serverHTTP = createServer();
const procSHttp = serverHTTP.listen(HTTP_PORT, () => {
    console.log(`\n Server HTTP rodando em http://192.168.10.239:${HTTP_PORT}`);

});