import React, { Component } from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import fetchBackend, { postBackend } from '../Backend'
import FormOwn from '../Forms/Own'
import FormKitCreate from '../Forms/KitCreate'
import FormModificationCreate from '../Forms/ModificationCreate'
import { CatalogMain } from '../Catalog/Helpers'
import { Logo } from "../Catalog/Logo";
import { CatalogFamilies } from "../Catalog/Families";
import { CatalogListSection } from "../Catalog/ListSection";
import EditText from '../Editors/Text'
import EditDropDown from '../Editors/DropDown'
import ImageListSection from '../Image'
import AttachmentListSection from '../Attachment'
import { ItemListSection } from '../Item/ListSection'
import { CatalogComments } from '../Comment'

export default class CatalogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            catalog:{},
            showFormOwn:false,
            showFormCreateKit:false,
            showFormCreateModification:false,
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
        return this.props.auth.isAuthenticated && !this.state.loading
          && this.state.catalog.root_title;
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

    /* Create modification */

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
        fetchBackend('catalog/_filtered_list', {type: "company"})
            .then(response => response.json())
            .then(data => {
                callback(data.map(c => { return {value:c.id, name:c.title_eng}; }));
            })
            .catch(e => {});
    }

    handleCompanyRender = (value, name) => {
        if (value > 0)
            return <a href={"/catalog/view/" + value}>{ name }</a>;
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
            <>
              <Container>
                <div className="page-header">
                  <Row>
                    <Col xs={2} lg={1} className="align-self-top">
                      <Logo id={catalog.id}
                            main auth={this.props.auth}/>
                    </Col>
                    <Col xs={8} lg={9} className="align-self-top">
                      <h1>
                        <EditText prefix={
                            (catalog.root_title ? catalog.root_title : "Category") + " : "}
                             value={ catalog.title_eng ? catalog.title_eng : catalog.title }
                             hint="English title"
                             canEdit = {this.canEdit}
                             onSave={v => this.handleEditField("title_eng", v)}/>
                      </h1>
                      <h4 className="text-secondary">
                         <EditText value={ catalog.title ? catalog.title : "" } hint="Native title"
                                   canEdit = {this.canEdit}
                                   onSave={v => this.handleEditField("title", v)}/>
                      </h4>
                      {catalog.root_title && !catalog.is_company
                       ? <>
                        <CatalogMain id={catalog.id} />
                        <div className="text-secondary">
                            Manufactured since&nbsp;
                            <span className="badge badge-secondary">
                              <EditText value={ catalog.year || "" }
                                        hint="Start of production year" type="number"
                                        canEdit = {this.canEdit}
                                        onSave={v => this.handleEditField("year", v)}/>
                            </span>
                        </div>

                        <CatalogFamilies
                            id={catalog.id}
                            root={catalog.root}
                            auth={this.props.auth}
                            company_id={catalog.company_id}
                            company={catalog.company}/>
                      </> : <div/> }
                    </Col>
                    <Col xs={2} className="align-self-top">
                    <ButtonToolbar>
                    { this.props.auth.isAuthenticated
                        && (catalog.is_physical || catalog.is_kit)
                        && catalog.root_title
                      ? <Button variant="primary"
                                onClick={this.handleOwnButton}>
                          I own this
                        </Button>
                      : <span/>
                    }
                    </ButtonToolbar>
                    </Col>
                  </Row>
                </div>

                <div className="row">
                  <div className="col-12">
                    <h3 className="pt-4">Description</h3>
                    <EditText value={catalog.description ? catalog.description : ""}
                        type="markdown" hint="Catalog item description"
                        canEdit = {this.canEdit}
                        onSave={v => this.handleEditField("description", v)}
                        inputProps={{rows:10, cols:80}}/>
                  </div>
                </div>

                <ImageListSection id={ catalog.id } entity="catalog"
                    title="Catalog item images" auth={this.props.auth} />

                <AttachmentListSection id={ catalog.id } entity="catalog"
                    title="Attachments" auth={this.props.auth} />

                { catalog.is_group === 1
                  ? <CatalogListSection
                      ref={(ref) => {this.familiesRef = ref;}}
                      filter={ {parent:catalog.id, notype:true,
                                type: "abstract", noroot: true} }
                      addButton auth={this.props.auth}
                      title="Includes the families" />
                  : <div/>
                }
                { catalog.is_physical === 1 || catalog.is_kit === 1
                   // TODO: remove is_bits
                   || catalog.is_bits === 1
                  ? <CatalogListSection
                      ref={(ref) => {this.kitsRef = ref;}}
                      filter={ {notype:true, type: "kit",
                                includes:catalog.id} }
                      title="Kits with this item" 
                      buttons={
                        (this.props.auth.isAuthenticated
                              && (catalog.is_physical === 1
                                  /* There can be kits referencing to software */
                                  || catalog.is_bits === 1))
                            ? <Button variant="primary"
                                      onClick={this.handleCreateKitButton}>
                                Create kit
                              </Button>
                            : <span/>
                      }
                    />
                  : <div/>
                }
                { catalog.is_physical === 0 // physical compound items not supported yet
                  && catalog.is_company === 0
                  && catalog.is_bits === 0 // "includes the software" for bits
                  ? <CatalogListSection
                    ref={(ref) => {this.childrenRef = ref;}}
                    filter={ {parent:catalog.id, parent_rel:"includes",
                        not_type: "abstract", noroot: catalog.is_group === 1} }
                    addFilter={catalog.is_group === 1
                               ? {parent:catalog.root, parent_rel:"root", type:"physical,kit", notype:true}
                               : catalog.is_kit === 1 ? {type:"physical,kit"} : null }
                    addRelation="includes"
                    mainId={catalog.id}
                    title="Includes the catalog items"
                    auth={this.props.auth} addButton />
                  : <div />
                }

                <CatalogListSection
                      ref={(ref) => {this.producedRef = ref;}}
                      filter={ {parent:catalog.id, parent_rel:"produced",
                          not_type: "abstract"} }
                      title="Manufactured items" />

                <CatalogListSection
                    ref={(ref) => {this.softwareRef = ref;}}
                    filter={ {parent:catalog.id, parent_rel:"stores",
                              type:"bits", noroot: true} }
                    addFilter={catalog.is_physical === 1 || catalog.is_bits === 1
                              ? {notype: true, type: "bits"}
                              : null}
                    addRelation="stores"
                    mainId={catalog.id}
                    auth={this.props.auth}
                    title="Stores the software" />

                { catalog.is_kit
                  ? <CatalogListSection
                      filter={ {grandparent:catalog.id, parent_rel:"stores",
                                type:"bits", noroot: true} }                      
                      title="Software on the kit items" />
                  : <div/>
                }

                <CatalogListSection
                    ref={(ref) => {this.modificationsRef = ref;}}
                    filter={ {parent_rel:"modification", parent:catalog.id,
                              not_type:"abstract", noroot: true} }
                    buttons={
                      (this.props.auth.isAuthenticated
                        && (catalog.is_physical || catalog.is_bits))
                      ? <Button variant="primary"
                                onClick={this.handleCreateModificationButton}>
                          Create modification
                        </Button>
                      : null
                    }
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
            </>
        );
    }
}

