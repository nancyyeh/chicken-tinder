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
        <div id="no-matched">
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
        <div id="yes-matched">
          <h2>
            <img src="/static/img/confetti_ball.gif" height="48px" />
            It's a match!
            <img src="/static/img/confetti_ball.gif" height="48px" />
          </h2>
          Winner winner chicken dinner...
          <div className="row" id="matched-bus">
            {matchedBus.map((businessKey) => {
              const business = busData[businessKey];
              return (
                <div key={businessKey} className="col-xs-12 col-sm-6 col-md-4">
                  <div className="matched-cards m-4">
                    <a href={business.url} target="_blank">
                      <img src={business.image_url} />
                      <h6>{business.name}</h6>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }

  const redirect_error = (completes === 0 || completes === null) && (
    <div id="invalid-roomid">
      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading">Uh ohhh!</h4>
        You have entered an invalid room id or no one completed yet!
      </div>
      <p>You will be redirect to the room page in {sec} seconds.</p>
      <Link to={"/room/"}>Click here to get redirected</Link>
    </div>
  );

  /*rendering - if someone completed show how many people completed 
  and show results button, else show invalid link and redirect to room */
  return completes > 0 ? (
    <div id="valid-roomid">
      <div className="num-people-completed">
        {completes} people completed
        <button
          className="btn btn-secondary btn-sm"
          id="refresh"
          onClick={onRefresh}
        >
          <img
            src="/static/img/arrow-clockwise.svg"
            width="26"
            height="25"
            title="refresh"
          />
        </button>
      </div>

      <div className="results-button">
        <button className="btn btn-primary" onClick={onResults}>
          Show Results
        </button>
      </div>

      {showResults}
    </div>
  ) : (
    redirect_error
  );
}
