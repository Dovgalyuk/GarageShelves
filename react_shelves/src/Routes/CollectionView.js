import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown';
import fetchBackend from '../Backend'
import { ItemListSection } from '../Item'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default class CollectionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            collection:{}
        };
    }

    componentDidMount() {
        fetchBackend('collection/_get', {id:this.props.match.params.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, collection:data});
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
              <div className="page-header">
                <Row>
                  <h2>
                    {this.state.collection.title}
                    <small> owned by {this.state.collection.username}</small>
                  </h2>
                </Row>
              </div>
              <Row>
                <Col>
                  <ReactMarkdown source={ this.state.collection.description } />
                </Col>
              </Row>
              <ItemListSection filter={ {collection:this.state.collection.id } }
                               title="Items in the collection" />
            </Container>
        );
    }
}
