var Translate 	= require('./Translate.jsx')
var DB 			= require('./DB.jsx')

class Profile extends React.Component
{	
	constructor(props)
	{
		super()
		log('Profile PROPS:: ', props)
		this.state =
		{
				 user: props.user,
				 session_uuid: props.session_uuid,
				 uuid: props.uuid ? props.uuid : null,
				 firstname: props.firstname ? props.firstname : 'firstname',
				 lastname: props.lastname ? props.lastname : 'lastname',
				 year: props.year ? props.year : 1990,
				 weight: props.weight ? props.weight : 80,
				 gender: props.gender ? props.gender : 'M',
				 kup: props.kup ? props.kup : 1,
				 club: props.club ? props.club : 'megaclub',
				 username: props.username ? props.username : props.user + '_user',
				 country: props.country ? props.country : 'Latvia',
				 password: props.password ? props.password : 1111,
				 inGame: props.inGame ? props.inGame : false
		}
		this.onChange = this.onChange.bind(this)
		this.onClick = this.onClick.bind(this)
		this.callback = props.callback
		
		
	}
	onChange(e)
	{
		const target = e.target
		const name = target.name
		const value = target.value 
		let newObj = {}
		newObj[name] = value
		this.setState(newObj)
	}
	onClick(e)
	{
		let session_uuid = this.state.session_uuid
		let uuid = this.state.uuid
		const target = e.target
		const value = target.value

		if (value == 'Save Changes')
		{
			let form = document.getElementById('proform')
			let props = {}
			for (let key in form)
			{
				if (form.hasOwnProperty(key)) {
					log(form[key].value)
					if(form[key].name) props[form[key].name] = form[key].value
				} 
			}
			log('prof obj:: ', props)
			props.user = this.state.user
			props.uuid = uuid
			DB.setProfile(session_uuid, props, (res) =>
			{	
				this.callback(res)
				log('prof callback fired')
			})
		}
		if (value == 'Cancel')
		{
			this.callback()
		}
	}
	render()
	{
		let
		{
			firstname,
			lastname,
			year,
			weight,
			gender,
			kup,
			club,
			username,
			country,
			password,
			confpassword
		} = this.state

		
		return <div className="container">
			
					<div className="row">
						<div className="col-md-3">
							<div className="text-center">
								<img src="//placehold.it/100" className="avatar img-circle" alt="avatar"/>
								<h6>Upload a different photo...</h6>
								
								<input type="file" className="form-control" onChange={this.onChange}/>
							</div>
						</div>
						
						<div className="col-md-9 personal-info">
							<div className="alert alert-info alert-dismissable">
								<a className="panel-close close" data-dismiss="alert">×</a> 
								<i className="fa fa-coffee"></i>
								Fill <strong> personal data</strong>. !!!.
							</div>
							<h3>Personal info</h3>
							<form id="proform" className="form-horizontal" role="form">
							<div className="form-group">
								<label className="col-lg-3 control-label">First name:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="firstname" value={firstname} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Last name:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="lastname" value={lastname} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Year:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="year" value={year} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Weight:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="weight" value={weight} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Gender:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="gender" value={gender} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Kup:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="kup" value={kup} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Club:</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="club" value={club} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-lg-3 control-label">Country</label>
								<div className="col-lg-8">
								<input className="form-control" type="text" name="country" value={country} onChange={this.onChange}/>
								</div>
							</div>
							{/* <div className="form-group">
								<label className="col-lg-3 control-label">Time Zone:</label>
								<div className="col-lg-8">
								<div className="ui-select">
									<select id="user_time_zone" className="form-control" defaultValue="Hawaii">
									<option value="Hawaii">(GMT-10:00) Hawaii</option>
									<option value="Alaska">(GMT-09:00) Alaska</option>
									<option value="Pacific Time (US &amp; Canada)">(GMT-08:00) Pacific Time (US &amp; Canada)</option>
									<option value="Arizona">(GMT-07:00) Arizona</option>
									<option value="Mountain Time (US &amp; Canada)">(GMT-07:00) Mountain Time (US &amp; Canada)</option>
									<option value="Central Time (US &amp; Canada)" >(GMT-06:00) Central Time (US &amp; Canada)</option>
									<option value="Eastern Time (US &amp; Canada)">(GMT-05:00) Eastern Time (US &amp; Canada)</option>
									<option value="Indiana (East)">(GMT-05:00) Indiana (East)</option>
									</select>
								</div>
								</div>
							</div> */}
							<div className="form-group">
								<label className="col-md-3 control-label">Username:</label>
								<div className="col-md-8">
								<input className="form-control" type="text" name="username" value={username} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-md-3 control-label">Password:</label>
								<div className="col-md-8">
								<input className="form-control" type="password" name="password" value={password} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-md-3 control-label">Confirm password:</label>
								<div className="col-md-8">
								<input className="form-control" type="password" name="confpassword" value={confpassword} onChange={this.onChange}/>
								</div>
							</div>
							<div className="form-group">
								<label className="col-md-3 control-label"></label>
								<div className="col-md-8">
								<input type="button" className="btn btn-primary" value="Save Changes" onClick={this.onClick}/>
									<span></span>
								<input type="reset" className="btn btn-default mx-2" value="Cancel" onClick={this.onClick}/>
								</div>
							</div>
						</form>

						</div>
						



					</div>
				</div>

	
	}
}
module.exports = Profile