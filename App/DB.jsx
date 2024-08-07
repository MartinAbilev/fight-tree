var request = function (url, dt, callback)
{
	fetch(url,
		{
			method: 'POST',
			headers: {
				// 'Accept': 'application/json, text/plain, */*',
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify(dt)
		}).then(res=>res.json())
		.then(res =>
		{
			callback(res)
			return res
		});
}
var form = function (url, formData, callback) {
	fetch(url, { // Your POST endpoint
		method: 'POST',
		body: formData // This is the content of your file
	}).then(
		response => response.json() // if the response is a JSON object
	).then(response => { callback(response) })
}

var DB = {}
DB.getProfile = function (session_uuid, callback )
{
	request('/getprf', { session_uuid: session_uuid }, callback )
}
DB.setProfile = function (session_uuid, info, callback )
{
	log('SET PROF', info)
	if(info._id) delete info._id
	request('/setprf', { session_uuid: session_uuid, info: info }, callback )
}

DB.getClubs = function (session_uuid, callback )
{
	request('/getclubs', { session_uuid: session_uuid }, callback )
}
DB.setClubs = function (session_uuid, info, callback )
{
	if(info._id) delete info._id	
	request('/setclubs', { session_uuid: session_uuid, info: info }, callback )
}
DB.delClubs = function (session_uuid, info, callback )
{
	if(info._id) delete info._id
	request('/delclubs', { session_uuid: session_uuid, info: info }, callback )
}
DB.openClubs = function (session_uuid, info, callback )
{
	if(info._id) delete info._id
	request('/openclubs', { session_uuid: session_uuid, info: info }, callback )
}
DB.upXls = function (session_uuid, formData, callback )
{
	form('/upXls', formData, callback )
}
DB.setTournament = function (session_uuid, info, callback )
{
	if(info._id) delete info._id
	log('DB SET TOURNAMENT: ', session_uuid, info)
	request('/settournament', { session_uuid: session_uuid, info: info }, callback )
}
DB.delTournament = function (session_uuid, info, callback )
{
	if(info._id) delete info._id
	log('DB SET TOURNAMENT: ', session_uuid, info)
	request('/deltournament', { session_uuid: session_uuid, info: info }, callback )
}
DB.getTournament = function (session_uuid, callback )
{
	request('/gettournament', { session_uuid: session_uuid }, callback )
}
DB.getPlayers = function (session_uuid, callback )
{
	request('/getplayers', { session_uuid: session_uuid }, callback )
}
module.exports = DB