var Brackets = require('./Brackets/Brackets.jsx')
var UUID =window.uuid
class Tree extends React.Component
{
	populate(x)
	{
		let users = []
		let userIndex = {}
		let i = 0
		for( i = 0; i < x; i++ )
		{
			let id = UUID()
			let score	= i
			let side	= isOdd(i) ? 'visitor' : 'home'
			// let _user 	= { id: id, nr: i+1, participant: faker.Helpers.createCard(), score: score, displayScore: [], side:side }
			let _user 	= { id: id, nr: i+1, participant: faker.Helpers.createCard(), score: score, displayScore: [], side:side }
			userIndex[id] = function( usr )
			{
				_user = usr || _user
				return _user
			}
			users.push( _user )
		}
		// if( isOdd(x) )
		// {
		// 	let score	= isOdd(i) ? 1 : 0
		// 	let side	= isOdd(i) ? 'visitor' : 'home'
		// 	let jumpin = faker.Helpers.createCard()
		// 		jumpin.name = '2nd of first fight'
		// 	users.push( { nr: i+1, participant: jumpin, score: score, displayScore: [], side: side, jumpin: true } )
		// }
		return {users:users, userIndex: userIndex}
	}

	growTree(_max)
	{
		let tree = null
		let max = _max
		let datetime =  moment().format("MM-DD-YYYY hh:mm")
		let participants = []
		let levels = []
		let maxLevels = 0
		participants = this.populate( max )// must redoo

		tree = { datetime: datetime, participants: participants.users, userIndex:participants.userIndex, levels: levels, maxLevels: maxLevels }
		return tree
	}
	constructor(props)
	{
		super()
		this.props = props

		this.onCallback = this.onCallback.bind(this)

		this.state = {...this.props}
		log( 'ON CONSTRUCTOPR', this.state )

	}
	onCallback(event)
	{
		const game = event
		this.props.onCallback(event)
	}
	componentWillReceiveProps(props)
	{
		let tree = this.growTree(props.max)
		log( 'ON STATE CHANGE', props)
		this.setState({...props})
	}
	render ()
	{
		let participants = this.state.participants
		log('TREE RENDER', participants)
		return 	<div>
					<Brackets participants={participants} max={this.state.max} onCallback={this.onCallback}/>
				</div>
	}
}
module.exports = Tree
