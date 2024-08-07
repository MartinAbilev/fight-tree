var DB = require('./DB.jsx')
var excel2Json = require('node-excel-to-json')


// excel2Json('../../../' + 'sample.xls', function(err, output) {
// 	log('OUTPUT: ',err, output)
// });



class Clubs extends React.Component
{
	constructor(props)
	{
		super()
		this.state = {
			...props, is_edit: false,
			is_open: false, clubTable: false, is_upload: false
		}
		this.onClick 		= this.onClick.bind(this)
		this.onChange 		= this.onChange.bind(this)
		this.onDelete 		= this.onDelete.bind(this)
		this.onSave 		= this.onSave.bind(this)
		this.onOpen 		= this.onOpen.bind(this)
		this.onClose 		= this.onClose.bind(this)
		this.onUpload 		= this.onUpload.bind(this)
		this.onFileSelect 	= this.onFileSelect.bind(this)
		this.getTournamentById 	= this.getTournamentById.bind(this)

		this.callback = props.callback
		this.filesInput = []
		log('CKUB STATE:', this.state)
	}
	onChange(event)
	{
		const target = event.target
		const name = target.name
		const value = target.value

		let state = Object.assign({}, this.state)
		state[name] = value
		this.setState( state );

		log('onCHANGE: ',this.state, name)
	}
	onClick()
	{
		this.setState({ is_edit: !this.state.is_edit })
	}
	onDelete()
	{
		log('CLUB UUID:: ', this.state.uuid)
		this.setState({ is_edit: !this.state.is_edit })
		let club = { uuid: this.state.uuid }
		const session_uuid = this.state.session_uuid
		DB.delClubs(session_uuid, club,
			(clubs) =>
			{
				log('changed', clubs)
				this.callback('del')
			})
	}
	onOpen()
	{
		// BIG SHIT HERE THIS VAT CLUB IS ACTUALY PARTICIPANTS
		log('CLUB UUID:: ', this.state.uuid)
		// this.setState({ is_edit: !this.state.is_edit })
		let club = { clubName: this.state.title }
		let session_uuid = this.state.session_uuid
		DB.openClubs(session_uuid, club,
			(clubs) =>
			{
				log('open club', clubs)
				let rows = []
				if (clubs.map)
				{
					clubs.map((club, key) =>
					{
						rows.push({name: club.firstname, key: key, participant: club,  inTournament: club.inTournament || false, ...club })
					})
					this.setState({ clubTable: rows, is_open: true })
					this.callback({ type: 'club', participants: clubs })
					this.setState({clubs: clubs})
				}

			})
	}
	onClose()
	{
		this.setState({ is_open: false, clubTable: [] })
		this.callback('closeClub')
	}
	onSave()
	{
		log('CLUB UUID:: ', this.state.uuid)
		this.setState({ is_edit: !this.state.is_edit })
		let club = { title: this.state.title, text: this.state.text, but_label: this.state.but_label, uuid: this.state.uuid }
		let session_uuid = this.state.session_uuid
		DB.setClubs(session_uuid, club,
			(clubs) =>
			{
				log('changed', clubs)
			})

	}
	onUpload(event)
	{
		event.preventDefault()
		this.setState({ is_upload: false })
		const target = event.target
		const name = target.name
		const value = target.value
		const session_uuid = this.state.session_uuid

		const files = this.filesInput.files;

		let formData = new FormData();
		for (var key in files) {
			// check if this is a file:
			if (files.hasOwnProperty(key) && files[key] instanceof File) {
				formData.append(key, files[key]);
			}
		}

		log('ON UPLOAD: ', target, name, value, formData.entries())

		DB.upXls(session_uuid, formData, (response) =>
		{
			log('XLS UPLOAD STATUS: ', response)

			for (let clubName in response.result)
			{
				let club = response.result[clubName]
				club.map((participant, key) =>
				{
					let props =
					{
						user: participant.user,
						session_uuid: participant.session_uuid,
						uuid: participant.uuid ? participant.uuid : null,
						firstname: participant.firstname ? participant.firstname : 'firstname',
						lastname: participant.lastname ? participant.lastname : 'lastname',
						year: participant.year ? participant.year : 1990,
						weight: participant.weight ? participant.weight : 80,
						gender: participant.gender ? participant.gender : 'M',
						kup: participant.kup ? participant.kup : 1,
						in_game_uuid: participant.in_game_uuid ? participant.in_game_uuid : false,
						// club: participant.club ? participant.club : 'megaclub',
						username: participant.username ? participant.username : participant.user + '_user',
						country: participant.country ? participant.country : 'Latvia',
						password: participant.password ? participant.password : 1111,
						inTournament: participant.inTournament ? participant.inTournament : false
					}

					props.club = clubName

					log(`PARTICIPANT FROM CLUB ${clubName}: `, participant, key)
					for (let key in participant)
					{
						if (participant.hasOwnProperty(key)) {
							log(participant[key])
							props[key] = participant[key]
						}
					}
					log('NEW PARTICIPANT FROM XLS:: ', props)

					// props.uuid = uuid
					DB.setProfile(session_uuid, props, (res) =>
					{
						//this.callback({type: 'club', event: 'updated', result: res})
						log('prof callback fired')
					})
				})
			}
			this.setState({is_upload: false})
		})
	}
	onFileSelect()
	{
		this.setState({is_upload: true})
	}
	getTournamentById(uuid)
	{
		let {tournament} = this.state

		if(tournament)
		{
			log('GET TOURNAMENT BY ID: ', tournament)
			tournament.map((seed, key)=>
			{
				if(seed.uuid == uuid)
				{
					log("SEED1: ", seed.name, uuid)

					this.setState({requestName: seed.name})

				}
			})


		}
		else
		{
			DB.getTournament(this.state.session_uuid, (res) =>
			{
				let tournaments = res
				if (tournaments.length)
				{
					log('TOURNAMENT ADEED: ', res)
					tournaments.map((seed, key)=>
					{
						if(seed.uuid == uuid)
						{
							log("SEED: ", seed, uuid)

							this.setState({requestName: seed.name})
						}
					})


				}
			})
		}


	}
	render()
	{	let session_uuid = this.state.session_uuid
		let { title, text, is_edit, is_open, is_upload, clubTable, inTournament, requestName } = this.state
		let width = is_open ? "max-content" : "16rem"
		console.log('REQUEST NAME: ', requestName, inTournament)
		!requestName && this.getTournamentById(inTournament)
		return <div className="card px-1 py-1" style={{ width: width}}>
					<img className="card-img-top d1" src={"img/sport.svg"} style={{ height: "4rem"}} alt="Card image cap"/>
						<div className="card-block">

						{is_open && <div className="text-center c1">
							<div>Upload XLS to add more participants...</div>
							<form onSubmit={this.onUpload}>
								<input type="file"
									ref={(input) => { this.filesInput = input; }}
									name="file" onChange={this.onFileSelect}/>
									{is_upload && <button type="submit" className="btn btn-success btn-block">Submit</button>}
							</form>
						</div>}


						<div className="card-text c1">
						{
							!is_edit ?
							<h4 className="card-title c1">{title || 'Club title'}</h4> :
							<input type="text" name="title" defaultValue={title} className="my-1" onChange={this.onChange}/>
						}
						</div>
						{
							!is_edit?
							<p className="card-text c1">{text || 'short info about club'}</p> :
							<textarea name="text" rows="5" defaultValue={text} onChange={this.onChange}></textarea>
						}

						<div className="my-2 c1 text-left">
							<div className="card-text c1">Tournament request from: {requestName}</div>

							<table className="table table-bordered table-striped">
								<tbody>
								{clubTable ? clubTable.map((row, key) =>
								<tr key={key}>
									<td>{key}</td>
									<td>{row.firstname}</td>
									<td>{row.lastname}</td>
									<td>{row.year}</td>
									<td>{row.weight}</td>
									<td>{row.gender}</td>
									<td>{row.kup}</td>
									<td>{row.country}</td>
									<td><input type="checkbox" className="check" checked={row.inTournament} name={row.name} value={row.inTournament}
									onChange={(e)=>
									{
										row.inTournament = !row.inTournament
										row.participant.inTournament = e.target.checked ? inTournament : false
										DB.setProfile(session_uuid, row.participant,
										(res)=>{log('CLUB PART CLICK: ', res)} )
										this.callback({ type: 'club', participants: this.state.clubs})
									}}/></td>
								</tr> ) : <tr><td>NO ROW</td></tr> }
								</tbody>
							</table>
						</div>

						{
							!is_open ?
							<a href="#" className="btn btn-primary float-left" onClick={this.onOpen}>{'Open club'}</a> :
							<a href="#" className="btn btn-primary float-left" onClick={this.onClose}>{'Close club'}</a>
						}
						{
							!is_edit ?
							'':
							<a href="#" className="btn btn-warning   float-left" onClick={this.onDelete}>Delete</a>
						}
						{
							!is_edit ?
							<a href="#" className="btn btn-secondary float-right" onClick={this.onClick}>Edit</a>:
							<a href="#" className="btn btn-success   float-right" onClick={this.onSave}>Save</a>
						}
						{
							is_edit &&
							<a href="#" className="btn btn-secondary float-right" onClick={ (e)=>
								{
									inTournament = false
									this.onSave(e)
								}}>Reset</a>
						}
					</div>
				</div>
	}
}
module.exports = Clubs