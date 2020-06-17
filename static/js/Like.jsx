const useState = React.useState;
const useEffect = React.useEffect;
const useParams = window.ReactRouterDOM.useParams;
const Router = window.ReactRouterDOM.BrowserRouter;
const Redirect = window.ReactRouterDOM.Redirect;

function Like() {
  const { uuid, userid } = useParams();

  const [busData, setBusData] = useState([]);
  const [isCardsLoaded, setIsCardsLoaded] = useState(false);
  const [completedCards, setCompletedCards] = useState({});
  const [isUserCompleted, setIsUserCompleted] = useState(false);

  //load business data to be render to cards
  useEffect(() => {
    const url = "/api/bus/" + uuid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setBusData(result);
        const returnedCompletedCards = {};
        result.map((bus) => (returnedCompletedCards[bus.id] = false));
        setCompletedCards(returnedCompletedCards);
        setIsCardsLoaded(true);
      });
  }, [uuid]);

  //load user data - check if they have completed or not
  useEffect(() => {
    fetch(`/api/user/${userid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setIsUserCompleted(result.completed);
      });
  }, []);

  useEffect(
    function checkCompleted() {
      // if completed all cards  & show results
      const isAllTrue = (value) => value === true;
      const allCardsCompletedValues = Object.values(completedCards);

      if (isCardsLoaded && allCardsCompletedValues.every(isAllTrue)) {
        setIsUserCompleted(true);
        fetch(`/api/user_completed/${userid}`, {
          method: "POST",
        })
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
          });
      }
    },
    [completedCards]
  );

  //function of click Love
  const handleLove = (busid) => {
    return (event) => {
      const newCardsCompleted = {
        ...completedCards,
      };
      setCompletedCards({ ...newCardsCompleted, busid: true });
      console.log(newCardsCompleted);

      const data = { uuid, busid, love: true };
      fetch(`/api/createlove/${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    };
  };

  //function of click No
  const handleNope = (busid) => {
    return (event) => {
      setCompletedCards({ ...completedCards, busid: true });
      console.log(newCardsCompleted);

      const data = { uuid, busid, love: true };
      fetch(`/api/createlove/${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    };
  };

  // Rending section
  return isUserCompleted ? (
    <Redirect to={`/results/${uuid}`} />
  ) : (
    <div>
      <h1>Like the resturants</h1>

      <div id="resturant-widgets">
        {busData.map((business) => {
          const id = business.id;
          if (!completedCards[id]) {
            return (
              <div key={business.id} className="card2">
                <h3>{business.name}</h3>
                <img src={business.image_url} height="150" />
                <p>Review Count: {business.review_count}</p>
                <p>Rating: {business.rating}</p>
                <p>Price: {business.price}</p>

                <div className="love-nope-buttons">
                  <button
                    id="nope"
                    onClick={handleNope(business.id)}
                    value="false"
                    name="like"
                  >
                    <img
                      src="/static/img/x.svg"
                      alt=""
                      width="32"
                      height="32"
                      title="x"
                    />
                  </button>
                  <button id="love" onClick={handleLove(business.id)}>
                    <img
                      src="/static/img/heart-fill.svg"
                      alt=""
                      width="32"
                      height="32"
                      title="love"
                    />
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
