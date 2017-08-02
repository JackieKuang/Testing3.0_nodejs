'use strict';

import React from 'react';
import {Link, IndexLink} from 'react-router';

class Footer extends React.Component {
	constructor(props){
		super(props);
	}

	componentDidMount(){}

	shouldComponentUpdate(nextProps, nextState){
		return false;
	}

	render(){
		return <div className="TES-footer">
			<div className="TES-wrapper">
				<Link to="/explorer" target="explorer" className="ico ico-code small">api explorer</Link>
			</div>
		</div>
	}
}

export default Footer;
