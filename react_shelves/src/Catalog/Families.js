import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Popover from 'react-bootstrap/Popover'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import fetchBackend, { postBackend } from '../Backend'
import FormCatalogSelect from '../Forms/CatalogSelect'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'

function CategoryButtons(props) {
    return (<>
      {props.categories.map((f) => <span key={f.id}>
        <OverlayTrigger trigger="click" placement="right"
            overlay={
            <Popover>
               <Popover.Title as="h3">{props.header}</Popover.Title>
               <Popover.Content>
                <Button variant="link" href={"/catalog/view/" + f.id}>
                    {f.root_title || "Category"} : {f.title_eng || f.title} 
                </Button>
                { props.canDelete && f.own && props.handleDelete
                    ? <Button size="sm" variant="danger"
                          onClick={() => props.handleDelete(f.id)}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                    : <div />
                }
              </Popover.Content>
            </Popover>
            }>
            { props.tiny
                ? <Badge variant="secondary">{f.title_eng || f.title}</Badge>
                : <Button size="sm" variant={f.own ? "primary" : "secondary"}>
                    {f.title_eng || f.title}
                  </Button>
            }
        </OverlayTrigger>
        &nbsp;
      </span>)}
    </>);
}

CategoryButtons.defaultProps = {
    tiny: false,
    canDelete: false,
    header: "",
};

CategoryButtons.propTypes = {
    categories: PropTypes.array.isRequired,
    tiny: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func,
    canDelete: PropTypes.bool,
    header: PropTypes.string,
};

export class PlatformButtons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            platforms: [],
        };
    }
    componentDidMount() {
        this.handleUpdate();
    }
    handleUpdate = () => {
        fetchBackend('catalog/_included_rec',
            { id: this.props.id, rel: "compatible" }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({ platforms: data });
            })
            .catch(e => {});
    }

    render() {
        return (<CategoryButtons categories={this.state.platforms}
            handleDelete={this.props.handleDelete}
            canDelete={this.props.canDelete}
            header={this.props.header}
            tiny={this.props.tiny}/>);
    }
};

PlatformButtons.defaultProps = {
    tiny: false,
    canDelete: false,
    header: "",
};

PlatformButtons.propTypes = {
    id: PropTypes.number.isRequired,
    tiny: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func,
    canDelete: PropTypes.bool,
    header: PropTypes.string,
};

export class CompanyButtons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companies: [],
        };
    }
    componentDidMount() {
        this.handleUpdate();
    }
    handleUpdate = () => {
        fetchBackend('catalog/_filtered_list',
            { includes: this.props.id, child_rel: "produced", type: "company" }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({ companies: data.map(obj => ({...obj, own: true}) ) });
            })
            .catch(e => {});
    }

    render() {
        return (<CategoryButtons categories={this.state.companies}
            handleDelete={this.props.handleDelete}
            canDelete={this.props.canDelete}
            header={this.props.header}
            tiny={this.props.tiny}/>);
    }
};

CompanyButtons.defaultProps = {
    tiny: false,
    canDelete: false,
    header: "",
};

CompanyButtons.propTypes = {
    id: PropTypes.number.isRequired,
    tiny: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func,
    canDelete: PropTypes.bool,
    header: PropTypes.string,
};

export class CatalogFamilies extends Component {
    constructor(props) {
        super(props);
        this.state = {
            families: [],
            showForm: false,
            filter: {},
            formTitle: "",
            path: "",
        };
    }
    componentDidMount() {
        this.handleUpdate();
    }
    handleUpdate = () => {
        fetchBackend('catalog/_included_rec',
            { id: this.props.id, type: "abstract", rel: "includes" }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({ families: data });
            })
            .catch(e => {});
        this.platformsRef.handleUpdate();
        this.companiesRef.handleUpdate();
    }
    handleDelete = (family, relation) => {
        postBackend('catalog/_relation_remove', {},
            { id2: this.props.id, id1: family, rel: relation }
        )
            .catch(e => { })
            .finally((e) => {
                this.handleUpdate();
            });
    }
    handleAddFamily = () => {
        this.setState({ showForm: true, formTitle: "Add new family",
            path: "includes",
            filter: {
                parent: this.props.root, parent_rel: "root",
                type: "abstract", notype:true} });
    }
    handleAddCompany = () => {
        this.setState({ showForm: true, formTitle: "Add new company",
            path: "produced",
            filter: {type: "company", notype:true} });
    }
    handleAddPlatform = () => {
        this.setState({ showForm: true, path: "compatible", formTitle: "Add target platform",
            filter: {parent_name: "Computer,Console,Calculator", parent_rel: "root", notype: true} });
    }
    handleFormClose = () => {
        this.setState({ showForm: false });
    }
    handleFormSelect = (family) => {
        postBackend('catalog/_relation_add', {},
            { id2: this.props.id, id1: family, rel:this.state.path })
            .catch(e => { })
            .finally((e) => {
                this.handleUpdate();
            });
    }
    render() {
        return (<Fragment>
            <ButtonToolbar>
                <Button size="sm" variant="light"
                    onClick={this.handleAddCompany}
                    disabled={!this.props.auth.isAuthenticated}>
                    Companies
                </Button>
                &nbsp;
                <CompanyButtons ref={(ref) => {this.companiesRef = ref;}}
                        id={this.props.id}
                        handleDelete={(id) => this.handleDelete(id, "produced")}
                        canDelete={this.props.auth.isAuthenticated}
                        header="Manufactured by"/>
                <Button size="sm" variant="light"
                    onClick={this.handleAddFamily}
                    disabled={!this.props.auth.isAuthenticated}>
                    Families
                </Button>
                &nbsp;
                <CategoryButtons categories={this.state.families}
                        handleDelete={(id) => this.handleDelete(id, "includes")}
                        canDelete={this.props.auth.isAuthenticated}
                        header="Belongs to"/>
                <Button size="sm" variant="light"
                    onClick={this.handleAddPlatform}
                    disabled={!this.props.auth.isAuthenticated}>
                    Platforms
                </Button>
                &nbsp;
                <PlatformButtons ref={(ref) => {this.platformsRef = ref;}}
                        id={this.props.id}
                        handleDelete={(id) => this.handleDelete(id, "compatible")}
                        canDelete={this.props.auth.isAuthenticated}
                        header="Compatible with"/>
            </ButtonToolbar>
            {(this.props.auth.isAuthenticated)
                ? <FormCatalogSelect
                    title={this.state.formTitle}
                    open={this.state.showForm}
                    onClose={this.handleFormClose}
                    onSelect={this.handleFormSelect}
                    filter={this.state.filter} />
                : <div />}
        </Fragment>);
    }
}
