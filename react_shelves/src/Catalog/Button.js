import React, { Component } from 'react';
import Button from 'react-bootstrap/Button'
import fetchBackend from '../Backend'

export default class CatalogButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{},
        };
    }

    componentDidMount() {
        fetchBackend('catalog/_get', {id:this.props.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, catalog:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
      return (
        <Button size="sm" variant="info">
            {this.state.catalog.title_eng || this.state.catalog.title}
        </Button>
      );
    }
}
