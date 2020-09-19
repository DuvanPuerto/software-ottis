//MODULO DESARROLLADO POR OSCAR DUVÁN PUERTO NIÑO PARA FACILITAR COMUNICACIÓN CON OLT
//DESARROLLADO EL 18 DE SEPTIEMBRE DE 2020
var Client = require('ssh2').Client;
var conexion = new Client();

//Exportar la función de conexión
exports.conectar = async (host,port,user,password) => {
    return await conectar(host,port,user,password);
}

//Exportar la función de enviar comando y recibir cadena de respuesta
exports.enviarComando = async (comando,caracter, stream) => {
    return await enviarComando(comando,caracter, stream);
}

//Exportar objeto conexión pertenciente a la clase SSH2 Client()
exports.conexion = conexion;

//Función de enviar comando por SSH y recibir cadena de respuesta
//Recibe como parámetros el comando, el último caracter de la cadena que se espera recibir después de
//enviar el comando por SSH hacia el dispositivo, esto ayuda a que la ejecución sea lo más síncrona posible
//y por último recibe un objeto stream que pertenece a la clase SSH2 Client()
enviarComando=(comando,caracter, stream)=>{
    return new Promise ((resolve,reject)=>{
      let str1='';
      let str2='';  
      stream.write(comando + '\n'); //Enviar el comando recibido como parámetro
  
        stream.on('data', function(data) { //Evento de dato recibido en el stream
          process.stdin.pause(); //Pausar streaming entrante de carácteres para evitar pérdida de datos
          mensaje = data.toString(); //Parsear los carácteres recibidos a una cadena
          process.stdin.resume(); //Reanudar el streaming entrante de carácteres 
          str2=str1.concat(mensaje); //Concatenación de diversos mensajes ya que se suele dividir en varias líneas independientes
          str1=str2; //Al terminar el streaming entrante se obtiene una cadena con el mensaje completo
        });
  
       let contar=0;
        let intervalo = setInterval(() => {
          if(str1.charAt(str1.length-1)==caracter){ //Evaluar si el último caracter recibido es el que se pasó por parámetro
            clearInterval(intervalo); //Eliminar ejecución de intervalo
            resolve(str1); //Devuelve el mensaje recibido desde el equipo
          }else{
            contar++;
            if(contar==500){ //500*10ms = 5seg <<-- Tiempo máximo que estará esperando el caracter requerido
              clearInterval(intervalo); //Eliminar ejecución de intervalo
              reject(str1); //Si no se recibe el caracter esperado en el tiempo estipulado se devuelve la cadena hasta donde haya quedado
            }
          }
        }, 10); //Cada 10ms se ejecuta el código
        
    });
  }

  //Función para conectarse con un equipo por SSH
  //Recibe como parámetros la ip del equipo, el puertos, el usuario y la contraseña (También se puede con llave SSH)
  function conectar(host,port,user,password){
    return new Promise((resolve,reject)=>{
      conexion.connect({
        host: host, //Dirección IP de la OLT
        port: port, //Puerto por el que se quiere acceder
        username: user, //Usuario de la OLT
        password: password, //Password de la OLT
        algorithms: { //Algoritmos de encriptación (Fundamental)
          kex: [
              "diffie-hellman-group1-sha1",
              "ecdh-sha2-nistp256",
              "ecdh-sha2-nistp384",
              "ecdh-sha2-nistp521",
              "diffie-hellman-group-exchange-sha256",
              "diffie-hellman-group14-sha1"
            ],
            cipher: [
              "3des-cbc",
              "aes128-ctr",
              "aes192-ctr",
              "aes256-ctr",
              "aes128-gcm",
              "aes128-gcm@openssh.com",
              "aes256-gcm",
              "aes256-gcm@openssh.com"
            ],
            serverHostKey: [
              "ssh-rsa",
              "ecdsa-sha2-nistp256",
              "ecdsa-sha2-nistp384",
              "ecdsa-sha2-nistp521"
            ],
            hmac: [
              "hmac-sha2-256",
              "hmac-sha2-512",
              "hmac-sha1"
            ]
        }
      });
    
      //Si es exitosa la conexión devuelve un true
      conexion.on('ready', function() {
        console.log('¡Conexión con OLT exitosa!');
        resolve(true);
      });
    
      //Si no se puede conectar devuelve un false
      conexion.on('error',function (err) {
        console.log('¡Hubo un error en la conexión con la OLT! --->>>',err.level); //Si el error es client-authentication es por usuario  o contraseña
        reject(new Error(false));
      });//Si el error es client-socket es por dirección ip o puerto
    });
  }                                                          