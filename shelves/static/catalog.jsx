/* Catalog item logo */
class Logo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {img_id: -1};
    }

    componentDidMount() {
        fetch(flask_util.url_for('catalog._get_logo', { id:this.props.id }))
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
    }

    render() {
        return <div class="col-4">
                 <div class="row pt-4">
                   <div class="col-3 align-self-center">
                     <Logo id={this.props.item.id} />
                   </div>
                   <div class="col-9">
                     <a class="action" href={flask_util.url_for('catalog.view',
                                             {id:this.props.item.id})}>
                       <h5>{this.props.item.type_title && !this.props.notype
                                ? this.props.item.type_title + " : " : ""}
                           {this.props.item.title_eng ? this.props.item.title_eng : this.props.item.title}</h5>
                     </a>
                 <h6 class="text-secondary">{this.props.item.title_eng ? this.props.item.title : ""}</h6>
                 <p>
                    <span class="badge badge-secondary">{this.props.item.year}</span>
                    &nbsp;
                    {this.props.item.company
                        && <a class="text-secondary"
                            href={flask_util.url_for('company.view', {id:this.props.item.company_id})}>
                            {this.props.item.company}
                        </a>}
                    &nbsp;
                    {this.props.item.count > 0
                        && <span class="badge badge-secondary">{
                            this.props.item.count + ' item' + (this.props.item.count > 1 ? 's' : '')
                        }</span>}
                 </p>
                 </div></div>
               </div>;
    }
}

function CatalogListRow(props) {
    return <div class="row pt-4">
             { props.row.map((item) => <CatalogItem item={item} notype={props.notype}/>)}
           </div>;
}

class CatalogList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rows:null};
    }

    componentDidMount() {
        // TODO: expand the filter manually
        fetch(flask_util.url_for('catalog._filtered_list', { ...this.props }))
           .then(response => response.json())
           .then(data => {
                // split data into triples
                var rows = [];
                while (data.length) {
                    rows.push(data.splice(0, 3));
                }
                this.setState({rows:rows});
                if (rows.length > 0 && this.props.onLoadItems) {
                    this.props.onLoadItems();
                }
            });
    }

    render() {
        if (!this.state.rows)
            return <div></div>;
        return <div>
                 {this.state.rows.map((row) =>
                    <CatalogListRow row={row} notype={this.props.notype}/>)}
               </div>;
    }
}

class CatalogListSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {empty:true};
        this.onLoadItems = this.onLoadItems.bind(this);
    }

    onLoadItems() {
        this.setState({empty:false});
    }

    render() {
        return <div>
                 {!this.state.empty &&
                   <div class="row"><div class="col-12">
                     <h3 class="pt-4">{this.props.title}</h3>
                   </div></div>
                 }
                 <CatalogList {...this.props} onLoadItems={this.onLoadItems}/>
               </div>;
    }
}
