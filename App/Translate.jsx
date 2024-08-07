const trans = require('./trans.json')
var Translate = function (word, lng)
{
	let book = trans 
	let translaton = book[word][lng] || `${word}`
	return translaton
}
module.exports =  Translate

