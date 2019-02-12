class Image extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div class="col-3">
                <button type="button" class="btn btn-link" data-toggle="modal"
                        data-target="#photoModal" data-whatever={this.props.id}>
                  <div class="thumbnail">
                    <img width="230" height="230" class="figure-img img-fluid rounded"
                         src={flask_util.url_for('uploads.view', {id:this.props.id})} />
                  </div>
                </button>
               </div>;
    }
}

function ImageListRow(props) {
    return <div class="row pt-2">
             { props.row.map((img) => <Image id={img.id} />)}
           </div>;
}

class ImageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rows:null};
    }

    componentDidMount() {
        fetch(flask_util.url_for(this.props.entity + '._images', {id:this.props.id} ))
           .then(response => response.json())
           .then(data => {
                // split data into rows
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 4));
                }
                this.setState({rows:rows});
            });
    }

    render() {
        if (!this.state.rows)
            return <div></div>;
        return <React.Fragment>
                 {this.state.rows.map((row) =>
                    <ImageListRow row={row} />)}
               </React.Fragment>;
    }
}


class ImageListSection extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <React.Fragment>
                 {this.props.title &&
                   <div class="row"><div class="col-12">
                     <h3 class="pt-4">{this.props.title}</h3>
                   </div></div>
                 }
                 <ImageList {...this.props} />
               </React.Fragment>;
    }
}
