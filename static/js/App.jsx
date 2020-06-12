const useState = React.useState;
const Router = window.ReactRouterDOM.BrowserRouter;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;
const Switch = window.ReactRouterDOM.Switch;

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Switch>
          <Route path="/" exact component={Search} />
          <Route path="/room/:uuid" component={Room} />
          <Route path="/like/:uuid" component={Like} />
          <Route path="/results/:uuid" component={Results} />
        </Switch>
      </div>
    </Router>
  );
}

function Search() {
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [uuid, setUuid] = useState("");
  const [url, setUrl] = useState("");
  const [formData, setFormData] = useState({
    find: "",
    near: "",
    numsearch: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const x = JSON.stringify(formData);
    alert(`Submitted ${x}`);

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setUuid(result);
          setUrl("/room/" + result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    // console.log([name, value]);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const copyLink = (event) => {
    const copyText = document.getElementById("link");
    copyText.select();
    document.execCommand("copy");
    // alert("Copied the text: " + copyText.value);
  }

  return (
    <div>
      <h1>Welcome start your search</h1>
      <div id="search">

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="find">Find</label>
            <input
              type="text"
              className="form-control"
              name="find"
              onChange={handleInputChange}
              value={formData.find}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="find">Near</label>
            <input
              type="text"
              className="form-control"
              name="near"
              onChange={handleInputChange}
              value={formData.near}
              required
            />
          </div>

          <div className="form-group">
            Number
            <input
              type="radio"
              className="numsearch"
              name="numsearch"
              value="5"
              onChange={handleInputChange}
              checked={formData.numsearch === "5"}
            /> 5
            <input
              type="radio"
              className="numsearch"
              name="numsearch"
              value="10"
              onChange={handleInputChange}
              checked={formData.numsearch === "10"}
            />
            10
            <input
              type="radio"
              className="numsearch"
              name="numsearch"
              value="15"
              onChange={handleInputChange}
              checked={formData.numsearch === "15"}
            />
            15
            <input
              type="radio"
              className="numsearch"
              name="numsearch"
              value="20"
              onChange={handleInputChange}
              checked={formData.numsearch === "20"}
            />
            20
          </div>

          <div className="submit-button">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>
      <div>    
        {isLoaded ?
          <div>
            <p>
              <input readOnly type="type" value={url} id="link"/>
              <button onClick={copyLink}>Copy Link</button>
            </p>
            <p>
              <Link to={url}>{url}</Link>
            </p>
          </div>
          :
          <div> Please do a search!</div>
        } 
      </div>
    </div>
  );
}

function Nav() {

  const navStyle = {
      color: 'white'
  };

  return(
      <nav>
          <h3>Logo</h3>
          <ul className='nav-links'>
              <Link style={navStyle} to='/'><li>Search</li></Link>
              <Link style={navStyle} to='/room'><li>Room</li></Link>
              <Link style={navStyle} to='/like'><li>Liking</li></Link>
              <Link style={navStyle} to='/results'><li>Results</li></Link>    
          </ul>
      </nav>
  );
}


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
