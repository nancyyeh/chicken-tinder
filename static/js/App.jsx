const useState = React.useState;
const Router = window.ReactRouterDOM.BrowserRouter;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;
const Switch = window.ReactRouterDOM.Switch;
const Redirect = window.ReactRouterDOM.Redirect;
const useHistory = window.ReactRouterDOM.useHistory;

function App() {
  return (
    <Router>
      <div className="App">
        <div className="content-wrap">
          <Nav />
          <Switch>
            <Route path="/" exact component={Search} />
            <Route path="/room/:roomid" component={Room} />
            <Route path="/room" component={Room} />
            <Route path="/swipe/:roomid/:userid" component={SwipeApp} />
            <Route path="/results/:roomid" component={Results} />
          </Switch>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

function Nav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <a className="navbar-brand" href="/">
        <img src="/static/img/logo_purple.png" alt="" height="45px" />
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarText"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
          <li className="nav-item">
            <a className="nav-link" href="/room">
              <div className="room-btn">JOIN A ROOM</div>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <div className="footer">
      <p>
        <small>Made with ♥ by Nancy </small>
        <a href="https://github.com/nancyyeh" target="_blank">
          <img
            src="/static/img/github.svg"
            width="18"
            height="18"
            title="github"
          />
        </a>
      </p>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
