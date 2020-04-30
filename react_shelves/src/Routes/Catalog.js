import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { CatalogListSection } from "../Catalog/ListSection";
import CatalogSearchTab from '../Catalog/Search'
import fetchBackend from '../Backend'

class CatalogSections extends Component {
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
        { this.state.sections.map(s => <CatalogListSection key={s.id}
              filter={ {parent:s.parent, parent_rel: s.relation,
              type: s.type, notype: true, noroot: true} } title={s.title}
              auth={this.props.auth} addButton/>)
        }
      </>
    );
  }
}

export default class Catalog extends Component {
  constructor(props) {
      super(props);
      this.state = {
          loadingPages:true,
          pages:{},
      };
  }

  componentDidMount() {
    fetchBackend('page/catalog', {})
        .then(response => response.json())
        .then(data => {
            this.setState({loadingPages:false, pages:data});
        })
        .catch(e => this.setState({loadingPages:false}));
  }

  render() {
      if (this.state.loadingPages) {
        return "Loading...";
      }
      return (
        <>
          <div className="row">
            <div className="page-header">
              <h1>Catalog</h1>
            </div>
          </div>
          <Tabs defaultActiveKey={this.state.pages[0].title} mountOnEnter={true}>
            { this.state.pages.map(p => <Tab eventKey={p.title} title={p.title} key={p.id}>
                <CatalogSections page={p.id} auth={this.props.auth} />
              </Tab>)
            }
            <Tab eventKey="search" title="Search">
              <CatalogSearchTab auth={this.props.auth} />
            </Tab>
          </Tabs>
        </>
      );
  }
}
