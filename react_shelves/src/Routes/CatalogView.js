import React, { Component } from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import fetchBackend, { postBackend } from '../Backend'
import FormCatalogCreate from '../Forms/CatalogCreate'
import FormOwn from '../Forms/Own'
import FormKitCreate from '../Forms/KitCreate'
import FormModificationCreate from '../Forms/ModificationCreate'
import { Logo, CatalogListSection, CatalogFamilies, CatalogMain } from '../Catalog/Helpers'
import EditText from '../Editors/Text'
import EditDropDown from '../Editors/DropDown'
import ImageListSection from '../Image'
import { ItemListSection } from '../Item'
import { CatalogComments } from '../Comment'
import FormSoftwareAdd from '../Forms/SoftwareAdd'

export default class CatalogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{},
            showFormOwn:false,
            showFormCreateSubitem:false,
            showFormCreateKit:false,
            showFormCreateModification:false,
            showFormAddSoftware:false,
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

    canEdit = () => {
        return this.props.auth.isAuthenticated && !this.state.loading;
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

    handleCreateModificationButton = event => {
        this.setState({showFormCreateModification:true});
    }

    handleFormCreateModificationClose = event => {
      this.setState({showFormCreateModification:false});
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

    handleUpdateModificationItems = () => {
      if (this.modificationsRef) {
          this.modificationsRef.handleUpdate();
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

    handleAddSoftwareButton = event => {
      this.setState({showFormAddSoftware:true});
    }

    handleFormAddSoftwareClose = event => {
      this.setState({showFormAddSoftware:false});
    }

    handleUpdateSoftware = () => {
      if (this.softwareRef) {
          this.softwareRef.handleUpdate();
      }
    }

    handleSoftwareSelect = (software) => {
      postBackend('catalog/_software_add', {},
          {id:this.state.catalog.id, software:software})
          .catch(e => {})
          .finally((e) => {
              this.handleUpdateSoftware();
          });
    }

    render() {
        if (this.state.loading) {
            return (
                <div>Loading...</div>
            );
        }
        const catalog = this.state.catalog;
        const is_software = catalog.type_title === 'Software';
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
                             canEdit = {this.canEdit}
                             onSave={v => this.handleEditField("title_eng", v)}/>
                      </h1>
                      <h4 className="text-secondary">
                         <EditText value={ catalog.title } hint="Native title"
                                   canEdit = {this.canEdit}
                                   onSave={v => this.handleEditField("title", v)}/>
                      </h4>
                      <CatalogMain id={catalog.id} />
                      <div className="text-secondary">
                          Manufactured since&nbsp;
                          <span className="badge badge-secondary">
                            <EditText value={ catalog.year || "" }
                                      hint="Start of production year" type="number"
                                      canEdit = {this.canEdit}
                                      onSave={v => this.handleEditField("year", v)}/>
                          </span>
                          &nbsp;by&nbsp;
                          <EditDropDown value={catalog.company_id}
                                        name={catalog.company}
                                        hint={"Company name"}
                                        defaultValue={-1}
                                        defaultName="Unknown"
                                        canEdit = {this.canEdit}
                                        onLoadList={this.handleLoadCompanies}
                                        onSave={v => this.handleEditField("company_id", v)}
                                        onRender={this.handleCompanyRender}
                          />
                      </div>

                      <CatalogFamilies id={catalog.id} auth={this.props.auth}/>
                    </Col>
                    <Col xs={1} className="align-self-top">
                    { this.props.auth.isAuthenticated
                      && (catalog.is_group === 1 || catalog.is_kit === 1)
                      ? <Button variant="primary"
                                onClick={this.handleCreateSubitemButton}>
                          Create subitem
                        </Button>
                      : <span/>
                    }
                    &nbsp;
                    { (this.props.auth.isAuthenticated
                        && (catalog.is_physical
                            /* There can be kits referencing to software */
                            || is_software))
                      ? <Button variant="primary"
                                onClick={this.handleCreateKitButton}>
                          Create kit
                        </Button>
                      : <span/>
                    }
                    &nbsp;
                    { (this.props.auth.isAuthenticated
                        && !catalog.is_kit && !catalog.is_group)
                      ? <Button variant="primary"
                                onClick={this.handleCreateModificationButton}>
                          Create modification
                        </Button>
                      : <span/>
                    }
                    &nbsp;
                    { this.props.auth.isAuthenticated
                          && catalog.type_title === "Data storage"
                      ? <Button variant="primary"
                                onClick={this.handleAddSoftwareButton}>
                          Add software
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
                        canEdit = {this.canEdit}
                        onSave={v => this.handleEditField("description", v)}
                        inputProps={{rows:10, cols:80}}/>
                  </div>
                </div>

                <ImageListSection id={ catalog.id } entity="catalog"
                    title="Catalog item images" auth={this.props.auth} />

                { catalog.is_group === 1
                  ? <CatalogListSection
                      ref={(ref) => {this.familiesRef = ref;}}
                      filter={ {parent:catalog.id, notype:true, is_group:true} }
                      title="Includes the families" />
                  : <div/>
                }
                { catalog.is_physical === 1 || is_software
                  ? <CatalogListSection
                      ref={(ref) => {this.kitsRef = ref;}}
                      filter={ {type_name:"Kit", notype:true, includes:catalog.id} }
                      title="Kits with this item" />
                  : <div/>
                }
                <CatalogListSection
                    ref={(ref) => {this.childrenRef = ref;}}
                    filter={ {parent:catalog.id} }
                    title="Includes the following catalog items" />

                <CatalogListSection
                    ref={(ref) => {this.softwareRef = ref;}}
                    filter={ {storage:catalog.id} }
                    title="Includes the software" />

                <CatalogListSection
                    ref={(ref) => {this.modificationsRef = ref;}}
                    filter={ {modification:1, main:catalog.id} }
                    title="Catalog item modifications" />

                { this.props.auth.isAuthenticated
                    ? <ItemListSection
                        ref={(ref) => {this.itemsRef = ref;}}
                        filter={ {catalog:catalog.id, user:this.props.auth.user_id} }
                        title="Items in your collection" />
                    : <div/>
                }
                <CatalogComments id={this.state.catalog.id}
                                 auth={this.props.auth} />
              </Container>
              { this.props.auth.isAuthenticated
                ? <FormOwn open={this.state.showFormOwn}
                         onClose={this.handleFormOwnClose}
                         handleUpdateItems={this.handleUpdateItems}
                         id={catalog.id} />
                : <div/>
              }
              { this.props.auth.isAuthenticated
                && (catalog.is_group === 1 || catalog.is_kit === 1)
                ? <FormCatalogCreate open={this.state.showFormCreateSubitem}
                         onClose={this.handleFormCreateSubitemClose}
                         handleUpdateItems={this.handleUpdateCatalogItems}
                         parent={catalog.id} />
                : <div/>
              }
              { (this.props.auth.isAuthenticated)
                ? <FormKitCreate open={this.state.showFormCreateKit}
                         onClose={this.handleFormCreateKitClose}
                         handleUpdateItems={this.handleUpdateKitItems}
                         main_id={catalog.id}
                         main_title={catalog.title_eng || catalog.title} />
                : <div/>
              }
              { (this.props.auth.isAuthenticated)
                ? <FormModificationCreate open={this.state.showFormCreateModification}
                         onClose={this.handleFormCreateModificationClose}
                         handleUpdateItems={this.handleUpdateModificationItems}
                         main_id={catalog.id}
                         main_title={catalog.title_eng || catalog.title} />
                : <div/>
              }
              { this.props.auth.isAuthenticated
                    && catalog.type_title === "Data storage"
                ? <FormSoftwareAdd open={this.state.showFormAddSoftware}
                          onClose={this.handleFormAddSoftwareClose}
                          onSelect={this.handleSoftwareSelect} />
                : <div/>
              }
            </>
        );
    }
}

