import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import ReactMarkdown from 'react-markdown';
import fetchBackend, { postBackend } from '../Backend'
import FormCatalogSelect from '../Forms/CatalogSelect'
import { Logo } from "../Catalog/Logo";

class CatalogProps extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            id:0,
            catalog:{},
            showForm:false,
        };
    }

    update() {
        if (this.state.id > 0) {
            this.setState({loading:true}, () =>
                fetchBackend('catalog/_get', {id:this.state.id})
                    .then(response => response.json())
                    .then(data => {
                        this.setState(
                            {loading:false, catalog:data},
                            this.props.onUpdate);
                    })
                    .catch(e => this.setState({loading:false}))
            );
        } else {
            this.setState({loading:false});
        }
    }

    componentDidMount() {
        this.update();
    }

    handleFormOpen = () => {
        this.setState({ showForm: true });
    }

    handleFormClose = () => {
        this.setState({ showForm: false });
    }

    handleFormSelect = (id) => {
        this.setState({ id:id, showForm: false }, this.update);
    }

    clear() {
        this.setState({loading:false, showForm:false, id:0, catalog:{}});
    }

    catalog() {
        return this.state.catalog;
    }

    render() {
        if (this.state.loading) {
            return (
                <div>Loading...</div>
            );
        }

        const cat = this.state.catalog;

        return (
            <>
                <Row>
                    <Logo id={cat.id} />
                    <h5>ID: </h5>{cat.id}
                </Row>
                <Row>
                    <h5>English title: </h5>{cat.title_eng}
                </Row>
                <Row>
                    <h5>Native title: </h5>{cat.title}
                </Row>
                <Row>
                    <h5>Descrption</h5>
                </Row>
                <Row>
                    <ReactMarkdown escapeHtml={false} source={ cat.description } />
                </Row>
                <Button onClick={this.handleFormOpen}>Select catalog item</Button>
                <FormCatalogSelect
                    title="Select catalog item to join"
                    open={this.state.showForm}
                    filter={{}}
                    onClose={this.handleFormClose}
                    onSelect={this.handleFormSelect} />
            </>
        );
    }
}

export default class CatalogJoin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: "",
            title: "",
            title_eng: "",
            year: "",
            description: ""
        }
    }

    select(a, b) {
        if (!a || a === "")
        {
            return b ? b : "";
        }
        return a;
    }
    join(a, b) {
        return (a ? a : "") + (b ? b : "");
    }

    update = () => {
        this.setState({
            title: this.select(this.cat1ref.catalog().title,
                               this.cat2ref.catalog().title),
            title_eng: this.select(this.cat1ref.catalog().title_eng,
                                   this.cat2ref.catalog().title_eng),
            year: this.select(this.cat1ref.catalog().year,
                              this.cat2ref.catalog().year),
            description: this.join(this.cat1ref.catalog().description,
                              this.cat2ref.catalog().description)});
    }

    onInputChange = (event) => {
        this.setState({[event.target.id]: event.target.value});
    }

    doJoin = () => {
        var id1 = this.cat1ref.catalog().id;
        var id2 = this.cat2ref.catalog().id;
        if (id1 && id2) {
            postBackend('catalog/_join', {},
                {id1:id1, id2:id2, title:this.state.title,
                    title_eng:this.state.title_eng,
                    year:this.state.year,
                    description:this.state.description})
                .then(response => response.json())
                .then(data => {
                    if (data.result === "success") {
                        this.setState({error:""});
                        this.cat1ref.clear();
                        this.cat2ref.clear();
                    } else {
                        this.setState({error:data.error});
                        alert("Error: " + data.error);
                    }
                })
                .catch(e => {})
                .finally((e) => {});
        }
}

    render() {
        if (!this.props.auth.isAdmin)
            return <div/>;
        return (
            <>
                <Row><h1>Join two catalog items</h1></Row>
                <Row>
                    {this.state.error && this.state.error !== "" &&
                        <Alert variant="danger">Error: {this.state.error}</Alert>}
                </Row>
                <Row>
                    <Col>
                        <h3>Catalog item 1</h3>
                        <CatalogProps
                            ref={(ref) => {this.cat1ref = ref;}}
                            onUpdate={this.update}
                        />
                    </Col>
                    <Col>
                        <h3>Catalog item 2</h3>
                        <CatalogProps
                            ref={(ref) => {this.cat2ref = ref;}}
                            onUpdate={this.update}
                        />
                    </Col>
                </Row>
                <br/>
                <h3>Joined item</h3>
                <h5>English title</h5>
                <input id="title_eng"
                    value={this.state.title_eng}
                    onChange={this.onInputChange}
                />
                <h5>Native title</h5><br/>
                <input id="title"
                    value={this.state.title}
                    onChange={this.onInputChange}
                />
                <h5>Year</h5><br/>
                <input id="year"
                    value={this.state.year}
                    onChange={this.onInputChange}
                />
                <h5>Description</h5><br/>
                <textarea id="description" rows={20} cols={80}
                    value={this.state.description}
                    onChange={this.onInputChange}
                />
                <br/>
                <Button onClick={this.doJoin}>Join</Button>
            </>
        );
    }
}
