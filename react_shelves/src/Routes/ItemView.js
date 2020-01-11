import React, { Component } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import fetchBackend, { postBackend } from '../Backend'
import EditText from '../Editors/Text'
import ImageListSection from '../Image'
import { ItemListSection } from "../Item/ListSection"
import { CatalogListSection } from "../Catalog/ListSection";
import { ItemComments } from '../Comment'
import FormCatalogSelect from '../Forms/CatalogSelect'
// import FormKitOwnModify from '../Forms/KitOwnModify'
import FormItemSelect from '../Forms/ItemSelect'

export default class ItemView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            item:{},
            showFormAddSoftware:false,
            // showFormModifyKit:false,
            showFormItemSelect:false,
        };
    }

    componentDidMount() {
        this.handleUpdate();
    }

    handleUpdate = () => {
        fetchBackend('item/_get', {id:this.props.match.params.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, item:data});
            })
        .catch(e => this.setState({loading:false}));
    }

    handleEditField = (field, value) => {
        postBackend('item/_update', {id:this.props.match.params.id},
            {field:field, value:value});
    }

    canEdit = () => {
        return this.props.auth.isAuthenticated
              && this.props.auth.user_id === this.state.item.owner_id;
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

    handleUpdateItems = () => {
      if (this.itemsRef) {
          this.itemsRef.handleUpdate();
      }
    }

    handleSoftwareSelect = (software) => {
      postBackend('item/_software_add', {},
          {id:this.state.item.id, software:software})
          .catch(e => {})
          .finally((e) => {
              this.handleUpdateSoftware();
          });
    }

    // handleModifyKitButton = event => {
    //   this.setState({showFormModifyKit:true});
    // }

    // handleFormModifyKitClose = event => {
    //   if (this.itemsRef) {
    //     this.itemsRef.handleUpdate();
    //   }
    //   this.setState({showFormModifyKit:false});
    // }

    handleAddItemButton = () => {
        this.setState({showFormItemSelect:true});
    }

    handleFormItemSelectClose = () => {
        this.setState({showFormItemSelect:false});
    }
    
    handleFormItemSelectSelect = (item) => {
        postBackend('item/_subitem_add', {},
            {id:this.state.item.id, subitem:item})
            .catch(e => {})
            .finally((e) => {
                this.handleUpdateItems();
            });
    }

    render() {
        if (this.state.loading) {
            return (
                <div>Loading...</div>
            );
        }
        const item = this.state.item;
        if (!item.id) {
            return (
            <div className="row">
              <div className="page-header">
                <h1>Item not found</h1>
              </div>
            </div>
            );
        }
        return (
          <Container>
            <div className="page-header">
              <Row>
                <Col xs={12}>
                  <h3 className="pt-4 pb-2">
                    Item of <a href={"/catalog/view/" + item.catalog_id}>{ item.root_title }&nbsp;:&nbsp;
                               { item.title_eng ? item.title_eng : item.title }</a>
                  </h3>
                </Col>
              </Row>
              <Row>
                <Col xs={4}>
                  <EditText value={ item.internal_id } hint="Internal id of the item"
                            canEdit={this.canEdit}
                            onSave={v => this.handleEditField("internal_id", v)}
                            prefix="Internal id "/>
                </Col>
                <Col>In collection since {item.added}</Col>
                <Col xs={2} className="align-self-top">
                    { this.props.auth.isAuthenticated
                      && item.root_title === "Data storage"
                      && item.owner_id === this.props.auth.user_id
                      ? <Button variant="primary"
                                onClick={this.handleAddSoftwareButton}>
                          Add software
                        </Button>
                      : <span/>
                    }
                    {/* { this.props.auth.isAuthenticated
                      && item.type_title === "Kit"
                      && item.owner_id === this.props.auth.user_id
                      ? <Button variant="primary"
                                onClick={this.handleModifyKitButton}>
                          Add kit items
                        </Button>
                      : <span/>
                    } */}
                   { this.props.auth.isAuthenticated
                      && item.root_title === "Kit"
                      && item.owner_id === this.props.auth.user_id
                      ? <Button variant="primary"
                                onClick={this.handleAddItemButton}>
                          Add existing item
                        </Button>
                      : <span/>
                    }
                </Col>
              </Row>
            </div>

            <Row>
              <Col>
                <h3 className="pt-4">Description</h3>
                <EditText value={item.description}
                    canEdit={this.canEdit}
                    type="markdown" hint="Item description"
                    onSave={v => this.handleEditField("description", v)}
                    inputProps={{rows:10, cols:80}}/>
              </Col>
            </Row>

            <ImageListSection id={ item.id } entity="item"
                owner={item.owner_id}
                title="Real item photos" auth={this.props.auth} />

            <ItemListSection
                filter={ {includes:item.id} }
                title="Included by the item" />

            <ItemListSection
                ref={(ref) => {this.itemsRef = ref;}}
                filter={ {parent:item.id} }
                title="Includes the items" />

            <CatalogListSection
                ref={(ref) => {this.softwareRef = ref;}}
                filter={ {storage_item:item.id, type: "bits"} }
                title="Includes the software" />

            <ItemComments id={item.id}
                          auth={this.props.auth} />

            { this.props.auth.isAuthenticated
                && item.root_title === "Data storage"
                && item.owner_id === this.props.auth.user_id
              ? <FormCatalogSelect open={this.state.showFormAddSoftware}
                        title="Add software"
                        onClose={this.handleFormAddSoftwareClose}
                        onSelect={this.handleSoftwareSelect}
                        filter={{parent_name: "Software", parent_rel: "root",
                                 notype: true}} />
              : <div/>
            }
            {/* { this.props.auth.isAuthenticated
                && item.type_title === "Kit"
                && item.owner_id === this.props.auth.user_id
              ? <FormKitOwnModify open={this.state.showFormModifyKit}
                        title="Add more owned items"
                        onClose={this.handleFormModifyKitClose} />
              : <div/>
            } */}
            { this.props.auth.isAuthenticated
                && item.root_title === "Kit"
                && item.owner_id === this.props.auth.user_id
              ? <FormItemSelect open={this.state.showFormItemSelect}
                        title="Add other owned item"
                        filter={{user:this.props.auth.user_id, noparent:true}}
                        onClose={this.handleFormItemSelectClose}
                        onSelect={this.handleFormItemSelectSelect} />
              : <div/>
            }
          </Container>
        );
    }
}
