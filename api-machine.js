import axios from 'axios';

const ApiContagem = axios.create({
    baseURL: 'http://172.16.0.150:3500/api'
});

const ApiDB = axios.create({
    baseURL: 'http://172.16.0.150:5000/api'
});

const ApiMachine = axios.create({
    baseURL: 'http://localhost:5500'
})


const get = async (api, path, params=null) => {
    
    try{
        if(params) {
            var response = await api.get(path, params);
        }
        else{
            var response = await api.get(path);
        }
        
        return response.data;
        
    }
    catch(error){
        console.error(error);
        return null;
    }
}


export const start_machine = async (ponto) => {
    return await get(ApiMachine, '/startMachine', {params: {ponto: ponto}});
}
export const stop_machine = async (ponto) => {
    return await get(ApiMachine, '/stopMachine', {params:{ponto: ponto}})
}
export const restart_machine = async (ponto) => {
    return 
}

export const get_info_cam = async (ponto) => {
    return await get(ApiContagem, '/infocam', {params: {ponto: ponto}});
}

