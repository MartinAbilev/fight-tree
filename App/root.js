// run watchify App/root.js -o public/bundle.js -v -t [ babelify --presets [ es2017 react stage-2] ]"
// in case no watchify instaled run npm install -g watchify

// var excel2Json = require('node-excel-to-json');
// window.excel2Json = excel2Json;

window.uuid = require('uuid/v1');
window.faker = require('Faker');
window.moment = require('moment');
window.React = require('react');
window.ReactDOM = require('react-dom');

window.App = require('./App.jsx')

window.lv = 'eng';
window.translation = window.lv;

window.log = console.log;
window.isOdd = function(num)
{
	return num % 2 //para skaitlis=even number    nepara=odd number
}

log('FIGHT TREE IS HERE TO FIGHT TREE')

ReactDOM.render(<App/>, document.getElementById('root'));

module.exports = window;
