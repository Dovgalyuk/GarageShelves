function ItemLogo(props) {
    return <span class="thumbnail itemLogo">
             {props.img_id ?
                <img src={ flask_util.url_for('uploads.view', { id:props.img_id } ) }
                    width="60" height="60" class="figure-img img-fluid rounded"/>
                : <i class="text-muted fas fa-laptop fa-1x">{props.img_id}</i>
             }
           </span>;
}

function Item(props) {
    // TODO: main item
    return <div class="col-4 align-self-center">
             <ItemLogo id={props.item.id} img_id={props.item.img_id} />
             <strong><a class="action" href={flask_util.url_for('item.view',
                                     {id:props.item.id})}>
               {props.item.type_title && !props.notype
                        ? props.item.type_title + " : " : ""}
                   {props.item.title_eng ? props.item.title_eng : props.item.title}
             </a></strong>
           </div>;
}

function ItemListRow(props) {
    return <div class="row pt-2">
             { props.row.map((item) => <Item item={item} notype={props.notype} />)}
           </div>;
}

class ItemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rows:null};
    }

    componentDidMount() {
        // TODO: expand the filter manually
        fetch(flask_util.url_for('item._filtered_list', { ...this.props }))
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
                    <ItemListRow row={row} notype={this.props.notype} />)}
               </div>;
    }
}

class ItemListSection extends React.Component {
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
                 <ItemList {...this.props} onLoadItems={this.onLoadItems}/>
               </div>;
    }
}
