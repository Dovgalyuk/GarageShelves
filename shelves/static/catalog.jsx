/* Catalog item logo */
class Logo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {id:props.id, img_id: -1};
    }

    componentDidMount() {
        fetch(flask_util.url_for('catalog._get_logo', { id:this.state.id }))
           .then(response => response.json())
           .then(data => { if (data.result) this.setState({img_id:data.result.id}); });
    }

    render() {
        if (this.state.img_id == -1) {
            return <span class="text-muted"><i class="fas fa-laptop fa-4x"></i></span>;
        } else {
            return <img src={ flask_util.url_for('uploads.view', { id:this.state.img_id } ) }/>;
        }
    }
}
