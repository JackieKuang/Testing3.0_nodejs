'use strict';

import React from 'react';
import {Link, IndexLink} from 'react-router';

class Header extends React.Component {
	constructor(props){
		super(props);
		C.Header = this;
	}

	componentDidMount(){
	}

	componentWillUnmount(){
	}

	render(){
		return <div className="TES-header">
			<div className="TES-wrapper">
				// header
			</div>
		</div>
	}
}

export default Header;
