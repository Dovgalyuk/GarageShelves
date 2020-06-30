import React, { Component, Fragment } from 'react'
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
      {props.categories.map((f) => <div key={f.id}>
        <OverlayTrigger trigger="click" placement="right"
            overlay={
            <Popover>
               <Popover.Title as="h3">{props.header}</Popover.Title>
               <Popover.Content>
                <Button variant="link" href={"/catalog/view/" + f.id}>
                    {f.root_title || "Category"} : {f.title_eng || f.title} 
                </Button>
                {props.auth.isAdmin && f.own
                    ? <Button size="sm" variant="danger"
                          onClick={() => props.handleDelete(f.id, props.relation)}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                    : <div />}
              </Popover.Content>
            </Popover>
            }>
            <Button size="sm" variant={f.own ? "primary" : "secondary"}>
            {f.title_eng || f.title}
            </Button>
        </OverlayTrigger>
        &nbsp;
      </div>)}
    </>);
}

export class CatalogFamilies extends Component {
    constructor(props) {
        super(props);
        this.state = {
            families: [],
            platforms: [],
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
        fetchBackend('catalog/_included_rec',
            { id: this.props.id, rel: "compatible" }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({ platforms: data });
            })
            .catch(e => {});
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
            path: "family",
            filter: {
                parent: this.props.root, parent_rel: "root",
                type: "abstract", notype:true} });
    }
    handleAddPlatform = () => {
        this.setState({ showForm: true, path: "compatible", formTitle: "Add target platform",
            filter: {parent_name: "Computer,Console,Calculator", parent_rel: "root", notype: true} });
    }
    handleFormClose = () => {
        this.setState({ showForm: false });
    }
    handleFormSelect = (family) => {
        var path = 'catalog/_' + this.state.path + '_add';
        postBackend(path, {}, { id2: this.props.id, id1: family })
            .catch(e => { })
            .finally((e) => {
                this.handleUpdate();
            });
    }
    render() {
        return (<Fragment>
            <ButtonToolbar>
                <Button size="sm" variant="light"
                    onClick={this.handleAddFamily}
                    disabled={!this.props.auth.isAdmin}>
                    Families
                </Button>
                &nbsp;
                <CategoryButtons categories={this.state.families}
                         handleDelete={this.handleDelete}
                         auth={this.props.auth}
                         header="Belongs to"
                         relation="includes"/>
                <Button size="sm" variant="light"
                    onClick={this.handleAddPlatform}
                    disabled={!this.props.auth.isAdmin}>
                    Platforms
                </Button>
                &nbsp;
                <CategoryButtons categories={this.state.platforms}
                         handleDelete={this.handleDelete}
                         auth={this.props.auth}
                         header="Compatible with"
                         relation="compatible"/>
            </ButtonToolbar>
            {(this.props.auth.isAuthenticated && this.props.auth.isAdmin)
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
