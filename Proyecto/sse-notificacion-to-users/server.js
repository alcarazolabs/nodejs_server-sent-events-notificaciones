var express = require('express')
const bodyParser = require('body-parser')
var app = express()
var cors = require('cors')

require('./database.js')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())

//importar rutas
const taskRoute = require('./routes/task');
//rutas middlewares
app.use('/api/tasks', taskRoute);



var server = app.listen(3000, ()=>{
    console.log("servidor corriendo en puerto:",
    server.address().port);
});
/*
* Se debe de crear una colección Users. Crear dos usuarios.
* Copiar el _id del usuario 1 y pegarlo dentro index.html
* El _id del usuario 2 pegarlo dentro de user2.html
* Mejor dicho cambiar las constante  const iduser="xxxx"
* Desde un cliente rest como postman o insomia crear una tarea
* el campo 'date' tiene el siguiente formato: Sun Oct 28 2020 22:43:44 GMT-0500
* ver foto 'crear tarea.png' y 'idex html demo.png'
*/