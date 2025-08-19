import express from 'express';
import cors from 'cors';
import { delete_waiting_cams, delete_cam_contagem, get_cam_ip_tipo, info_table, insert_cam_contagem, reset_counter, start_counting } from './datab.js';
import { getAllContainers, handleRequest, listActiveContainers, removeStream } from './streamer/main.js';
import { restart_machine, stop_machine } from './api-machine.js';
import { sendAlert } from './websocket.js';
import { containerAgingTime } from './config.js';

const HTTP_PORT = 3500



//setInterval(() => sendAlert({show:'de bola'}), 1000)
//setInterval(() => console.log("hanseniase"), 2000);



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

    app.get('/api/restartMachine', async (req, res) => {
        const resp = await restart_machine(req.query.ponto, req.query.zerar)
        res.status(202).send(resp)
    })

    

    app.get('/api/watch', async (req, res) => {
        let ports = false;
        const [ip, tipo] = await get_cam_ip_tipo(req.query.cam);
        if(ip){
            ports = await handleRequest(req.query.cam, ip, tipo);
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
        let fromHour = req.query.fromHour; 
        let toHour = req.query.toHour;

        if(fromHour === '' || toHour === ''){
            fromHour = null;
            toHour = null;
        }
        const r = await start_counting(req.query.ponto, req.query.p1, req.query.p2, req.query.direction, fromHour, toHour);
        if(r.affectedRows > 0){
            res.status(202).send("Contagem ativada");
        }
        else {
            res.send("Erro");
        }
    })

    app.get('/api/stopContagem', async (req, res) => {
        const r = await stop_machine(req.query.ponto);
        
        res.status(202).send(r);
    })
    
    app.get('/api/deletecamContagem', async (req, res) => {
        const r = await delete_cam_contagem(req.query.ponto);
        res.status(202).send(r);
    })

    //notifyyyy

    app.post('/api/notify', async (req, res) => {
        const data = req.body;
        console.log(data);
        sendAlert(data);
        res.status(200).json({status: "recebido"});
    })


    return app
}

setInterval(getAllContainers, 1000 * 60 * 15, containerAgingTime)
getAllContainers(3600);
const serverHTTP = createServer();
const procSHttp = serverHTTP.listen(HTTP_PORT, () => {
    console.log(`\n Server HTTP rodando em http://192.168.10.239:${HTTP_PORT}`);

});