import React, { Component, Suspense } from 'react';
import useFetch from 'fetch-suspense';
import BackendURL from './Backend'

class Image extends Component {
    render() {
        return <div className="col-3">
                <button type="button" className="btn btn-link" data-toggle="modal"
                        data-target="#photoModal" data-whatever={this.props.id}>
                  <div className="thumbnail">
                    <img alt="" width="230" height="230"
                         className="figure-img img-fluid rounded"
                         src={BackendURL('uploads/view', {id:this.props.id})} />
                  </div>
                </button>
               </div>;
    }
}

function ImageListRow(props) {
    return <div className="row pt-2">
             { props.row.map((img) => <Image key={img.id} id={img.id} />)}
           </div>;
}

class ImageList extends Component {
    render() {
        const data = useFetch(BackendURL(this.props.entity + '/_images', {id:this.props.id}));
        var rows = [];
        while (data.length) {
            rows.push(data.splice(0, 4));
        }

        return <>
                 {rows.map((row) =>
                    <ImageListRow key={row[0].id} row={row} />)}
               </>;
    }
}


class ImageListSection extends Component {
    render() {
        return <>
                 <Suspense fallback={
                     <div className="row"><div className="col-12">
                       <h3 className="pt-4">
                         {this.props.title} <span className="text-info"> loading</span>
                       </h3>
                     </div></div>
                   }>
                   {this.props.title &&
                     <div className="row"><div className="col-12">
                       <h3 className="pt-4">{this.props.title}</h3>
                     </div></div>
                   }
                   <ImageList {...this.props} />
                 </Suspense>
               </>;
    }
}

export default ImageListSection
