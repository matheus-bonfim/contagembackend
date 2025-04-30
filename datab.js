import mysql from 'mysql2/promise';
import { connDBConfig } from './config.js';



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

export async function info_table(){
    const query = "SELECT * FROM countTable";
    const res = await query_db(query, []);
    return res;
}

export async function reset_counter(ponto){
    const query = "UPDATE countTable SET reset = 1 WHERE ponto = ?";
    const res = await query_db(query, [ponto]);
    return res; 
}







//query_db("select * from countTable", []).then(res => console.log(res));