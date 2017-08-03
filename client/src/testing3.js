import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, Redirect } from 'react-router';
import {
	Header, Footer, Home, Home2
} from './components';

Constants.J104.Options = require('../../constants').SYS_OPTIONS;

class Testing extends React.Component{
	constructor(props) {
		super(props);
		window.C = {};
	}

	componentDidMount(){
	}

	render(){
		{console.log('testing3 render');}
		return <div>
			<Header />
			<div className="TES-body TES-wrapper">
				{this.props.children}
			</div>
			<Footer />
		</div>
	}
}

ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/" component={Testing}>
			<IndexRoute component={Home} />
			<Route path="/t1" component={Home} />
			<Route path="/t2" component={Home2} />
			<Route path="/t3" component={Home2} />
		</Route>
	</Router>
), document.getElementById('testing3'));
