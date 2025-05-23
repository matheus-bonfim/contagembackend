import mysql from 'mysql2/promise';
import { connDBConfig } from './config.js';
import { removeStream } from './streamer/main.js';



const connectionConfig = connDBConfig;

async function connectToDatabase() {
  
  try {
    const connection = await mysql.createConnection(connectionConfig);
    return connection; 
  } catch (err) {
    console.error('Erro ao conectar:', err);
  }
}

export async function query_db(query_str, params){
  const connection = await connectToDatabase();
  try{
    const [response] = await connection.query(query_str, params);
    return response;
  }
  catch(err){
    console.log("erro: "+err);
    return null;
  }
  finally {
    connection.end();}  
}

export async function get_cam_ip(ponto){
  const q_str = "SELECT ip FROM countTable WHERE ponto = ?";
  const r = await query_db(q_str, [ponto]);
  try{
    return r[0].ip;
  }
  catch{
    return false;
  }
}


export async function info_table(ponto=null){
    let param = [];
    let query = "SELECT * FROM countTable";
    if (ponto){
      query = query + ' WHERE ponto = ?';
      param = [ponto];
    }
    const res = await query_db(query, param);
    return res;
}

export async function reset_counter(ponto){
    const query = "UPDATE countTable SET reset = 1 WHERE ponto = ?";
    const res = await query_db(query, [ponto]);
    return res; 
}

export async function insert_cam_contagem(ponto){

    let q_str = "SELECT IP_1 FROM info_cams WHERE PONTO = ?";
    const cam = await query_db(q_str, [ponto]);

    if(cam){
      if(cam.length === 0){
        console.log("Camera não está registrada na base de dados");
        return "Camera não está registrada na base de dados";
      }
      q_str = "INSERT INTO countTable (ponto, ip, state) VALUES (?, ?, ?)";
      const res_db = await query_db(q_str, [ponto, cam[0].IP_1, 3]); //  modo stream: não foi configurado os pontos para a reta
      if(res_db) {
        console.log("Ponto inserido com id ", res_db.insertId);
        return "Ponto inserido";
      }
    }
    else{
      console.log("Erro na base de dados");
    }
    return "Erro na base de dados";    
}

export async function start_counting(ponto, p1, p2){
    const q_str = "UPDATE countTable SET state = 1, p1 = ?, p2 = ? WHERE ponto = ?";
    const res_db = query_db(q_str, [p1, p2, ponto]);
    return res_db;
}

export async function stop_counting(ponto){
  const q_str = "UPDATE countTable SET state = 3 WHERE ponto = ?";
  const res_db = query_db(q_str, [ponto]);
  return res_db;
}




//insert_cam_contagem('43.1_CXT', '(122,4)', '(1000, 311)');

export async function delete_cam_contagem(ponto){ 
    const q_str = ["SELECT state FROM countTable WHERE ponto = ?",
      "DELETE FROM countTable WHERE ponto = ?", "UPDATE countTable SET state = 2 WHERE ponto = ?"];
    try {
      const conn = await connectToDatabase();
      let res_db = await conn.query(q_str[0], [ponto]);
      if(res_db[0].state === 3){
        res_db = await conn.query(q_str[1], [ponto]);
        if(res_db && res_db.affectedRows > 0){
          console.log(`Ponto ${ponto} deletado`);
          removeStream(ponto);
          return 'deleted';
        }
      }
      else{
        res_db = await conn.query(q_str[2], [ponto]);
        console.log(`Ponto ${ponto} esperando ser deletado`);
        removeStream(ponto);
        return 'waiting to delete';
      }
    } catch (err) {
      console.log(err)
    }
    finally{
      conn.end();
    }
    return 'error';
}

export async function delete_waiting_cams(){
  console.log("Procurando cams para deletar");
  const q_str = "DELETE FROM countTable WHERE state = 4";
  const res_db = await query_db(q_str, []);
  if(res_db.affectedRows > 0){
    console.log("Camera deleta: ")
  }
  return true;
}

//delete_cam_contagem('43.3_CXT');




//query_db("select * from countTable", []).then(res => console.log(res));