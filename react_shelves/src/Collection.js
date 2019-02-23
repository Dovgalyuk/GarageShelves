import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown';
import fetchBackend from './Backend'
import { ItemListSection } from './Item'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function Collection(props) {
    return (
      <Row className="pt-4">
        <Col xs={1}>
          <span className="text-muted"><i className="fas fa-boxes fa-4x"></i></span>
        </Col>
        <Col xs={11}>
          <h2>
            <a className="action" href={"/collection/view/" + props.collection.id}>
              { props.collection.title }
            </a>
            <small> owned by { props.collection.username }</small>
          </h2>
          <p>
            <span className="badge badge-secondary">
              { props.collection.count } item{ props.collection.count > 1 && "s"}
            </span>
          </p>
          <ReactMarkdown source={ props.collection.description } />
        </Col>
      </Row>
    );
}

///////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////

export class CollectionView extends Component {
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

export class Collections extends Component {
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


export default Collections
