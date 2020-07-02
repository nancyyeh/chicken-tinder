const useState = React.useState;
const useEffect = React.useEffect;
const useHistory = window.ReactRouterDOM.useHistory;

function Results() {
  let history = useHistory();
  const { roomid } = useParams();
  const [error, setError] = useState(null);

  const [results, setResults] = useState({});
  const [completes, setCompletes] = useState(null);
  const [isShowResults, setIsShowResults] = useState(false);
  const [busData, setBusData] = useState([]);
  const [matchedBus, setMatched] = useState([]);
  const [sec, setSec] = useState(10);

  // function of refresh button to updated number of people completed
  const onRefresh = () => {
    const url = "/api/completes/" + roomid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((completes) => {
        setCompletes(Number(completes));
      })
      .catch((e) => {
        setError(e.message);
      });
  };

  // get number of people completed when page is loaded
  useEffect(() => {
    onRefresh();
  }, [roomid]);

  //load business data to be render match business
  useEffect(() => {
    const url = "/api/bus/" + roomid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        const newBusDict = {};
        for (let bus of result) {
          newBusDict[bus.id] = bus;
        }
        setBusData(newBusDict);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [roomid]);

  // set seconds
  useEffect(() => {
    if (sec > 0) {
      setTimeout(() => setSec(sec - 1), 1000);
    }
    if (sec === 0 && (completes === 0 || completes == null)) {
      history.push("/room/");
    }
    return function cleanup() {
      clearTimeout();
    };
  }, [sec]);

  // function on show results button - show resturant names of those matched
  const onResults = () => {
    const url = "/api/results/" + roomid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((res) => {
        setIsShowResults((previousState) => !previousState);
        setResults(res);
        const matchedListBusId = [];
        for (let [key, value] of Object.entries(res)) {
          if (value === completes) {
            matchedListBusId.push(key);
          }
        }
        setMatched(matchedListBusId);
      });
  };

  // the results to been shown after show results button is clicked
  let showResults;
  if (isShowResults) {
    if (matchedBus.length === 0) {
      showResults = (
        <div className="results-sec" id="no-matched">
          <img src="/static/img/loudly_crying_face.gif" />
          <h5>Uh no!</h5>
          <p>
            It seems like you and your friends cannot agree on what to eat...
            <br />
            <Link to="/">Click here to try again</Link>
            <br />
            or settle for some frozen chicken tenders.
          </p>
        </div>
      );
    } else {
      showResults = (
        <div className="results-sec" id="yes-matched">
          <h2 className="text-center heading-text">It's a Match!</h2>
          <div className="mt-2">
            <img src="/static/img/confetti_ball.gif" height="48px" />
            <span className="text-center">Winner Winner Chicken Dinner...</span>
            <img src="/static/img/confetti_ball.gif" height="48px" />
          </div>
          <div className="container">
            <div className="row justify-content-around" id="matched-bus">
              {matchedBus.map((businessKey) => {
                const business = busData[businessKey];
                return (
                  <div
                    key={businessKey}
                    className="col-sm-12 col-md-6 col-lg-4"
                  >
                    <div className="matched-cards m-4">
                      <a href={business.url} target="_blank">
                        <div>
                          <img src={business.image_url} />
                          <br />
                          <span className="text-center">{business.name}</span>
                        </div>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }

  const redirect_error = (completes === 0 || completes === null) && (
    <div id="invalid-roomid">
      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading">Uh ohhh!</h4>
        You have entered an invalid room id or no one has completed yet!
      </div>
      <img src="/static/img/loudly_crying_face.gif" />
      <p>You will be redirect to the room page in {sec} seconds.</p>
      <Link to={"/room/"} onClick={clearTimeout()}>
        <span className="pink-text"> Click here to get redirected</span>
      </Link>
    </div>
  );

  /*rendering - if someone completed show how many people completed 
  and show results button, else show invalid link and redirect to room */
  return completes > 0 ? (
    <div id="valid-roomid">
      <div className="num-people-completed">
        <span>{completes} person(s) completed </span>
        <button
          className="btn btn-secondary btn-xs"
          id="refresh"
          onClick={onRefresh}
        >
          <img
            src="/static/img/arrow-clockwise.svg"
            width="24"
            height="24"
            title="refresh"
          />
        </button>
      </div>

      <div className="results-button">
        <button className="btn btn-pink my-3" onClick={onResults}>
          Show Results
        </button>
      </div>

      {showResults}
    </div>
  ) : (
    redirect_error
  );
}
