import React, { Component } from 'react';
import { CatalogSearch } from '../Catalog/Search'

export default class Search extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <>
            <CatalogSearch listProps={{variant:"normal"}} />
        </>
    );
  }
}
