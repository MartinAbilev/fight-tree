
var ReactTournamentBracket = require('react-tournament-bracket')
var {BracketGenerator, BracketGame, Bracket} = ReactTournamentBracket
var UUID =window.uuid

class Brackets extends React.Component
{
	constructor(props)
	{
		super()
		//this.props = props
		this.gameComponent = this.gameComponent.bind(this)
		this.state = {...props, homeOnTop: true, games: this.makeBrackets({...props})}
		this.hoveredTeamId = null
		this.onCallback = this.state.onCallback

	}

	changeHoveredTeamId = hoveredTeamId => this.setState({ hoveredTeamId });
	
	handleClick (event)
	{ 
		this.onCallback(event);
	}
	
	gameComponent = props => 
	{
		return (
		  <BracketGame
			{...props}
			onHoveredTeamIdChange=
			{
				hoveredTeamId =>
				{
				 	this.setState({hoveredTeamId: hoveredTeamId})
				}
			}
			onClick=
			{
				(event) =>
				{ 
					props.game.event = event
					this.handleClick({game: props.game, hoveredTeamId: this.state.hoveredTeamId})
				}
			}
			hoveredTeamId={this.state.hoveredTeamId}/>
		);
	};
	gameShape(props)
	{

		// for nested PropTypes
		const lazyFunction = f => ((...args) => f().apply(this, args))

		let all_branches = []
		let GameShape = function(props)
		{	
			this.props = {...props}
			this.id = UUID()
			this.child = null
			this.winner = null
			this.hoveredTeamId = null

			this.key= props.key + this.id
			this.onClick = function (){ log('BRACKET CLICKT')}
			this.name = props.name || 'gamesname'
			this.bracketLabel =props.bracketLabel || 'bracket label'
			this.scheduled= props.scheduled || moment().valueOf()
			this.get_branches = () => {return all_branches}
			this.sides=
			{
				home:
				{
					participant: null,
					score:{ score: 0, notes: 'notes' },
					seed:
					{						
						sourceGame:null,
						rank: 1,
						displayName:  '1: home'
					},
					team:
					{
						id: 'home',
						name: '1: home'
					}
				},
				visitor:
				{
					participant: null,
					score:{ score: 0, notes: 'notes' },
					seed:
					{						
						sourceGame: null,
						rank: 1,
						displayName:  '2: visitor'
					},
					team:
					{
						id: 'visitor',
						name: '2: visitor'
					}
				}
			}
			this.get_child=()=>this.child
			this.sides.home.participant = (part) => this.sides.home.participant = part
			this.sides.visitor.participant = (part) => this.sides.visitor.participant = part

			this.sides.home.sourceGame = (src) => this.sides.home.seed.sourceGame = src
			this.sides.visitor.sourceGame = (src) => this.sides.visitor.seed.sourceGame = src

			this.sides.home.setscore = ({score, notes}) => this.sides.home.score = {score: parseInt(score), notes: notes}
			this.sides.visitor.setscore = ({score, notes}) => this.sides.visitor.score = {score: parseInt(score), notes: notes}
			this.set_hoveredTeamId = (hoveredTeamId) => this.hoveredTeamId = hoveredTeamId
			this.sides.home.displayName = (name) =>
			{ 
				this.sides.home.seed.displayName = name
				this.sides.home.team.name = name
				this.sides.home.team.id = name
			}
			this.sides.visitor.displayName = (name) =>
			{ 
				this.sides.visitor.seed.displayName = name
				this.sides.visitor.team.name = name
				this.sides.visitor.team.id = name
			}

			this.sides.home.game= () =>{ return this }
			this.sides.visitor.game = () =>{ return this }

			this.child = (child) => this.child = child
			this.set_winner = (win) => this.winner=win

			this.get_sides = () => this.sides
			this.get_hoveredTeamId = () => this.hoveredTeamId

			this.update = (game) =>
			{
				let sides 	= game.get_sides()
				let home 	= sides.home
				let visitor = sides.visitor
				if( sides )
				{
					let score_home 		= home.score || null
					let score_visitor 	= visitor.score || null

					if( score_home && score_visitor )
					{
						let value_home 		= parseInt(score_home.score)
						let value_visitor 	= parseInt(score_visitor.score)

						if(value_home !== value_visitor)
						{
							log('WINNWERS: ', value_home, value_visitor)
							let winner_is = value_home > value_visitor ? home :visitor
							game.set_winner ( winner_is )
							let child = game.get_child()
							child.side && child.side.displayName(winner_is.seed.displayName)
							child.side && child.side.setscore(winner_is.score)
							child.game && child.game.update({...child.game})
						}
						else
						{
							log('DRAFT: ', value_home, value_visitor)
							game.set_winner ( null )
							let child = game.get_child()
							child.side && child.side.displayName(' ')
							child.side && child.side.setscore({score: (value_home + value_visitor)/2 , notes: 'draft'})
							child.game && child.game.update({...child.game})
							
						}
					}
					
				}
			}

			this.make_branch = function(_props)
			{
				// log('MAKE BRANCH')
				let props = _props || {...this.props}
				props.name = 'branchz'
				let new_branch = new GameShape(props)
				let more = true
				all_branches.map( (game)=>
				{
					if(more && game.get_sides().home.seed.sourceGame == null )
					{
						new_branch.child( { game: game, side: game.sides.home } )
						game.sides.home.sourceGame ( new_branch )
						more = false
					}else
					if(more && game.get_sides().visitor.seed.sourceGame == null )
					{
						new_branch.child( { game: game, side: game.sides.visitor } )
						game.sides.visitor.sourceGame ( new_branch )
						more = false
					}
				})
				all_branches.push(new_branch)

				return new_branch
			}
			this.addParicipants = function(participants)
			{
				// log('yuhu participants gone to brackeeer: ', participants)

				let nr = 0
				all_branches.map( (game)=>
				{
					if(game.sides.home.seed.sourceGame == null && participants[nr])
					{
						game.sides.home.participant( participants[nr] )
						game.sides.home.displayName( participants[nr] ? `${nr}: ${participants[nr].firstname}` : 'Home' )
						game.sides.home.setscore(  { score: participants[nr].score || 0 , notes: 'notes' })
						game.update({...game})
						
						nr ++
					}
					if(game.sides.visitor.seed.sourceGame == null && participants[nr])
					{
						game.sides.visitor.participant ( participants[nr] )
						game.sides.visitor.displayName ( participants[nr] ? `${nr}: ${participants[nr].firstname}` : 'Visitor' )
						game.sides.visitor.setscore( { score: participants[nr].score || 0 , notes: 'notes' })
						game.update({...game})
						
						nr ++
					}
				})
			}

		}
		let root_bracket = new GameShape(props)
		all_branches.push(root_bracket)
		return root_bracket
	}
	componentWillReceiveProps(props)
	{
		this.setState( {...props, games: this.makeBrackets({...props}) } )
	}
	newGame(props)
	{
		return this.gameShape(props)
	}
	makeBrackets(args)
	{
		const {  participants, max,  } = args
		const len = participants ? participants.length : max

		let root_bracket = this.newGame({name:'FINAL ROOT'})
		for( let i = 2; i < len; i++ )
		{
			root_bracket.make_branch()
		}
		participants.length >= 1 && root_bracket.addParicipants(participants)


		return root_bracket.get_branches()
	}
	render()
	{
		const { homeOnTop, hoveredTeamId, games} = this.state
		const { gameComponent: GameComponent } = this
		return  <BracketGenerator GameComponent={GameComponent} games={games} homeOnTop={homeOnTop}/>
	}
}
module.exports = Brackets
