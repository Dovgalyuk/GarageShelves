import React, { Component, Fragment } from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import fetchBackend, { postBackend, BackendURL, uploadBackend } from './Backend'
import ImageListSection from './Image'
import { ItemListSection } from './Item'
import EditText from './EditText'
import EditDropDown from './EditDropDown'
import FormCatalogCreate from './Forms/CatalogCreate'
import FormOwn from './Forms/Own'
import FormKitCreate from './Forms/KitCreate'
import FormFamilySelect from './Forms/FamilySelect'

class Logo extends Component {
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
            { this.state.img_id
                ? <img src={ BackendURL('uploads/view', { id:this.state.img_id } ) }
                        alt="logo"
                   />
                : <span className="text-muted"><i className="fas fa-laptop fa-4x"></i></span>
            }
            {(this.props.main && this.props.auth.isAdmin)
                && <input type="file" style={{display: "none"}}
                          ref={(ref) => {this.inputRef = ref;}}
                          onChange={this.handleUpload} />
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
                            href={"/company/view/" + this.props.item.company_id}>
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
                 { (this.state.rows.length > 0 || this.props.addButton) &&
                   <Row>
                     <Col>
                       <h3 className="pt-4">
                         {this.props.title} &nbsp;
                       { (this.props.addButton
                            && this.props.auth
                            && this.props.auth.isAuthenticated
                            && this.props.auth.isAdmin)
                         && <Button type="button" className="btn btn-primary"
                                    onClick={this.handleCreateButton}>
                             Add new
                           </Button>
                       }
                       </h3>
                     </Col>
                   </Row>
                 }
                 {this.state.rows.map((row) =>
                    <CatalogListRow key={row[0].id/*TODO*/} row={row} notype={this.props.filter.notype}/>)}
                 { (this.props.addButton && this.props.auth
                    && this.props.auth.isAuthenticated
                    && this.props.auth.isAdmin)
                    && <FormCatalogCreate open={this.state.showFormCreate}
                           onClose={this.handleFormCreateClose}
                           handleUpdateItems={this.handleUpdate}
                           {...this.props.filter} />
                 }
               </Fragment>;
    }
}

class CatalogFamilies extends Component {
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
                    && <ListGroup.Item className="border-0 pt-0 pb-0" key={-1}>
                        In families
                      </ListGroup.Item>
                  }
                  { this.state.families.map((f) =>
                      <ListGroup.Item key={f.id}
                            className="border-0 pt-0 pb-0">
                        {this.props.auth.isAdmin &&
                          <Button variant="outline-danger"
                                  onClick={() => this.handleDelete(f.id)}>
                            <i className="fas fa-trash-alt"/>
                          </Button>
                        }
                        &nbsp;
                        <a href={"/catalog/view/" + f.id}>
                          {f.title_eng || f.title}
                        </a>
                      </ListGroup.Item>
                    )
                  }
                  { this.props.auth.isAdmin
                    && <ListGroup.Item className="border-0 pt-0 pb-0" key={-2}>
                        <Button variant="outline-primary"
                                onClick={this.handleAdd}>
                          <i className="fas fa-plus"/>
                        </Button>
                        &nbsp;
                        Add to family
                      </ListGroup.Item>
                  }
                </ListGroup>
                { (this.props.auth.isAuthenticated && this.props.auth.isAdmin) &&
                    <FormFamilySelect open={this.state.showForm}
                             onClose={this.handleFormClose}
                             onSelect={this.handleFormSelect} />
                }
            </Fragment>
        );
    }
}

///////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////

export class CatalogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{},
            showFormOwn:false,
            showFormCreateSubitem:false,
            showFormCreateKit:false,
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

    handleEditField = (field, value) => {
        postBackend('catalog/_update', {id:this.props.match.params.id},
            {field:field, value:value});
    }

    handleOwnButton = event => {
        this.setState({showFormOwn:true});
    }

    handleFormOwnClose = event => {
        this.setState({showFormOwn:false});
    }

    handleCreateKitButton = event => {
        this.setState({showFormCreateKit:true});
    }

    handleFormCreateKitClose = event => {
        this.setState({showFormCreateKit:false});
    }

    handleCreateSubitemButton = event => {
        this.setState({showFormCreateSubitem:true});
    }

    handleFormCreateSubitemClose = event => {
        this.setState({showFormCreateSubitem:false});
    }

    handleUpdateItems = () => {
        if (this.itemsRef) {
            this.itemsRef.handleUpdate();
        }
    }

    handleUpdateCatalogItems = () => {
        if (this.childrenRef) {
            this.childrenRef.handleUpdate();
        }
        if (this.familiesRef) {
            this.familiesRef.handleUpdate();
        }
    }

    handleUpdateKitItems = () => {
        if (this.kitsRef) {
            this.kitsRef.handleUpdate();
        }
    }

    handleLoadCompanies = callback => {
        fetchBackend('company/_filtered_list', {})
            .then(response => response.json())
            .then(data => {
                callback(data.map(c => { return {value:c.id, name:c.title}; }));
            })
            .catch(e => {});
    }

    handleCompanyRender = (value, name) => {
        if (value > 0)
            return <a href={"/company/view/" + value}>{ name }</a>;
        else
            return <span>{ name} </span>;
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
            <Fragment>
              <Container>
                <div className="page-header">
                  <Row>
                    <Col xs={1} className="align-self-top">
                      <Logo id={catalog.id}
                            main auth={this.props.auth}/>
                    </Col>
                    <Col xs={10} className="align-self-top">
                      <h1>
                        <EditText prefix={catalog.type_title + " : "}
                             value={ catalog.title_eng ? catalog.title_eng : catalog.title }
                             hint="English title"
                             onSave={v => this.handleEditField("title_eng", v)}/>
                      </h1>
                      <h4 className="text-secondary">
                         <EditText value={ catalog.title } hint="Native title"
                                   onSave={v => this.handleEditField("title", v)}/>
                      </h4>
                      <div className="text-secondary">
                          Manufactured since&nbsp;
                          <span className="badge badge-secondary">
                            <EditText value={ catalog.year || "" }
                                      hint="Start of production year" type="number"
                                      onSave={v => this.handleEditField("year", v)}/>
                          </span>
                          &nbsp;by&nbsp;
                          <EditDropDown value={catalog.company_id}
                                        name={catalog.company}
                                        hint={"Company name"}
                                        defaultValue={-1}
                                        defaultName="Unknown"
                                        onLoadList={this.handleLoadCompanies}
                                        onSave={v => this.handleEditField("company_id", v)}
                                        onRender={this.handleCompanyRender}
                          />
                      </div>

                      <CatalogFamilies id={catalog.id} auth={this.props.auth}/>
                    </Col>
                    <Col xs={1} className="align-self-top">
                    { (this.props.auth.isAuthenticated && this.props.auth.isAdmin)
                      ? <Button variant="primary"
                                onClick={this.handleCreateSubitemButton}>
                          Create subitem
                        </Button>
                      : <span/>
                    }
                    &nbsp;
                    { (this.props.auth.isAuthenticated && this.props.auth.isAdmin
                        && catalog.is_physical)
                      ? <Button variant="primary"
                                onClick={this.handleCreateKitButton}>
                          Create kit
                        </Button>
                      : <span/>
                    }
                    &nbsp;
                    { (this.props.auth.isAuthenticated && catalog.is_physical)
                      ? <Button variant="primary"
                                onClick={this.handleOwnButton}>
                          I own this
                        </Button>
                      : <span/>
                    }
                    </Col>
                  </Row>
                </div>

                <div className="row">
                  <div className="col-12">
                    <h3 className="pt-4">Description</h3>
                    <EditText value={catalog.description}
                        type="markdown" hint="Catalog item description"
                        onSave={v => this.handleEditField("description", v)}
                        inputProps={{rows:10, cols:80}}/>
                  </div>
                </div>

                <ImageListSection id={ catalog.id } entity="catalog"
                    title="Catalog item images" auth={this.props.auth} />

                { catalog.is_group === 1 &&
                  <CatalogListSection
                    ref={(ref) => {this.familiesRef = ref;}}
                    filter={ {parent:catalog.id, notype:true, is_group:true} }
                    title="Includes the families" />
                }
                { catalog.is_physical === 1 &&
                  <CatalogListSection
                    ref={(ref) => {this.kitsRef = ref;}}
                    filter={ {type_name:"Kit", notype:true, includes:catalog.id} }
                    title="Kits with this item" />
                }
                <CatalogListSection
                    ref={(ref) => {this.childrenRef = ref;}}
                    filter={ {parent:catalog.id} }
                    title="Includes the following catalog items" />

                { this.props.auth.isAuthenticated &&
                    <ItemListSection
                        ref={(ref) => {this.itemsRef = ref;}}
                        filter={ {catalog:catalog.id, user:this.props.auth.user_id} }
                        title="Items in your collection" />
                }
              </Container>
              { this.props.auth.isAuthenticated &&
                <FormOwn open={this.state.showFormOwn}
                         onClose={this.handleFormOwnClose}
                         handleUpdateItems={this.handleUpdateItems}
                         id={catalog.id} />
              }
              { (this.props.auth.isAuthenticated && this.props.auth.isAdmin) &&
                <FormCatalogCreate open={this.state.showFormCreateSubitem}
                         onClose={this.handleFormCreateSubitemClose}
                         handleUpdateItems={this.handleUpdateCatalogItems}
                         parent={catalog.id} />
              }
              { (this.props.auth.isAuthenticated && this.props.auth.isAdmin) &&
                <FormKitCreate open={this.state.showFormCreateKit}
                         onClose={this.handleFormCreateKitClose}
                         handleUpdateItems={this.handleUpdateKitItems}
                         main_id={catalog.id}
                         main_title={catalog.title_eng || catalog.title} />
              }
            </Fragment>
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
        <Tabs defaultActiveKey="computers" transition={false}>
          <Tab eventKey="computers" title="Computers">
            <CatalogListSection filter={ {type_name:"Computer family", noparent:"true",
                  notype:"true", is_group:"true"} } title="Computer families"
                  auth={this.props.auth} addButton/>
            <CatalogListSection filter={ {type_name:"Computer",
                  notype:"true"} } title="Computers"
                  auth={this.props.auth} addButton/>
          </Tab>
          <Tab eventKey="consoles" title="Consoles">
            <CatalogListSection filter={ {type_name:"Console family", noparent:"true",
                  notype:"true", is_group:"true"} } title="Console families"
                  auth={this.props.auth} addButton/>
            <CatalogListSection filter={ {type_name:"Console",
                  notype:"true"} } title="Consoles"
                  auth={this.props.auth} addButton/>
          </Tab>
          <Tab eventKey="calculators" title="Calculators">
            <CatalogListSection filter={ {type_name:"Calculator family", noparent:"true",
                  notype:"true", is_group:"true"} } title="Calculator families"
                  auth={this.props.auth} addButton/>
            <CatalogListSection filter={ {type_name:"Calculator",
                  notype:"true"} } title="Calculators"
                  auth={this.props.auth} addButton/>
          </Tab>
        </Tabs>
      </>
    );
  }
}

export default Catalog
