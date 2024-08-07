var Tree = require('./Tree/Tree.jsx')
var Translate = require('./Translate.jsx')
var Tournament = require('./Tournament.jsx')
var DB = require('./DB.jsx')
var Profile = require('./Profile.jsx')
var Clubs = require('./Clubs.jsx')
var UUID =window.uuid

class App extends React.Component
{
	constructor()
	{
		super()
		this.clickHandler = this.clickHandler.bind(this)
		this.handleUser = this.handleUser.bind(this)
		this.isProfile = this.isProfile.bind(this)
		this.addClub = this.addClub.bind(this)
		this.addTournament = this.addTournament.bind(this)
		this.reload = this.reload.bind(this)
		this.callback = this.callback.bind(this)
		this.treeCallback = this.treeCallback.bind(this)
		this.updateParticipant = this.updateParticipant.bind(this)
		this.datetime = moment().format("MM-DD-YYYY hh:mm")

		let cred = document.getElementById('session_uuid').textContent
		let node = document.getElementById('session_uuid')
		window.cred = cred
		node.textContent = ''

		console.log('session_uuid:',cred  );
		let bak_params = JSON.parse(window.cred)
		let user = bak_params.user
		let session_uuid = bak_params.session_uuid
		this.state =
		{
			max: 16, lng: 'eng', session_uuid: session_uuid, user: user,
			show_tournament: false,
			show_clubs: false,
			show_profile: false,
			show_tree: false
		}

		this.reload()
	}
	reload()
	{
		const session_uuid = this.state.session_uuid
		DB.getProfile(session_uuid, (res) =>
		{
			let prof = res[0]
			log('PROFILE: ', prof)
			!prof ? this.setState({ show_profile: true }) : this.setState({ ...prof })
			DB.getTournament(session_uuid, (res) =>
			{
				const tournament = res
				if (tournament.length)
				{
					log('TOURNAMENT: ', tournament)
					this.setState({tournament: tournament})
					DB.getClubs(session_uuid, (res) =>
					{
						let clubs = res
						log('CLUBS: ', clubs)
						if (clubs.length)
						{
							this.setState({clubs: clubs})
						}
					})

				}
			})
		})


	}
	callback(event)
	{
		log('CALLBACK: ', event)
		if (event === 'del')
		{
			this.reload()
		}
		else if (event.type === 'club')
		{
			let inGamers = []
			event.participants.map(( participant, key )=>
			{
				participant.inTournament && participant.inGame ? inGamers.push(participant) : ''
			})
			let participants = inGamers || event.participants
			log('CLUB PARTICIPANTS:', participants)

			this.setState({max: participants.length, participants: participants})
		}
		else if (event === 'closeClub')
		{
			this.setState({show_tree: false})
		}
	}

	updateParticipant(part)
	{
			let participant = part
			participant.score ? participant.score ++ : participant.score = 1

			let state = Object.assign({}, this.state)
			state.participants.participant = participant


			DB.setProfile(this.state.session_uuid, participant,
				(res)=>{log('PART ON CLICK UPDATE: ', res); this.setState( state )} )
	}
	treeCallback(event)
	{
		const game = event.game

		log('CLICK:', event)

		if(event.hoveredTeamId === game.get_sides().home.team.id)
		{
			this.updateParticipant( game.get_sides().home.participant )
			log('HOME CLICKED: ')
		}
		else if(event.hoveredTeamId === game.get_sides().visitor.team.id)
		{
			this.updateParticipant( game.get_sides().visitor.participant )
			log('VISITOR CLICKED: ')
		}

	}
	isProfile(e)
	{
		log('profile REDY', e)

		this.setState({show_profile: false})

	}

	clickHandler(event)
	{
		const target = event.target
		const name = target.getAttribute('name')

		this.setState({ lng: name })
	}
	handleUser()
	{
		let session_uuid = this.state.session_uuid
		if( !this.state.show_profile )
		DB.getProfile(session_uuid, (res) =>
		{
			let prof = res[0]
			log('PROFILE: ', prof)
			!prof ? this.setState({ show_profile: true }) : this.setState({ ...prof })
			this.setState({show_profile: !this.state.show_profile, show_tree: false })

		})
		else
		{
			this.setState({show_profile: !this.state.show_profile })
		}
	}
	addTournament()
	{
		const tournamnet = {uuid: UUID(), name: 'tournament name'}
		DB.setTournament(this.state.session_uuid, tournamnet, (res) =>
		{
			log('ADD TOURNAMENT: ', res )
			DB.getTournament(this.state.session_uuid, (res) =>
			{
				let tournaments = res
				if (tournaments.length)
				{
					log('TOURNAMENT ADEED: ', tournaments)

					this.setState({tournament: tournaments})
				}
			})
		})
	}
	addClub()
	{
		let club = { title: 'New club', text: 'best club', but_label: 'Go to games', inTournament: false }
		let session_uuid = this.state.session_uuid
		DB.setClubs(session_uuid, club,
			(clubs) =>
			{
				this.setState({ clubs: clubs, show_clubs: true, show_profile: false })
				DB.getClubs(session_uuid, (res) =>
				{
					let clubs = res
					log('CLUBS: ', clubs)
					if (clubs.length)
					{
						this.setState({clubs: clubs})
					}
				})
			})
	}
	render ()
	{
		log('APP RENDER')
		let max 			= this.state.max
		let show_tree 		= this.state.show_tree
		let show_profile	= this.state.show_profile
		let show_clubs 		= this.state.show_clubs
		let show_tournament = this.state.show_tournament
		let tr 				= Translate
		let lng 			= this.state.lng
		let clubs 			= this.state.clubs
		let participants 	= this.state.participants
		let tournament		= this.state.tournament

		let logoStyle =
		{
			height: "1.5rem",
			verticalAlign: "middle",
			marginRight: "1rem"
		}
		let userStyle =
		{
			height: "1.5rem",
			verticalAlign: "bottom"
		}

		return (
			<div className="c0">
				<header className="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar bg-primary mb-4 d-flex justify-content-between">
					<span className="nav"><img style={logoStyle} src={'tree.svg'} /></span>
					<span className="font-weight-bold text-uppercase">
						{tr('fight_tree',lng)}  1.0
					</span>

					<span className="btn btn-light mx-4" onClick={ ()=>
						{
							log('CLICK CLUBS')
							this.setState({show_clubs: !this.state.show_clubs, show_tournament: false})}
						}>CLUBS</span>
					<span className="btn btn-light mx-4" onClick={ ()=>
						{
							log('CLICK Tournaments')
							this.setState({show_tournament: !this.state.show_tournament, show_clubs: false})}
						}>TOURNAMENTS</span>
					{show_clubs && <span className="btn btn-light mx-4" onClick={this.addClub}>ADD CLUB</span>}
					{show_tournament && <span className="btn btn-light mx-4" onClick={this.addTournament}>ADD TOURNAMENT</span>}

					<span className="py-2 float-right">
						<span>{this.datetime}</span>
						<span className="dropdown show">
							<a className="dropdown-toggle mx-4 text-light text-uppercase" href="#" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								{this.state.lng}
							</a>
							<div className="dropdown-menu" >
								<a className="dropdown-item" href="#" name="eng" onClick={this.clickHandler}>eng</a>
								<a className="dropdown-item" href="#" name="lv"  onClick={this.clickHandler}>lv</a>
								<a className="dropdown-item" href="#" name="ru"  onClick={this.clickHandler}>ru</a>
							</div>
						</span>
						<span className="d1"><img style={userStyle} src={'./img/user.svg'} onClick={this.handleUser}/></span>
					</span>
				</header>
				<div className="container-fluid flex-md-row text-center">

					{show_profile && <Profile {...this.state} callback={ this.isProfile }/>}
					{/* {show_tree && <Tree className="container-fluid" {...this.state} onCallback={this.treeCallback}/> } */}
					{show_tournament && !show_clubs && tournament && <Tournament tournament={tournament} {...this.state}/>}


					<div className="my-4"></div>
					{

						show_clubs && !show_tournament && clubs && clubs.map &&
						<div className="container-fluid">
							<div className="card-group">

								{clubs.map((club, key) =><span key={key} className="mx-2 my-2"><Clubs key={key} session_uuid={this.state.session_uuid} {...club}  callback={this.callback}/></span>) }

							</div>
						</div>

					}
				</div>
			</div>
		)
	}
}
module.exports = App