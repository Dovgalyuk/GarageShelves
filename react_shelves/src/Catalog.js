import React, { Component, Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import fetchBackend, { BackendURL } from './Backend'
import ImageListSection from './Image'

class Logo extends Component {
    render() {
        if (this.props.img_id) {
            return <img src={ BackendURL('uploads/view', { id:this.props.img_id } ) }
                        alt="logo"
                   />;
        } else {
            return <span className="text-muted"><i className="fas fa-laptop fa-4x"></i></span>;
        }
    }
}

class CatalogItem extends Component {
    render() {
        // TODO: main item
        return <div className="col-4">
                 <div className="row pt-4">
                   <div className="col-3 align-self-center">
                     <Logo id={this.props.item.id} img_id={this.props.item.logo_id} />
                   </div>
                   <div className="col-9">
                     <a className="action" href={"/catalog/view/" + this.props.item.id}>
                       <h5>{this.props.item.type_title && !this.props.notype
                                ? this.props.item.type_title + " : " : ""}
                           {this.props.item.title_eng ? this.props.item.title_eng : this.props.item.title}</h5>
                     </a>
                 <h6 className="text-secondary">{this.props.item.title_eng ? this.props.item.title : ""}</h6>
                 <p>
                    <span className="badge badge-secondary">{this.props.item.year}</span>
                    &nbsp;
                    {this.props.item.company
                        && <a className="text-secondary"
                            href={"/company/view/id=" + this.props.item.company_id}>
                            {this.props.item.company}
                        </a>}
                    &nbsp;
                    {this.props.item.count > 0
                        && <span className="badge badge-secondary">{
                            this.props.item.count + ' item' + (this.props.item.count > 1 ? 's' : '')
                        }</span>}
                 </p>
                 </div></div>
               </div>;
    }
}

function CatalogListRow(props) {
    return <div className="row pt-4">
             { props.row.map((item) => <CatalogItem key={item.id} item={item} notype={props.notype}/>)}
           </div>;
}

class CatalogListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rows: []
        };
    }

    componentDidMount() {
        fetchBackend('catalog/_filtered_list', this.props.filter)
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 3));
                }
                this.setState({loading:false, rows:rows});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="row"><div className="col-12">
                  <h3 className="pt-4">
                    {this.props.title} <span className="text-info"> are loading</span>
                  </h3>
                </div></div>
            );
        }
        return <Fragment>
                 {this.state.rows.length > 0 &&
                   <div className="row"><div className="col-12">
                     <h3 className="pt-4">
                       {this.props.title}
                     </h3>
                   </div></div>
                 }
                 {this.state.rows.map((row) =>
                    <CatalogListRow key={row[0].id/*TODO*/} row={row} notype={this.props.filter.notype}/>)}
               </Fragment>;
    }
}

// Routes

export class CatalogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{}
        };
    }

    componentDidMount() {
        fetchBackend('catalog/_get', {id:this.props.match.params.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, catalog:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    render() {
        if (this.state.loading) {
            return (
                <div>Loading...</div>
            );
        }
        const catalog = this.state.catalog;
        if (!catalog.id) {
            return (
            <div className="row">
              <div className="page-header">
                <h1>Catalog item not found</h1>
              </div>
            </div>
            );
        }
        return (
          <>
            <div className="page-header">
              <div className="row">
                <div className="col-1 align-self-center"><Logo img_id={catalog.logo_id} /></div>
                <div className="col-9 align-self-center">
                  <h1>
                    { catalog.type_title } : { catalog.title_eng ? catalog.title_eng : catalog.title }
                  </h1>
                  { catalog.title_eng && catalog.title
                    && <h4 className="text-secondary">{ catalog.title }</h4>
                  }
                  <p className="text-secondary">
                    { catalog.year &&
                      <span className="badge badge-secondary">{ catalog.year }</span>
                    }
                    { catalog.company &&
                      <a href={ "company/view/" + catalog.company_id }>{ catalog.company }</a>
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <h3 className="pt-4">Description</h3>
                <ReactMarkdown source={ catalog.description } />
              </div>
            </div>

            <ImageListSection id={ catalog.id } entity="catalog"
                title="Catalog item images"/>

            { catalog.is_group === 1 &&
              <CatalogListSection
                filter={ {parent:catalog.id, notype:true, is_group:true} }
                title="Includes the families" />
            }
            { catalog.is_physical === 1 &&
              <CatalogListSection
                filter={ {type_name:"Kit", notype:true, includes:catalog.id} }
                title="Kits with this item" />
            }
            <CatalogListSection
              filter={ {parent:catalog.id} }
              title="Includes the following catalog items" />

        {/* TODO: Owned items */}
          </>
        );
    }
}

export class Catalog extends Component {
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

export default Catalog
