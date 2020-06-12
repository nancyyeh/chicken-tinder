class Results extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      completes: null,
      results: null,
      uuid: "",
    };
  }

  componentDidMount() {
    const uuid = this.props.match.params.uuid;
    this.setState({ uuid: uuid });
    this.onRefresh();
  }

  onRefresh = () => {
    const uuid = this.props.uuid;
    const url = "/api/completes/" + uuid;
    fetch(url)
      .then((response) => response.json())
      .then((completes) => this.setState({ completes }));
  };

  onResults = () => {
    const uuid = this.props.uuid;
    const url = "/api/results/" + uuid;
    fetch(url)
      .then((response) => response.json())
      .then((results) => this.setState({ results }));
  };

  render() {
    let result = this.state.results;

    return (
      <div>
        <div>
          <div className="num-completes">
            {this.state.completes} people completed
            <button
              className="btn btn-secondary btn-sm"
              onClick={this.onRefresh}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="submit-button">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={this.onResults}
          >
            Show results!
          </button>
          <div>
            Results are here:
            <div>
              {result.map((business, i) => (
                <div key={i}>
                  <h3>{business}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
