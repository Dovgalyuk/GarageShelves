import React, { Component, Suspense } from 'react';
import useFetch from 'fetch-suspense';

function url_for(url, params) {
    var ret = "http://127.0.0.1:5000/" + url;
    var first = true;
    for (var p in params) {
        ret += (first ? "?" : "&") + p + "=" + params[p];
        first = false;
    }
    return ret;
}

class Logo extends Component {
    render() {
        if (this.props.img_id) {
            return <img src={ url_for('uploads/view', { id:this.props.img_id } ) }/>;
        } else {
            return <span className="text-muted"><i className="fas fa-laptop fa-4x"></i></span>;
        }
    }
}

class CatalogItem extends Component {
    constructor(props) {
        super(props);
        // TODO: selected state
    }

    render() {
        // TODO: main item
        return <div className="col-4">
                 <div className="row pt-4">
                   <div className="col-3 align-self-center">
                     <Logo id={this.props.item.id} img_id={this.props.item.logo_id} />
                   </div>
                   <div className="col-9">
                     <a className="action" href={url_for('catalog.view',
                                             {id:this.props.item.id})}>
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
                            href={url_for('company.view', {id:this.props.item.company_id})}>
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

class CatalogList extends Component {
    render() {
        const data = useFetch(url_for('catalog/_filtered_list', this.props.filter));
        var rows = [];
        while (data.length) {
            rows.push(data.splice(0, 3));
        }
        return <>
                 {rows.length > 0 &&
                   <div className="row"><div className="col-12">
                     <h3 className="pt-4">
                       {this.props.title}
                     </h3>
                   </div></div>
                 }
                 {rows.map((row) =>
                    <CatalogListRow row={row} notype={this.props.filter.notype}/>)}
               </>;
    }
}

class CatalogListSection extends Component {
    render() {
        return <>
                 <Suspense fallback={
                   <div className="row"><div className="col-12">
                     <h3 className="pt-4">
                       {this.props.title} <span className="text-info"> are loading</span>
                     </h3>
                   </div></div>
                 }>
                   <CatalogList filter={this.props.filter} title={this.props.title}/>
                 </Suspense>
               </>;
    }
}

export default CatalogListSection;
