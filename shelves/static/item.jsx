function ItemLogo(props) {
    var size = props.is_main == 1 ? 240 : 60;
    var mul = props.is_main == 1 ? 10 : 1;
    return <span class="thumbnail itemLogo">
             {props.img_id ?
                <img src={ flask_util.url_for('uploads.view', { id:props.img_id } ) }
                    width={size} height={size} class="figure-img img-fluid rounded"/>
                : <i class={"text-muted fas fa-laptop fa-" + mul + "x"}>{props.img_id}</i>
             }
           </span>;
}

function Item(props) {
    var size = props.is_main == 1 ? 12 : 4;
    return <div class={"col-" + size + " align-self-center"}>
             <ItemLogo id={props.item.id} img_id={props.item.img_id}
                       is_main={props.is_main} />
             { props.is_main == 1 && <br /> }
             <strong><a class={"action" + (props.is_main == 1 ? " fa-2x" : "")}
                        href={flask_util.url_for('item.view', {id:props.item.id})}>
               {props.item.type_title && !props.notype
                        ? props.item.type_title + " : " : ""}
                   {props.item.title_eng ? props.item.title_eng : props.item.title}
             </a></strong>
           </div>;
}

function ItemListRow(props) {
    return <div class="row pt-2">
             { props.row.map((item) => <Item item={item} is_main={props.is_main}
                                             notype={props.notype} />)}
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
                // split data into rows
                var rows = [];
                var width = this.props.is_main == 1 ? 1 : 3;
                while (data.length) {
                    rows.push(data.splice(0, width));
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
        return <React.Fragment>
                 {this.state.rows.map((row) =>
                    <ItemListRow row={row} is_main={this.props.is_main} notype={this.props.notype} />)}
               </React.Fragment>;
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
        return <React.Fragment>
                 {!this.state.empty &&
                   <div class="row"><div class="col-12">
                     <h3 class="pt-4">{this.props.title}</h3>
                   </div></div>
                 }
                 { this.props.parent && this.props.parent != -1 &&
                   <ItemList {...this.props} is_main="1" onLoadItems={this.onLoadItems}/>
                 }
                 <ItemList {...this.props} is_main="0" onLoadItems={this.onLoadItems}/>
               </React.Fragment>;
    }
}
