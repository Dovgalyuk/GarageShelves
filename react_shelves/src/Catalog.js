import React, { Component, Fragment } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import fetchBackend, { postBackend, BackendURL, uploadBackend } from './Backend'
import FormCatalogCreate from './Forms/CatalogCreate'
import FormFamilySelect from './Forms/FamilySelect'

export class Logo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            img_id:this.props.img_id
        }
    }

    handleDoubleClick = () => {
        if (this.props.main && this.props.auth.isAdmin) {
            this.inputRef.click();
        }
    }

    handleUpload = () => {
        if (window.confirm('Do you want to upload new logo?')) {
            uploadBackend('catalog/_set_logo', {id:this.props.id},
                this.inputRef.files[0])
                .then(response => response.json())
                .then(response => {
                    this.setState({img_id:null}, this.handleUpdate);
                })
                .catch(e => {});
        }
    }

    handleUpdate = () => {
        if (!this.state.img_id && this.props.id) {
            fetchBackend('catalog/_get', {id:this.props.id})
                .then(response => response.json())
                .then(data => {
                    this.setState({img_id:data.logo_id});
                })
                .catch(e => {});
        }
    }

    componentDidMount() {
        this.handleUpdate();
    }

    render() {
        return (
          <div onDoubleClick={this.handleDoubleClick} >
            { this.state.img_id && this.state.img_id !== -1
                ? <img src={ BackendURL('uploads/view', { id:this.state.img_id } ) }
                        alt="logo"
                   />
                : <span className="text-muted"><i className="fas fa-laptop fa-4x"></i></span>
            }
            {(this.props.main && this.props.auth.isAdmin)
                ? <input type="file" style={{display: "none"}}
                          ref={(ref) => {this.inputRef = ref;}}
                          onChange={this.handleUpload} />
                : ""
            }
          </div>
        );
    }
}

class CatalogItem extends Component {
    render() {
        // TODO: main item
        return <div className="col-4">
                 <div className="row pt-4">
                   <div className="col-3 align-self-center">
                     <Logo id={this.props.item.id} img_id={this.props.item.logo_id ? this.props.item.logo_id : -1} />
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
                        ? <a className="text-secondary"
                            href={"/company/view/" + this.props.item.company_id}>
                            {this.props.item.company}
                          </a>
                        : ""}
                    &nbsp;
                    {this.props.item.count > 0
                        ? <span className="badge badge-secondary">{
                            this.props.item.count + ' item' + (this.props.item.count > 1 ? 's' : '')
                            }
                          </span>
                        : ""
                    }
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

export class CatalogListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rows: [],
            showFormCreate:false,
        };
    }

    handleUpdate = () => {
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

    componentDidMount() {
        this.handleUpdate();
    }

    handleCreateButton = event => {
        this.setState({showFormCreate:true});
    }

    handleFormCreateClose = event => {
        this.setState({showFormCreate:false});
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
                 { (this.state.rows.length > 0 || this.props.addButton)
                   && <Row>
                     <Col>
                       <h3 className="pt-4">
                         {this.props.title} &nbsp;
                       { (this.props.addButton
                            && this.props.auth
                            && this.props.auth.isAuthenticated)
                         ? <Button type="button" className="btn btn-primary"
                                    onClick={this.handleCreateButton}>
                             Add new
                           </Button>
                         : <div/>
                       }
                       </h3>
                     </Col>
                   </Row>
                 }
                 {this.state.rows.map((row) =>
                    <CatalogListRow key={row[0].id/*TODO*/} row={row} notype={this.props.filter.notype}/>)}
                 { (this.props.addButton && this.props.auth
                    && this.props.auth.isAuthenticated)
                    ? <FormCatalogCreate open={this.state.showFormCreate}
                           onClose={this.handleFormCreateClose}
                           handleUpdateItems={this.handleUpdate}
                           {...this.props.filter} />
                    : <div/>
                 }
               </Fragment>;
    }
}

export class CatalogFamilies extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            families:[],
            showForm:false,
        };
    }

    componentDidMount() {
        this.handleUpdate();
    }

    handleUpdate = () => {
        fetchBackend('catalog/_filtered_list',
            {includes:this.props.id, is_group:true} )
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, families:data});
            })
            .catch(e => this.setState({loading:false}));
    }

    handleDelete = (family) => {
        postBackend('catalog/_relation_remove', {},
            {id:this.props.id, family:family})
            .catch(e => {})
            .finally((e) => {
                this.handleUpdate();
            });
    }

    handleAdd = () => {
        this.setState({showForm:true});
    }

    handleFormClose = () => {
        this.setState({showForm:false});
    }

    handleFormSelect = (family) => {
        postBackend('catalog/_relation_add', {},
            {id2:this.props.id, id1:family})
            .catch(e => {})
            .finally((e) => {
                this.handleUpdate();
            });
    }

    render() {
        if (this.state.loading) {
            return <div/>;
        }
        return (
            <Fragment>
                <ListGroup>
                  { this.state.families.length > 0
                    ? <ListGroup.Item className="border-0 pt-0 pb-0" key={-1}>
                        In families
                      </ListGroup.Item>
                    : <div/>
                  }
                  { this.state.families.map((f) =>
                      <ListGroup.Item key={f.id}
                            className="border-0 pt-0 pb-0">
                        {this.props.auth.isAdmin
                          ? <Button variant="outline-danger"
                                  onClick={() => this.handleDelete(f.id)}>
                              <i className="fas fa-trash-alt"/>
                            </Button>
                          : <div/>
                        }
                        &nbsp;
                        <a href={"/catalog/view/" + f.id}>
                          {f.title_eng || f.title}
                        </a>
                      </ListGroup.Item>
                    )
                  }
                  { this.props.auth.isAdmin
                    ? <ListGroup.Item className="border-0 pt-0 pb-0" key={-2}>
                        <Button variant="outline-primary"
                                onClick={this.handleAdd}>
                          <i className="fas fa-plus"/>
                        </Button>
                        &nbsp;
                        Add to family
                      </ListGroup.Item>
                    : <div/>
                  }
                </ListGroup>
                { (this.props.auth.isAuthenticated && this.props.auth.isAdmin)
                    ? <FormFamilySelect open={this.state.showForm}
                             onClose={this.handleFormClose}
                             onSelect={this.handleFormSelect} />
                    : <div/>
                }
            </Fragment>
        );
    }
}

export function CatalogLatest(props) {
    return (
        <CatalogListSection
            title="Latest added catalog items"
            filter={{latest:10}}
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
                  {this.state.catalog.type_title}{" : "}
                  {this.state.catalog.title_eng
                    ? this.state.catalog.title_eng
                    : this.state.catalog.title }
                </a>
            </h4>
        );
    }
}
