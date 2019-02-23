import React, { Component, Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend, { postBackend, BackendURL } from './Backend'
import ImageListSection from './Image'
import { ItemListSection } from './Item'

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

export class FormOwn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            items:[]
        };
        this.form = new Map();
        this.form[this.props.id] = {use:true};
    }

    handleShow = event => {
        fetchBackend('catalog/_filtered_list', {parent:this.props.id})
            .then(response => response.json())
            .then(data => {
                this.setState({loading:false, items:data});
            })
            .catch(e => this.setState({loading:false, items:[]}));
    }

    handleConfirm = event => {
        postBackend('catalog/_own', {id:this.props.id}, this.form)
            .catch(e => {})
            .finally((e) => {
                this.handleHide(e);
                this.props.handleUpdateItems();
            });
    }

    handleHide = event => {
        this.setState({loading:true, items:[]});
        this.props.onClose();
    }

    handleCheckBox = (event, id) => {
        if (!this.form[id]) {
            this.form[id] = {};
        }
        this.form[id].use = event.target.checked;
    }

    handleInput = (event, id) => {
        if (!this.form[id]) {
            this.form[id] = {use:false};
        }
        this.form[id].internal = event.target.value;
    }

    render() {
        return (
              <Modal show={this.props.open}
                     size="lg"
                     onShow={this.handleShow}
                     onHide={this.handleHide}>
                <Modal.Header closeButton>
                  <h4>Confirm ownership of the catalog item</h4>
                </Modal.Header>
                <Modal.Body>
                  { this.state.loading && <div>Loading...</div> }
                  <Form>
                    <Form.Group as={Row}>
                      <Form.Label column xs={2}>Internal ID:</Form.Label>
                      <Col xs={10}>
                        <Form.Control type="text" id={this.props.id}
                          onChange={e => this.handleInput(e, this.props.id)}/>
                      </Col>
                    </Form.Group>
                    { this.state.items.length > 0 &&
                      <Form.Group>
                        <h4>Also add the next items from the kit</h4>
                      </Form.Group>
                    }
                    { this.state.items.map((c) =>
                      <Fragment key={c.id}>
                        { c.is_physical &&
                          <Form.Group as={Row}>
                            <Col xs={3}>
                              <Form.Control type="text"
                                id={"I" + c.id}
                                onChange={e => this.handleInput(e, c.id)}/>
                            </Col>
                            <Col xs={9}>
                              <Form.Check custom type="checkbox"
                                id={"C" + c.id}
                                label={c.type_title + " : "
                                  + (c.title_eng ? c.title_eng : c.title)}
                                onChange={e => this.handleCheckBox(e, c.id)} />
                            </Col>
                          </Form.Group>
                        }
                      </Fragment>)
                    }
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.handleHide}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={this.handleConfirm}
                    disabled={this.state.loading}>
                    Confirm
                  </Button>
                </Modal.Footer>
              </Modal>
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

    handleOwnButton = event => {
        this.setState({showFormOwn:true});
    }

    handleFormOwnClose = event => {
        this.setState({showFormOwn:false});
    }

    handleUpdateItems = () => {
        this.itemsRef.handleUpdate();
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
                    <Col xs={1} className="align-self-center">
                      <Logo img_id={catalog.logo_id} />
                    </Col>
                    <Col xs={9} className="align-self-center">
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
                          <a href={ "/company/view/" + catalog.company_id }>{ catalog.company }</a>
                        }
                      </p>
                    </Col>
                    <Col xs={2} className="align-self-center">
                    { this.props.auth.isAuthenticated && catalog.is_physical &&
                        <button type="button" className="btn btn-primary"
                                onClick={this.handleOwnButton}>
                          I own this
                        </button>
                    }
                    </Col>
                  </Row>
                </div>

                <div className="row">
                  <div className="col-12">
                    <h3 className="pt-4">Description</h3>
                    <ReactMarkdown source={ catalog.description } />
                  </div>
                </div>

                <ImageListSection id={ catalog.id } entity="catalog"
                    title="Catalog item images" auth={this.props.auth} />

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
