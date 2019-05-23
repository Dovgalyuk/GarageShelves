import React, { Component } from 'react'
import fetchBackend from '../Backend'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Collection } from '../Collection'

export default class Collections extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            collections:[]
        };
    }

    componentDidMount() {
        fetchBackend('collection/_filtered_list', {})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, collections:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading) {
            return (
                <div>Loading...</div>
            );
        }

        return (
            <Container>
              <Row>
                <div className="page-header">
                  <h1>All collections</h1>
                </div>
              </Row>
             {this.state.collections.map((c) =>
                <Collection key={c.id} collection={c} />)}
            </Container>
        );
    }
}
