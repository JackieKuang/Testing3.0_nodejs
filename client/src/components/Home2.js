'use strict';

import React from 'react';
import {Link} from 'react-router';

class Home2 extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	componentWillUnmount(){
	}

	test2() {
		console.log('Home2');

		this.ajax = new Ajax({
			method: 'get',
			url: '/api/test/t1',
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
			console.log('Home2 render');
		}
		return <div className="container-fluid">
			// Home2
			<br/>
			<button onClick={()=>{this.test2();}}>Home2</button>
			<br/>
			<Link to="/t1">t1</Link>
		</div>
	}
}

export default Home2;
