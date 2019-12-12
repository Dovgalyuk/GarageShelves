import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { CatalogListSection } from "../Catalog/ListSection";
import CatalogSearchTab from '../Catalog/Search'

export default class Catalog extends Component {
    render() {
      return (
        <>
          <div className="row">
            <div className="page-header">
              <h1>Catalog</h1>
            </div>
          </div>
          <Tabs defaultActiveKey="computers" transition={false}>
            <Tab eventKey="computers" title="Computers">
              <CatalogListSection filter={ {type_name:"Computer family", noparent:true,
                    notype:true, is_group:true} } title="Computer families"
                    auth={this.props.auth} addButton/>
              <CatalogListSection filter={ {type_name:"Computer",
                    notype:true, is_group:false} } title="Computers"
                    auth={this.props.auth} addButton/>
            </Tab>
            <Tab eventKey="consoles" title="Consoles">
              <CatalogListSection filter={ {type_name:"Console family", noparent:true,
                    notype:true, is_group:true} } title="Console families"
                    auth={this.props.auth} addButton/>
              <CatalogListSection filter={ {type_name:"Console",
                    notype:true, is_group:false} } title="Consoles"
                    auth={this.props.auth} addButton/>
            </Tab>
            <Tab eventKey="calculators" title="Calculators">
              <CatalogListSection filter={ {type_name:"Calculator family", noparent:true,
                    notype:true, is_group:true} } title="Calculator families"
                    auth={this.props.auth} addButton/>
              <CatalogListSection filter={ {type_name:"Calculator",
                    notype:true, is_group:false} } title="Calculators"
                    auth={this.props.auth} addButton/>
            </Tab>
            <Tab eventKey="software" title="Software">
              <CatalogListSection filter={ {type_name:"Software family", noparent:"true",
                    notype:true, is_group:"true"} } title="Software families"
                    auth={this.props.auth} addButton/>
              <CatalogListSection filter={ {type_name:"Software",
                    notype:true, is_group:false} } title="Software"
                    auth={this.props.auth} addButton/>
            </Tab>
            <Tab eventKey="storage" title="Data storage">
              <CatalogListSection filter={ {type_name:"Data storage family", noparent:true,
                    notype:true, is_group:true} } title="Data storage families"
                    auth={this.props.auth} addButton/>
            </Tab>
            <Tab eventKey="peripheral" title="Peripheral devices">
              <CatalogListSection filter={ {type_name:"Peripheral device family", noparent:true,
                    notype:true, is_group:true} } title="Peripheral device families"
                    auth={this.props.auth} addButton/>
              <CatalogListSection filter={ {type_name:"Peripheral device",
                    notype:true, is_group:false} } title="Peripheral devices"
                    auth={this.props.auth} addButton/>
            </Tab>
            <Tab eventKey="search" title="Search">
              <CatalogSearchTab auth={this.props.auth} />
            </Tab>
          </Tabs>
        </>
      );
    }
  }
  