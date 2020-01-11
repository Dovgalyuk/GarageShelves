import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown';
import fetchBackend from '../Backend'
import { ItemListSection } from '../Item/ListSection'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

class CollectionPage extends Component {
  constructor(props) {
      super(props);
      this.state = {
          loading:true,
          sections:{},
      };
  }

  componentDidMount() {
    fetchBackend('page/sections', {page:this.props.page})
        .then(response => response.json())
        .then(data => {
            this.setState({loading:false, sections:data});
        })
        .catch(e => this.setState({loading:false}));
  }

  render() {
    if (this.state.loading) {
      return "Loading...";
    }
    return (
      <>
        { this.state.sections.map(s => {
          if (s.is_physical === 1) {
            return <ItemListSection key={s.id} filter={ {catalog_parent: s.parent,
                catalog_parent_rel: s.relation, type: s.type,
                collection:this.props.collection} } title={s.title} />;
          } else {
            return <div key={s.id} />;
          }
          })
        }
      </>
    );
  }
}


export default class CollectionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            collection:{},
            loadingPages:true,
            pages:{},
        };
    }

    componentDidMount() {
        fetchBackend('collection/_get', {id:this.props.match.params.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, collection:data});
            })
            .catch(e => this.setState({loading:false}));
        fetchBackend('page/catalog', {})
            .then(response => response.json())
            .then(data => {
                this.setState({loadingPages:false, pages:data});
            })
            .catch(e => this.setState({loadingPages:false}));
    }

    render() {
        if (this.state.loading || this.state.loadingPages) {
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
              <Tabs defaultActiveKey={this.state.pages[0].title} transition={false}>
                { this.state.pages.map(p => <Tab eventKey={p.title} title={p.title} key={p.id}>
                      <CollectionPage page={p.id} auth={this.props.auth}
                          collection={this.state.collection.id} />
                    </Tab>)
                }
                <Tab eventKey="software" title="All items">
                  <ItemListSection filter={ {collection:this.state.collection.id } }
                                  title="Items in the collection" />
                </Tab>
              </Tabs>
            </Container>
        );
    }
}
