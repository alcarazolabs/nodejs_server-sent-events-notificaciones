const router = require('express').Router()

const Task = require('../model/task')
const Notification = require('../model/notification')
let sseExpress = require('sse-express')
var ObjectId = require('mongoose').Types.ObjectId; //para buscar por tipo ObjectId
const EventEmitter = require('events');
const { nextTick } = require('process'); //no tiene sentido esto.
const myEmitter = new EventEmitter();
// or 0 to turn off the limit
//myEmitter.setMaxListeners(0) //Solo se permiten 10 eventos por defecto. Para incrementar el maximo usar esta propiedad.


router.get('/subscription',  sseExpress(),  (req, res, next) => {
       
     const iduser= req.query.iduser
    
    myEmitter.on('newUserTaskNotification-'+iduser, data => {
		res.sse({
            event: 'newUserTaskNotification_'+data.notification.iduser,
            data: data
        });
    });
    /*
    * El problema con esta ruta es que cuando un usuario se conecta genera un evento 'newUserTaskNotification-'+iduser'
    * Si existen 1000 usuarios conectados se generaran 1000 'newUserTaskNotification-'+iduser' eventos asi el 
    * servidor escuchara 1000 eventos lo que conlleva a fugas de memoria. Node.js recomienda minimo 10 eventos
    * Para incrementar el limite y remover la advertencia usar: myEmitter.setMaxListeners(0)
    */
    //myEmitter.removeAllListeners('newUserTaskNotification') Remover todos los eventos con ese nombre.
    //Contar el numero de eventos con el nombre 'newUserTaskNotification-'+iduser'
    console.log(EventEmitter.listenerCount(myEmitter, 'newUserTaskNotification-'+iduser));
    //Listar todos los eventos del servidor que esta escuchando.
    console.log("todos los eventos")
    console.log(Object.keys(myEmitter._events));
    //detectar la desconexion de un usuario.
    req.on('close', function (){
        console.log("desconectado")
        //Si se desconecta eliminar el evento 'newUserTaskNotification-'+iduser' con su iduser.
        //Esto tiene un problema por que el usuario puede tener mas de una ventana de la misma pagina
        //abierta y si se elimina su evento dejara de escuchar en todas las paginas.
        //myEmitter.removeAllListeners("newUserTaskNotification-"+req.query.iduser);
        
        //contar todos los eventos newUserTaskNotification-'+iduser
        console.log(EventEmitter.listenerCount(myEmitter, 'newUserTaskNotification-'+req.query.iduser));
        console.log("lista los eventos luego de que se desconecto alguien")
        console.log(Object.keys(myEmitter._events));
    });
    /*
    * No se recomienda usar Server-Sent Events de esta manera ya que llevara a fugas de memoria además
    * en aplicacions meviles consume datos ya que cada 3 segundos envia un mensaje al cliente para mantener
    * la conexión viva. 
    * Se uso el modulo sse-express para que configure un servidor- ss-events. Verlo dentro de la carpeta node_modules
    * Este modulo se instala npm install --save sse-express@next
    */

});

router.get('/mytasks', async (req, res) => {
    const iduser = req.query.iduser;
    try{
        const result = await Task.find({iduser: new ObjectId(iduser)}).sort({date: 'desc'})
            res.status(201).json(result);
    
        }catch(error){
            return res.status(202).json({error: error.message});
        }

});
router.post('/register', async (req, res) => {
    console.log(req.query)
    try{
        //obtener id para luego pasarlo al evento
        const iduser = new ObjectId(req.query.iduser)
        //Crear tarea
        const task = await Task.create(req.query)
        if(!task){
            return res.send({error: true, data:"fail to create task"})
        }
        //verificar si existe notificacion para dicho usuario
        const notificado = await Notification.findOne({iduser: new ObjectId(req.query.iduser)})
        if(notificado){
            //Actualizar su estado de notificado luego de que se le registro tarea.
            await Notification.findByIdAndUpdate(notificado._id, {
                status: 1,
            });
        }else{
            //Crear notificacion por primera vez
            var obj = {
                status: 1,
                iduser: req.query.iduser
            }
            //Crear notificacion en la bd.
            const n = await Notification.create(obj)
        }
    
        //objeto notificacion para enviar al usuario
        var task_notification = {
            idtask: task._id,
            iduser: iduser,
            name: task.name,
            date: task.date,
        }
       
        myEmitter.emit('newUserTaskNotification-'+iduser, {
            notification: task_notification
        });

        return res.send({error: false, data:"ok"})

        }catch(error){
            return res.send({error: error.message})
        }

});


router.get('/task_notification_status', async (req, res) => {
      //get status of Notification of the user
    try{
        const result = await Notification.findOne({iduser: new ObjectId(req.query.iduser)})
   
        if(result){
            res.status(201).json({error:false, status:result.status});
        }
    
        }catch(error){
            return res.status(202).json({error: error.message});
        }

});

router.post('/change_user_notification_status', async (req, res) => {

    try{
       const result = await Notification.findOneAndUpdate({iduser:req.body.iduser}, {
            status: 0,
        });
        if(result){
            return res.send({error: false, data:"ok"})
        }else{
            return res.send({error: true, data:"no"})
        }
    }catch(error){
        return res.send({error: error.message})
    }

});


router.post('/change_task_status', async (req, res) => {

    try{
        const result = await Task.findByIdAndUpdate(req.body.idtask, {
            status: 0,
        });
        if(result){
            return res.send({error: false, data:"ok"})
        }else{
            return res.send({error: true, data:"no"})
        }
    }catch(error){
        return res.send({error: error.message})
    }

});


module.exports = router;
