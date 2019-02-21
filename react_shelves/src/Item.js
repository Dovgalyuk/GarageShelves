import React, { Component, Fragment } from 'react'
import ReactMarkdown from 'react-markdown'
import fetchBackend, { BackendURL } from './Backend'
import ImageListSection from './Image'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function ItemLogo(props) {
    var size = props.is_main === 1 ? 240 : 60;
    var mul = props.is_main === 1 ? 10 : 1;
    return <span className="thumbnail itemLogo">
             {props.img_id ?
                <img src={ BackendURL('uploads/view', { id:props.img_id } ) }
                    width={size} height={size} alt=""
                    className="figure-img img-fluid rounded"/>
                : <i className={"text-muted fas fa-laptop fa-" + mul + "x"}>{props.img_id}</i>
             }
           </span>;
}

function Item(props) {
    var size = props.is_main === 1 ? 12 : 4;
    return <div className={"col-" + size + " align-self-center"}>
             <ItemLogo id={props.item.id} img_id={props.item.img_id}
                       is_main={props.is_main} />
             { props.is_main === 1 && <br /> }
             <strong><a className={"action" + (props.is_main === 1 ? " fa-2x" : "")}
                        href={"/item/view/" + props.item.id}>
               {props.item.type_title + " : "
                   + (props.item.title_eng ? props.item.title_eng : props.item.title) }
             </a></strong>
           </div>;
}

function ItemListRow(props) {
    return <div className="row pt-4">
             { props.row.map((item) => <Item key={item.id} item={item}
                                             is_main={0} />)}
           </div>;
}

export class ItemListSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingList: true,
            loadingMain: true,
            main: [],
            rows: []
        };
    }

    componentDidMount() {
        fetchBackend('item/_filtered_list', {...this.props.filter, is_main:0})
            .then(response => response.json())
            .then(data => {
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 3));
                }
                this.setState({loadingList:false, rows:rows});
            })
            .catch(e => this.setState({loadingList:false}));
        if (this.props.filter.parent) {
            fetchBackend('item/_filtered_list', {...this.props.filter, is_main:1})
                .then(response => response.json())
                .then(data => {
                    this.setState({loadingMain:false, main:data});
                })
                .catch(e => this.setState({loadingMain:false}));
        } else {
            this.setState({loadingMain:false});
        }
    }

    render() {
        if (this.state.loadingList || this.state.LoadingMain) {
            return (
                <div className="row"><div className="col-12">
                  <h3 className="pt-4">
                    {this.props.title} <span className="text-info"> are loading</span>
                  </h3>
                </div></div>
            );
        }
        return <Fragment>
                 {(this.state.rows.length > 0 || this.state.main.length > 0) &&
                   <Row><Col>
                     <h3 className="pt-4">
                       {this.props.title}
                     </h3>
                   </Col></Row>
                 }
                 {this.state.main.length > 0 &&
                    <Row className="pt-4">
                      <Item item={this.state.main[0]} is_main={1} />
                    </Row>
                 }
                 {this.state.rows.map((row) =>
                    <ItemListRow key={row[0].id/*TODO*/} row={row} />)
                 }
               </Fragment>;
    }
}

/////////////////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////////////////

export class ItemView extends Component {
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
                    Item of <a href={"/catalog/view/" + item.catalog_id}>{ item.type_title } &nbsp;:&nbsp;
                               { item.title_eng ? item.title_eng : item.title }</a>
                  </h3>
                </Col>
              </Row>
              <Row>
                <Col xs={2}>Internal id {item.internal_id}</Col>
                <Col>In collection since {item.added}</Col>
              </Row>
            </div>

            <Row>
              <Col>
                <h3 className="pt-4">Description</h3>
                <ReactMarkdown source={ item.description } />
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

          </Container>
        );
    }
}

export default ItemView
