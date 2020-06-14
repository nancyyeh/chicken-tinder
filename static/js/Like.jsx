const useState = React.useState;
const useEffect = React.useEffect;
const useParams = window.ReactRouterDOM.useParams;
const Router = window.ReactRouterDOM.BrowserRouter;
const Redirect = window.ReactRouterDOM.Redirect;

function Like() {
  let { uuid, userid } = useParams();
  const [error, setError] = useState(null);

  const [busData, setBusData] = useState([]);
  const [isCardsLoaded, setIsCardsLoaded] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState({});
  const [userCompleted, setUserCompleted] = useState(false);

  //LOAD BUSINESSES DATA to be render to cards
  useEffect(() => {
    const url = "/api/bus/" + uuid;
    // const x = JSON.stringify(data)
    // alert(`Submitted ${x}`);
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setBusData(result);
        const cardsCompleted = {};
        result.map((bus) => (cardsCompleted[bus.id] = false));
        setCardsCompleted(cardsCompleted);
        setIsCardsLoaded(true);
      });
  }, [uuid]);

  //LOAD USER
  useEffect(() => {
    fetch(`/api/user/${userid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setUserCompleted(result.completed);
        // console.log(`user completed: ${userCompleted}`);
      });
  }, []);

  useEffect(
    function checkCompleted() {
      // if completed all cards  & show results
      const isAllTrue = (value) => value == true;
      const allCardsCompletedValues = Object.values(cardsCompleted);

      console.log(
        `cardloaded:${isCardsLoaded} & allcardscompleted: ${allCardsCompletedValues.every(
          isAllTrue
        )}`
      );

      if (isCardsLoaded && allCardsCompletedValues.every(isAllTrue)) {
        setUserCompleted(true);
        fetch(`/api/user_completed/${userid}`, {
          method: "POST",
        })
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
          });
      }
    },
    [cardsCompleted]
  );

  //function of click Love
  const handleLove = (businessId) => {
    return (event) => {
      const newCardsCompleted = {
        ...cardsCompleted,
      };
      newCardsCompleted[businessId] = true;
      setCardsCompleted(newCardsCompleted);

      console.log(newCardsCompleted);

      const data = { uuid: uuid, busid: businessId, love: true };
      fetch(`/api/createlove/${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          // alert(result)
        });
    };
  };

  //function of click No
  const handleNope = (businessId) => {
    return (event) => {
      const newCardsCompleted = {
        ...cardsCompleted,
      };
      newCardsCompleted[businessId] = true;
      setCardsCompleted(newCardsCompleted);

      console.log(newCardsCompleted);

      const data = { uuid: uuid, busid: businessId, love: false };
      fetch(`/api/createlove/${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          // alert(result)
        });
    };
  };

  // RENDER
  if (userCompleted) {
    // alert(`User ${userCompleted}`)
    return <Redirect to={`/results/${uuid}`} />;
  } else {
    return (
      <div>
        <h1>Like the resturants</h1>

        <div id="resturant-widgets">
          {busData.map((business) => {
            const id = business.id;
            if (!cardsCompleted[id]) {
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
}
