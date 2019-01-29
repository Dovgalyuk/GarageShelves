/* Catalog item logo */
class Logo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {id:props.id, img_id: -1};
    }

    componentDidMount() {
        fetch(flask_util.url_for('catalog._get_logo', { id:this.state.id }))
           .then(response => response.json())
           .then(data => { if (data) this.setState({img_id:data.id}); });
    }

    render() {
        if (this.state.img_id == -1) {
            return <span class="text-muted"><i class="fas fa-laptop fa-4x"></i></span>;
        } else {
            return <img src={ flask_util.url_for('uploads.view', { id:this.state.img_id } ) }/>;
        }
    }
}

class CatalogItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {item:props.item};
    }

    render() {
        return <div class="col-4">
                 <div class="row pt-4">
                   <div class="col-3 align-self-center">
                     <Logo id={this.state.item.id} />
                   </div>
                   <div class="col-9">
                     <a class="action" href={flask_util.url_for('catalog.view',
                                             {id:this.state.item.id})}>
                       <h5>{this.state.item.type_title ? this.state.item.type_title + " : " : ""}
                           {this.state.item.title_eng ? this.state.item.title_eng : this.state.item.title}</h5>
                     </a>
                 <h6 class="text-secondary">{this.state.item.title_eng ? this.state.item.title : ""}</h6>
                 <p>
                    <span class="badge badge-secondary">{this.state.item.year}</span>
                    &nbsp;
                    {this.state.item.company
                        && <a class="text-secondary"
                            href={flask_util.url_for('company.view', {id:this.state.item.company_id})}>
                            {this.state.item.company}
                        </a>}
                    &nbsp;
                    {this.state.item.count > 0
                        && <span class="badge badge-secondary">{
                            this.state.item.count + ' item' + (this.state.item.count > 1 ? 's' : '')
                        }</span>}
                 </p>
                 </div></div>
               </div>;
    }
}

function CatalogListRow(props) {
    return <div class="row pt-4">
             { props.row.map((item) => <CatalogItem item={item} />)}
           </div>;
}

class CatalogList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parent:props.parent, rows:null};
    }

    componentDidMount() {
        fetch(flask_util.url_for('catalog._filtered_list', { parent:this.state.parent }))
           .then(response => response.json())
           .then(data => {
                // split data into triples
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 30));
                }
                this.setState({rows:rows});
            });
    }

    render() {
        if (!this.state.rows)
            return <div></div>;
        return <div>
                 {this.state.rows.map((row) => <CatalogListRow row={row}/>)}
               </div>;
    }
}
