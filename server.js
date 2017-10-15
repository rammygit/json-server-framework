// server.js
const jsonServer = require('json-server')
//returns express instance.
const server = jsonServer.create()
const argv = require('yargs').argv
const middlewares = jsonServer.defaults()
const path = require('path')
const fs = require('fs');
var dataFolder = "data"
var dbFile = "db.json"

var port = 3000

/**
 * server arguments.
 * port - specifies the port number to bind on. default is 3000
 * dataFolder - user directory for reading the additional json file for adding to the DB file. 
 * dbFile - primary data holding json file from which the json-server runs upon. 
 */
if(argv.port) 
	port = argv.port
if(argv.dataFolder)
	dataFolder = argv.dataFolder
if(argv.dbFile)
	dbFile = argv.dbFile



// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

/**
 * sync use 
 * @param  {[type]} file){               		
 * return path.extname(file) [description]
 * @return {[type]}         [description]
 */
server.use((req, res, next) => {
	//onServerStart()
	//add anything you want to do all request here.
	//can chain more.
 	next() // continue to JSON Server router
})

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp({"echo":"server echo works"})  
})


// Add this before server.use(router)
server.use(jsonServer.rewriter({
  '/rest/user/login': '/login'
}))

/**
 * [onServerStart to run on the server startup, on port binding]
 * 
 * @return {[type]} [description]
 */
var onServerStart = function(){	
	console.log('calling on server start')
	var dbJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname)+'/db.json','utf8'))
	//console.log(dbJSON)
	var fileArray = fs.readdirSync((path.resolve(__dirname))+'/data').filter(function(file){		
  		return path.extname(file) === '.json';
	});
	console.log(JSON.stringify(fileArray))
	//null,2 is for prettier file. 
	fileArray.forEach( function(file) {	
		var data = JSON.parse(fs.readFileSync(path.resolve(__dirname)+'/data/'+file,'utf8'))
		var keys = Object.keys(data)
		keys.forEach( function(key) {			
			//var propertyName = Object.keys(data)[0]
			dbJSON[key] = data[key]
		});				
	});
	//console.log(JSON.stringify(dbJSON))
	fs.writeFileSync('./db.json',JSON.stringify(dbJSON,null,2))	
}

//overwrite the port when specified as --port=<value>


//start listening on the specified port.
server.listen(port, () => {
  console.log('JSON Server is running')
  onServerStart()
  server.use(jsonServer.router('db.json'))
})



