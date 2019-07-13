import React, { Component, Fragment } from 'react'
import fetchBackend, { BackendURL } from './Backend'
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
             { props.is_main === 1 ? <br /> : <div/> }
             <strong><a className={"action" + (props.is_main === 1 ? " fa-2x" : "")}
                        href={"/item/view/" + props.item.id}>
               {props.item.type_title + " : "
                   + (props.item.title_eng ? props.item.title_eng : props.item.title) }
             </a></strong>
             { props.item.username
               ? <>
                   <br/>{"Owned by "}
                   <a href={"/collection/view/" + props.item.collection_id}>
                     {props.item.username}
                   </a>
                 </>
               : <div/>}
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

    handleUpdate = () => {
        this.setState({loadingMain:true, loadingList:true},
          () => {
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
        );
    }

    componentDidMount() {
        this.handleUpdate();
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
                 {(this.state.rows.length > 0 || this.state.main.length > 0)
                   ? <Row><Col>
                       <h3 className="pt-4">
                         {this.props.title}
                       </h3>
                     </Col></Row>
                   : <div/>
                 }
                 {this.state.main.length > 0
                   ? <Row className="pt-4">
                       <Item item={this.state.main[0]} is_main={1} />
                     </Row>
                   : <div/>
                 }
                 {this.state.rows.map((row) =>
                    <ItemListRow key={row[0].id/*TODO*/} row={row} />)
                 }
               </Fragment>;
    }
}

export function ItemLatest(props) {
    return (
        <ItemListSection
          title="Latest collected items"
          filter={{latest:10}}
        />
    );
}
