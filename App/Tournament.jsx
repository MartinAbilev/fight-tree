var DB = require('./DB.jsx')
var Tree = require('./Tree/Tree.jsx')

var UUID =window.uuid

class Tournament extends React.Component
{
	constructor(props)
	{
		super()
		this.state = {...props, show_payers: false, is_edit_game: false}
		this.reload = this.reload.bind(this)
		this.table = this.table.bind(this)
		this.addGame = this.addGame.bind(this)
		this.addPlayers = this.addPlayers.bind(this)
		this.getPlayers = this.getPlayers.bind(this)
		this.pushPlayer = this.pushPlayer.bind(this)
		this.openTree = this.openTree.bind(this)
		this.treeCallback = this.treeCallback.bind(this)
		this.updateParticipant = this.updateParticipant.bind(this)
		this.enlisted = this.enlisted.bind(this)
		this.editGame = this.editGame.bind(this)
		this.onChange = this.onChange.bind(this)
		this.getTournamentByGameId = this.getTournamentByGameId.bind(this)
		this.saveTournament = this.saveTournament.bind(this)
		this.getGameById = this.getGameById.bind(this)
		log('TOURNAMENT PROPS: ', props)

		this.getPlayers()
		this.reload()
	}
	componentWillReceiveProps(props)
	{
		log( 'ON STATE CHANGE', props)
		this.setState({...props})
	}
	openTree(game)
	{
		const session_uuid = this.state.session_uuid

		let inGamers = []

		DB.getPlayers(session_uuid, (res) =>
		{
			log('OPEN GAME:', game, res)
			res.map((player, key)=>
			{
				player.in_game_uuid === game.uuid &&
				inGamers.push( player )
			})
			let participants = inGamers || this.state.participants
			this.setState({max: participants.length, participants: participants, show_tree: true})
		})

	}
	reload()
	{
		let session_uuid = this.state.session_uuid
		DB.getTournament(session_uuid, (res) =>
		{
			let tournament = res

			if (tournament.length)
			{
				this.setState({tournament: tournament})
			}
		})
	}
	addGame(_tournament)
	{
		let session_uuid = this.state.session_uuid
		log('ADD GAME: ', _tournament)
		let game = { uuid: UUID(), name: 'new game', start: '10:00', end: '10:10', enlisted: 2, tournament_uuid: _tournament.uuid }
		_tournament.games ? _tournament.games.push(game) : _tournament.games = [game]

		DB.setTournament(session_uuid, _tournament, (res) =>
		{
			this.reload()
		})
	}
	addPlayers(game)
	{
		let session_uuid = this.state.session_uuid
		game.uuid != this.state.game_selected_uuid ? DB.getPlayers(session_uuid, (res) =>
		{
			 log('ADDPLAYERS: ', res)
			 this.setState({players: res, game_selected: game, game_selected_uuid: game.uuid, show_payers: true})
		}) : this.setState({game_selected_uuid: game.uuid, show_payers: !this.state.show_payers , selected_tournament_id: game.tournament_uuid})
	}
	getPlayers()
	{
		const session_uuid = this.state.session_uuid

		DB.getPlayers(session_uuid, (res) =>
		{
			log('GET PLAYERS:', res)

			this.setState({players: res})
		})
	}
	enlisted(game, players)
	{
		const session_uuid = this.state.session_uuid

		log('players', players)

		let en = 0
		players.map((player, key)=>
		{
			player.in_game_uuid === game.uuid && en ++
		})

		if(en)
		{
			this.state.tournament.map((tournament, key)=>
			{
				if(tournament.uuid === game.tournament_uuid)
				{
					log('ENLISTED update: ', tournament)
					game.enlisted = en
					DB.setTournament(session_uuid, tournament, (res) =>
					{
						// this.reload()
					})
				}
			})
		}
		return en


	}
	onChange(event, _game)
	{
		const target = event.target
		const name = target.name
		const value = target.value

		let state = Object.assign({}, this.state)
		state.tournament.game = _game
		state.tournament.game[name] = value

		this.setState( state )

		log('TOURNAMENT ON CHANGE:', name, value)
	}
	table( _games )
	{
		let players = this.state.players
		let is_edit_game = this.state.is_edit_game
		let games = _games || []
		return	<table className="table table-bordered table-dark">
				<thead>
					<tr>
					<th scope="col">#</th>
					<th scope="col">Game Name</th>
					<th scope="col">Start time</th>
					<th scope="col">End time</th>
					<th scope="col">Enlisted</th>
					</tr>
				</thead>
				<tbody>
					{ games.map((game, key)=>
					<tr key={key}>
						<th scope="row">{key}</th>
						<td>{
								!is_edit_game ? game.name:
								<input className="form-control" type="text" name="name" value={game.name}
										onChange={ (event)=>{this.onChange(event, game)}}/>

							}</td>
						<td>{game.start}</td>
						<td>{game.end}</td>
						<td>
						{ players && this.enlisted(game, players) }</td>
						<td><button type="button" className="btn btn-primary mx-2" onClick={ () =>
							{ this.addPlayers(game) }}>Add Players</button>
						</td>
						<td><button type="button" className="btn btn-success mx-2" onClick={ () =>
							{ this.openTree(game) }}>openTree</button>
						</td>

					</tr>
					)}

				</tbody>
				</table>
	}
	pushPlayer(player, game)
	{
		let session_uuid = this.state.session_uuid
		player.in_game_uuid = player.in_game_uuid === game.uuid ? false : game.uuid
		log('PUSH TO FIGHT: ', player, game )

		let state = Object.assign({}, this.state)
		state.players.player = player
		DB.setProfile(session_uuid, player,(res)=>
		{
			log('PLAYER PUSH TO FIGHT: ', res)
			this.setState(state)
		})
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
	editGame()
	{
		// this.state.is_edit_game ? DB.setTournament(session_uuid, tournament, (res) =>
		// {
		// 		// this.reload()
		// 		this.setState({is_edit_game: false})
		// }) :	this.setState({is_edit_game: true})
		this.setState({is_edit_game: !this.state.is_edit_game})
	}
	getTournamentByGameId(in_game_uuid)
	{
		let ret = null
		const tournament = this.state.tournament
		tournament.map((tr,key)=>
		{
			tr.games && tr.games.map((game, key)=>
			{

				if(in_game_uuid === game.uuid)
				{
					log('GET TOURNAMENT BY GAME ID: ',  game.uuid, in_game_uuid)

					ret = tr
				}
			})
		})
		return ret
	}
	getGameById(in_game_uuid)
	{
		let ret = null
		const tournament = this.state.tournament
		tournament.map((tr,key)=>
		{
			tr.games && tr.games.map((game, key)=>
			{

				if(in_game_uuid === game.uuid)
				{
					log('GET GAME BY GAME ID: ',  game.uuid, in_game_uuid)

					ret = game
				}
			})
		})
		return ret
	}
	saveTournament(tournament)
	{
		const session_uuid = this.state.session_uuid
		DB.setTournament(session_uuid, tournament, (res) =>
		{
			log('SAVE TOURNAMENT: ',tournament, res)
			this.setState({is_edit_game: false})
		})
	}
	deleteTournament(tournament)
	{
		const session_uuid = this.state.session_uuid
		DB.delTournament(session_uuid, tournament, (res) =>
		{
			log('DELETE TOURNAMENT: ',tournament, res)
			this.reload()
		})
	}
	render()
	{
		let show_tree = this.state.show_tree
		let show_payers = this.state.show_payers
		let table = this.table
		let tournament = this.state.tournament
		let players = this.state.players
		let is_edit_game = this.state.is_edit_game
		let clubs = this.state.clubs
		let participants = this.state.participants
		log('TOURNAMENT STATE: ',this.state)
		return 	<div>
					{show_tree &&
						<div>
							<div className="inline">
								{
									participants.map( ( participant, key )=>
									{
										log('PARTICIPANTS: ', participant)
										return <div>{key}: {participant.firstname} score: {participant.score}</div>
									})
								}
							</div>
							<div className="inline">
								<Tree className="container-fluid" {...this.state} onCallback={this.treeCallback}/>
							</div>
						</div>
					}


					{tournament.length && tournament.map((trnmnt, key) =>
						<div className="my-4" key={key}>
							<span>{key}: </span><span>{!is_edit_game ? trnmnt.name : <input className="form-control" type="text" name="name" value={trnmnt.name}
										onChange={ (event)=>
										{
											const target = event.target
											const name = target.name
											const value = target.value

											trnmnt.name = value
											let state = Object.assign({}, this.state)
											state.tournament.trnmnt=trnmnt
											this.setState(state)
										} }/>}</span>

							<table className="table table-bordered table-dark">
								<thead>
								</thead>

								<tbody>
								{ show_payers && players && players.map( (player, key) => player.inTournament == trnmnt.uuid &&

									<tr key={key}>
										<th scope="row">{key}</th>
										<td>{player.firstname} {player.lastname}</td>
										<td> In tournament {player.in_game_uuid && this.getTournamentByGameId(player.in_game_uuid).name } :
											{player.in_game_uuid ? ' in game ' + this.getGameById(player.in_game_uuid).name : 'not in game yet'}</td>
										<td><input type="checkbox" className="checkBox" checked={player.in_game_uuid} name={player.uuid}
										onChange={()=>
										{
											this.pushPlayer(player, this.state.game_selected)}
										}/></td>
									</tr> )
								}
								</tbody>

							</table>
							<div>{table(trnmnt.games)}</div>
							<table className="table table-bordered table-dark my-4">
								<thead>
								</thead>

								<tbody>
								{ clubs && clubs.map && clubs.map( (club, key) =>

									<tr key={key}>
										<th scope="row">{key}</th>
										<td>{club.title} {club.text}</td>

										{ (club.inTournament == trnmnt.uuid || !club.inTournament ) &&
										<td><input type="checkbox" className="checkBox" checked={this.state.clubs[key].inTournament} name={club.name}
										onChange={()=>
										{
											club.inTournament = club.inTournament ? false : trnmnt.uuid

											const session_uuid = this.state.session_uuid
											DB.setClubs(session_uuid, club,
												(res) =>
												{
													log('changed', res)
													let state = Object.assign({}, this.state)
													state.clubs.club=club
													this.setState(state)
												})
										}}/></td>}
									</tr> )
								}
								</tbody>

							</table>
							<div>
								{is_edit_game &&
									<div>
									<button type="button" className="btn btn-primary mx-2" onClick={ ()=>{this.saveTournament(trnmnt)}}>Save Game</button>
									<button type="button" className="btn btn-secondary mx-2" onClick={ ()=>{this.setState({is_edit_game: false})}}>Cancel</button>
									</div>
								}

								{!is_edit_game && <button type="button" className="btn btn-secondary mx-2" onClick={this.editGame}>Edit all</button>}
								{!is_edit_game &&  <button type="button" className="btn btn-success mx-2" onClick={ () =>{ this.addGame(trnmnt) }}>Add Game</button>}
								{!is_edit_game &&  <button type="button" className="btn btn-danger mx-2" onClick={ () =>{ this.deleteTournament(trnmnt) }}>Delete tournament</button>}
							</div>
						</div>
					)}
				</div>
	}
}
module.exports = Tournament