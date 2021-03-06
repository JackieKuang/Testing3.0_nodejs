'use strict';

import React from 'react';
import {Link} from 'react-router';

class Home extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	componentWillUnmount(){
	}

	test2() {
		console.log('Home');

		this.ajax = new Ajax({
			method: 'get',
			url: '/api/test/t2',
			onComplete: () => {
				console.log('onComplete');
			},
			onSuccess: (code, message, data) => {
				console.log('onSuccess', data,message,code);
			}
		});
		this.ajax.send();
	}

	render() {
		{
			console.log('Home render');
		}
		return <div className="container-fluid">
			// Home
			<br/>
			<button onClick={()=>{this.test2();}}>Home</button>
			<br/>
			<Link to="/t2">t2</Link>
			<br/>
			<Link to="/t3">t3</Link>
		</div>
	}
}

export default Home;
