import React, { Component } from 'react';
import CatalogListSection from './CatalogList.js'

class Catalog extends Component {
  render() {
    return (
      <>
        <div className="row">
          <div className="page-header">
            <h1>Catalog</h1>
          </div>
        </div>
        <CatalogListSection filter={ {type_name:"Computer family", noparent:"true",
              notype:"true", is_group:"true"} } title="Computer families"/>
        <CatalogListSection filter={ {type_name:"Console family", noparent:"true",
              notype:"true", is_group:"true"} } title="Console families"/>
        <CatalogListSection filter={ {type_name:"Calculator family", noparent:"true",
              notype:"true", is_group:"true"} } title="Calculator families"/>

        <CatalogListSection filter={ {type_name:"Computer",
              notype:"true"} } title="Computers"/>
        <CatalogListSection filter={ {type_name:"Console",
              notype:"true"} } title="Consoles"/>
        <CatalogListSection filter={ {type_name:"Calculator",
              notype:"true"} } title="Calculators"/>
      </>
    );
  }
}

export default Catalog;
