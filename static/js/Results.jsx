const useState = React.useState;
const useEffect = React.useEffect;

function Results() {
  let { uuid } = useParams();
  const [error, setError] = useState(null);

  const [results, setResults] = useState({});
  const [completes, setCompletes] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [busData, setBusData] = useState([]);
  const [matchedBusinesses, setMatched] = useState([]);

  // get number of people completed when page is loaded
  useEffect(() => {
    onRefresh();
  }, [uuid]);

  // function of refresh button to updated number of people completed
  const onRefresh = () => {
    const url = "/api/completes/" + uuid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((completes) => {
        setCompletes(completes);
      });
  };

  //LOAD BUSINESSES DATA to be render match business
  useEffect(() => {
    const url = "/api/bus/" + uuid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setBusData(result);
      });
  }, [uuid]);

  // function on show results button - show resturant names of those matched
  const onResults = () => {
    const url = "/api/results/" + uuid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((res) => {
        setShowResults(true);
        setResults(res);
        // console.log(results);
        const matchedListBusId = [];
        for (let [key, value] of Object.entries(res)) {
          if (value == completes) {
            matchedListBusId.push(key);
          }
        }
        setMatched(matchedListBusId);
      });
  };

  console.log(matchedBusinesses);

  return (
    <div>
      <div className="num-completes">
        {completes} people completed
        <button
          className="btn btn-secondary btn-sm"
          id="refresh"
          onClick={onRefresh}
        >
          <img
            src="/static/img/arrow-clockwise.svg"
            alt=""
            width="26"
            height="25"
            title="refresh"
          />
        </button>
      </div>

      <div className="results-button">
        <button className="btn btn-primary" onClick={onResults}>
          Show results!
        </button>
      </div>

      {showResults ? (
        <div>
          It's a match!
          <div id="winnings">
            {matchedBusinesses.map((businessKey) => {
              return busData.map((business) => {
                const id = business.id;
                if (id == businessKey) {
                  return (
                    <div key={business.id} className="card2">
                      <h3>{business.name}</h3>
                      <img src={business.image_url} height="150" />
                      <p>Review Count: {business.review_count}</p>
                      <p>Rating: {business.rating}</p>
                      <p>Price: {business.price}</p>
                    </div>
                  );
                }
              });
            })}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
