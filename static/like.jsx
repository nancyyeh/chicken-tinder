"use strict";

// find uuid update later ***** NEED FIXING*********
let current_url = window.location.href;
let url_items = current_url.split("/");
let uuid = url_items[4];

class ShowResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      completes: null,
      results: null,
    };
  }

  componentDidMount() {
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
    let result = this.state.results

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
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<ShowResults uuid={uuid} />, document.getElementById("root"));
