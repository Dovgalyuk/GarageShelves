import React, { Component, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { Popover, PopoverTitle, PopoverContent } from 'react-bootstrap';
import fetchBackend, { postBackend } from '../Backend';
import FormFamilySelect from '../Forms/FamilySelect';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

function Buttons(props) {
    return (<>
      {props.categories.map((f) => <div key={f.id}>
        <OverlayTrigger trigger="click" placement="right"
            overlay={
            <Popover>
              <PopoverTitle as="h3">{props.header}</PopoverTitle>
              <PopoverContent>
                <Button variant="link" href={"/catalog/view/" + f.id}>
                    {f.type_title} : {f.title_eng || f.title} 
                </Button>
                {props.auth.isAdmin
                    ? <Button size="sm" variant="danger"
                          onClick={() => props.handleDelete(f.id, props.relation)}>
                        <i className="fas fa-trash-alt" />
                    </Button>
                    : <div />}
              </PopoverContent>
            </Popover>
            }>
            <Button size="sm" variant={props.variant}>
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
            path: "",
        };
    }
    componentDidMount() {
        this.handleUpdate();
    }
    handleUpdate = () => {
        fetchBackend('catalog/_filtered_list',
            { includes: this.props.id, is_group: true, category: "includes" }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({ families: data });
            })
            .catch(e => {});
        fetchBackend('catalog/_filtered_list',
            { includes: this.props.id, category: "compatible" }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({ platforms: data });
            })
            .catch(e => {});
    };
    handleDelete = (family, relation) => {
        postBackend('catalog/_relation_remove', {},
            { id2: this.props.id, id1: family, rel: relation }
        )
            .catch(e => { })
            .finally((e) => {
                this.handleUpdate();
            });
    };
    handleAddFamily = () => {
        this.setState({ showForm: true, path: "family" });
    };
    handleAddPlatform = () => {
        this.setState({ showForm: true, path: "compatible" });
    };
    handleFormClose = () => {
        this.setState({ showForm: false });
    };
    handleFormSelect = (family) => {
        var path = 'catalog/_' + this.state.path + '_add';
        postBackend(path, {}, { id2: this.props.id, id1: family })
            .catch(e => { })
            .finally((e) => {
                this.handleUpdate();
            });
    };
    render() {
        return (<Fragment>
            <ButtonToolbar>
                <Buttons categories={this.state.families}
                         handleDelete={this.handleDelete}
                         auth={this.props.auth}
                         header="Belongs to"
                         relation="includes"
                         variant="primary" />
                <Buttons categories={this.state.platforms}
                         handleDelete={this.handleDelete}
                         auth={this.props.auth}
                         header="Compatible with"
                         relation="compatible"
                         variant="info" />
                {this.props.auth.isAdmin
                    ? <>
                        <Button size="sm" variant="outline-primary" onClick={this.handleAddFamily}>
                          Add family
                        </Button>
                        &nbsp;
                      </>
                    : <div />}
                {this.props.auth.isAdmin
                    ? <Button size="sm" variant="outline-info" onClick={this.handleAddPlatform}>
                        Add platform
                      </Button>
                    : <div />}
            </ButtonToolbar>
            {(this.props.auth.isAuthenticated && this.props.auth.isAdmin)
                ? <FormFamilySelect open={this.state.showForm} onClose={this.handleFormClose} onSelect={this.handleFormSelect} />
                : <div />}
        </Fragment>);
    }
}
