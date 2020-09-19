const conexionSSH = require('./conexionSSH'); //Requerir modulo que facilita la comunicación por SSH
const conexion = conexionSSH.conexion; //Objeto conexión, hereda de SSH2 Client()

main();

//Todas las funciones que utilicen el módulo conexionSSH o las funciones predefinidas por la OLT deben ser asíncronas
//para que se pueda esperar a las promesas de conexión y envío de comandos

async function main(){
  await comandosOLT();
  console.log('Proceso terminado');
}

async function comandosOLT(){
  return new Promise(async(resolve,reject)=>{
    const conectar = await conexionSSH.conectar('10.100.1.126',22,'root','admin').catch((err)=>{}); //Conectar a la OLT (host,port,user,password)
                                                                                                    //FUNDAMENTAL debe ser lo primero antes de enviar cualquier comando
                                                                                                    //o llamar una función predefinida de la OLT 
    if(conectar==true){ //Verificar si se hizo la conexión correctamente
      conexion.shell(async function(err, stream) { //Abrir streaming para enviar y recibir. FUNDAMENTAL para enviar comandos o llamar funciones predefinidas
        if (err) reject(new Error('¡Hubo un error en el envío del comando!')); //Error por si no se puede abrir el streaming
        stream.on('close', function() { //Evento de cierre de streaming
          conexion.end(); //Cierre de conexión
          conexion.destroy(); //Elimina la conexión
          resolve();
        });

        //Envío de comandos. Parámetros -->> (comando, caracter final esperado, objeto stream)
        cadena = await conexionSSH.enviarComando('','>',stream).catch((err)=>{console.log(err)});
        cadena = await conexionSSH.enviarComando('enable','#',stream).catch((err)=>{console.log(err)});

        //Llamado de funciones predefinidas para OLT (debe pasarse objeto stream)

        //await verPerfilesONT(stream);
        //await verAyuda(stream);
        //await verVlans(stream);
        //await verTemperaturaSlot('16',stream); //slot
        //await verEstadidisticasGlobales(stream);
        //await verEstadidisticasPON('16','0',stream); //slot-port
        //await verTraficoVlan('2020',stream); //vlan
        //await verPuertosServicio('1016',stream)
        await detectarONT(stream);
        stream.close();//Cerrar el streaming de datos
        });
      }else{
        console.log('CONEXIÓN CON LA OLT FALLIDA');
        reject(new Error('CONEXIÓN CON LA OLT FALLIDA'));
      }
    });
}

//<<<<<==================FUNCIONES PREDEFINIDAS PARA LA OLT===============================>>>>>>

async function verPerfilesONT(stream){
  return new Promise(async(resolve,reject)=>{
   
        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display ont-srvprofile gpon all`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        });
}

async function verAyuda(stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`help`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function verVlans(stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display vlan all smart \n \n \n \n \n \n \n \n \n \n`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function verTemperaturaSlot(slot,stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display temperature 0/${slot} \n \n \n \n \n \n \n \n \n`,'#',stream).catch((err)=>{console.log(err)});
        //cadena = await conexionSSH.enviarComando(' \n','#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function verEstadidisticasGlobales(stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display statistics global \n \n \n \n \n \n \n`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function verEstadidisticasPON(slot,port,stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display gpon statistics ethernet  0/${slot} ${port}\n \n \n \n \n \n \n`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function verTraficoVlan(vlan,stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display traffic vlan ${vlan}\n \n`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function verPuertosServicio(vlan,stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display service-port all\n \n \n \n \n \n \n \n`,'#',stream).catch((err)=>{console.log(err)});
        console.log(cadena);
        resolve();
        }); 
}

async function detectarONT(stream){
  return new Promise(async (resolve,reject)=>{

        //Enviar los comandos hacia la OLT y guardar la respuesta en la variable 'cadena'
        cadena = await conexionSSH.enviarComando(`display ont autofind all \n `,'#',stream).catch((err)=>{console.log(err)});
        //Se divide la cadena y se recogen los datos devueltos por la ONT
        var number = cadena.substring(cadena.indexOf('Number'),cadena.indexOf('F/S/P'))
        var fsp = cadena.substring(cadena.indexOf('F/S/P'),cadena.indexOf('Ont SN'))
        var ontSN = cadena.substring(cadena.indexOf('Ont SN'),cadena.indexOf('Password'))
        var password = cadena.substring(cadena.indexOf('Password'),cadena.indexOf('Loid'))
        var loid = cadena.substring(cadena.indexOf('Loid'),cadena.indexOf('Checkcode'))
        var checkCode = cadena.substring(cadena.indexOf('Checkcode'),cadena.indexOf('VendorID'))
        var vendorId = cadena.substring(cadena.indexOf('VendorID'),cadena.indexOf('Ont Version'))
        var ontVersion = cadena.substring(cadena.indexOf('Ont Version'),cadena.indexOf('Ont SoftwareVersion'))
        var ontSoftwareVersion = cadena.substring(cadena.indexOf('Ont SoftwareVersion'),cadena.indexOf('Ont EquipmentID'))
        var ontEquipmentId = cadena.substring(cadena.indexOf('Ont EquipmentID'),cadena.indexOf('Ont autofind time'))    
    
      //Se separan los datos reelevantes, quitándoles los : y los saltos de linea
        number = number.substring(number.indexOf(':')+2,number.indexOf('\r'))
        fsp = fsp.substring(fsp.indexOf(':')+2,fsp.indexOf('\r'))
        ontSN = ontSN.substring(ontSN.indexOf(':')+2,ontSN.indexOf('\r'))
        password = password.substring(password.indexOf(':')+2,password.indexOf('\r'))
        loid = loid.substring(loid.indexOf(':')+2, loid.indexOf('\r'))
        checkCode = checkCode.substring(checkCode.indexOf(':')+2, checkCode.indexOf('\r'))
        vendorId = vendorId.substring(vendorId.indexOf(':')+2, vendorId.indexOf('\r'))
        ontVersion = ontVersion.substring(ontVersion.indexOf(':')+2, ontVersion.indexOf('\r'))
        ontSoftwareVersion = ontSoftwareVersion.substring(ontSoftwareVersion.indexOf(':')+2, ontSoftwareVersion.indexOf('\r'))
        ontEquipmentId = ontEquipmentId.substring(ontEquipmentId.indexOf(':')+2, ontEquipmentId.indexOf('\r'))
    
      //Se crea el objeto JSON que guarda los datos de la ont
      console.log(cadena);
      
      ONT = 
        {
            'number': number,
            'fsp' : fsp,
            'ontSN': ontSN,
            'password': password,
            'loId': loid,
            'checkCode': checkCode,
            'vendorId': vendorId,
            'ontVersion': ontVersion,
            'ontSoftwareVersion': ontSoftwareVersion,
            'ontEquipmentId': ontEquipmentId
        }  
        console.log(ONT);
        resolve(ONT);
        }); 
}