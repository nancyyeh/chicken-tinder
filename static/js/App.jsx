const useState = React.useState;
const Router = window.ReactRouterDOM.BrowserRouter;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;
const Switch = window.ReactRouterDOM.Switch;
const Redirect = window.ReactRouterDOM.Redirect;

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Switch>
          <Route path="/" exact component={Search} />
          <Route path="/room/:uuid" component={Room} />
          <Route path="/room" component={Room} />
          <Route path="/like/:uuid/:userid" component={Like} />
          <Route path="/results/:uuid" component={Results} />
        </Switch>
      </div>
    </Router>
  );
}

function Nav() {
  const navStyle = {
    color: "white",
  };

  return (
    <nav>
      <h3>Chicken Tinder</h3>
      <ul className="nav-links">
        <Link style={navStyle} to="/">
          <li>Search</li>
        </Link>
        <Link style={navStyle} to="/room">
          <li>Room</li>
        </Link>
        <Link style={navStyle} to="/results">
          <li>Results</li>
        </Link>
      </ul>
    </nav>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
