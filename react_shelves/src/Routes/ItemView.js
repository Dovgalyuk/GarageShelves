import React, { Component } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import fetchBackend, { postBackend } from '../Backend'
import EditText from '../Editors/Text'
import ImageListSection from '../Image'
import { ItemListSection } from '../Item'
import { ItemComments } from '../Comment'

export default class ItemView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            item:{}
        };
    }

    componentDidMount() {
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
                    Item of <a href={"/catalog/view/" + item.catalog_id}>{ item.type_title }&nbsp;:&nbsp;
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
                filter={ {parent:item.id} }
                title="Includes the items" />

            <ItemComments id={item.id}
                          auth={this.props.auth} />
          </Container>
        );
    }
}
