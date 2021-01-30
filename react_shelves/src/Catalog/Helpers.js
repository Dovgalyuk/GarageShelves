import React, { Component } from 'react';
// import Badge from 'react-bootstrap/Badge'
import fetchBackend from '../Backend'
import { CatalogListSection } from './ListSection';

export function CatalogLatest(props) {
    return (
        <CatalogListSection
            title="Latest added catalog items"
            filter={{latest:12}}
        />
    );
}

export class CatalogMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{},
        };
    }

    componentDidMount() {
        fetchBackend('catalog/_get_main',
            {id:this.props.id} )
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, catalog:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading || !this.state.catalog['id']) {
            return <div/>;
        }
        return (
            <h4 className="text-secondary">
                {"Modification of "}
                <a href={"/catalog/view/" + this.state.catalog.id}>
                  {this.state.catalog.root_title}{" : "}
                  {this.state.catalog.title_eng
                    ? this.state.catalog.title_eng
                    : this.state.catalog.title }
                </a>
            </h4>
        );
    }
}
