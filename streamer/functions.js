import fs from 'fs'
import getPort, { portNumbers } from 'get-port';
import { getAvailableUdpPort } from './udpPorts.js';
import { ports_path, con_config_path } from './main.js';
import path from 'path';


export function createYml(name, ip, ports, tipo){

    try{
        fs.copyFileSync(path.join(con_config_path, 'default.yml'), path.join(con_config_path, `${name}.yml`));
    }
    catch (err) {
        console.log("Erro ao copiar default", err);
        return false;
    }
    let psw, url_source;
    if(tipo === 'DVR'){
        let stream_number = name.split('_')[1];
        psw = "wnidobrasil22";
        //url_source = `source: rtsp://mat:wnidobrasil22@${ip}:554/Streaming/Channels/${stream_number}`;
        url_source = `source: rtsp://mat:wnidobrasil22@${ip}:554`;
        //source: rtsp://admin:${psw}@${ip}
    }
    else if (tipo === 'LPR'){
        psw = encodeURIComponent("Wnidobrasil#22")
        url_source = `source: rtsp://admin:${psw}@${ip}:554/cam/realmonitor?channel=1&subtype=1`;
    }
    else{
        //psw = encodeURIComponent("Wnidobrasil#22")
        psw = encodeURIComponent("Wnidobrasil!20");
        url_source = `source: rtsp://bosch:${psw}@${ip}:25552`;
        //url_source = `source: rtsp://admin:${psw}@${ip}:554/media/video3`;
    }

    //rtsp://mat:wnidobrasil22@172.16.0.213:554/Streaming/Channels/101
    
    //const psw = "admin";
//    const content = `\nwebrtcAddress: :${ports.webrtcAddress}\nwebrtcLocalUDPAddress: :${ports.webrtcLocalUDPAddress}\nrtspAddress: :${ports.rtspAddress}\nrtpAddress: :${ports.rtpAddress}\nrtcpAddress: :${ports.rtcpAddress}\npaths:\n  ${name}:\n    source: rtsp://admin:${psw}@${ip}/media/video1`
    const content = `\nwebrtcAddress: :${ports.webrtcAddress}\nwebrtcLocalUDPAddress: :${ports.webrtcLocalUDPAddress}\nrtspAddress: :${ports.rtspAddress}\nrtpAddress: :${ports.rtpAddress}\nrtcpAddress: :${ports.rtcpAddress}\npaths:\n  ${name}:\n    ${url_source}`;  
    try {
        const fileName = path.join(con_config_path,`${name}.yml` );
        fs.appendFileSync(fileName, content);
        return fileName;
    } catch (error) {
        console.log("Error overwriting file", error);
        return false;
    }
}



export async function getPorts() {
    const webrtcAddress = await getPort({port: portNumbers(8889, 8899)});
    const rtspAddress = await getPort({port: portNumbers(8554, 8564)});
    const webrtcLocalUDPAddress = await getAvailableUdpPort({portRange: [8189, 8199]});
    let pair_is_set = false;
    let rtpAddress=8000; 
    let rtcpAddress;
    const max_rtpAddress = 8020;
    let noPorts = false;


    while(!pair_is_set && !noPorts){
        //rtpAddress = await getPort({port: portNumbers(rtpAddress, max_rtpAddress)});
        rtpAddress = await getAvailableUdpPort({portRange: [rtpAddress, max_rtpAddress]})
        if(!rtpAddress){ //se nao encontrar porta para
            noPorts = true;
            break;
        }
        rtcpAddress = await getAvailableUdpPort({portRange: [rtpAddress + 1, rtpAddress + 1]})
        if(!rtcpAddress){
            rtpAddress += 2;
        }
        else pair_is_set = true;
        if(rtpAddress > max_rtpAddress - 1){
            noPorts = true;
        }
    }
    if(noPorts){
        return false;
    }
    else{
        const ports = {
            webrtcAddress: webrtcAddress, 
            rtspAddress: rtspAddress, 
            rtpAddress: rtpAddress, 
            rtcpAddress: rtcpAddress,
            webrtcLocalUDPAddress: webrtcLocalUDPAddress
        }
       
        return ports;
    }
}

//getPorts()

//getPort({port: 8889}).then((p)=>c./containers_config/${name}.yml`onsole.log(p))
//console.log(overwriteFile('cam2', '192.168.24.37:554'))
