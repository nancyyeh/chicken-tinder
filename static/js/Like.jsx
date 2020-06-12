const useState = React.useState;
const useEffect = React.useEffect;
const useParams = window.ReactRouterDOM.useParams;

function Like() {
  let { uuid } = useParams();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [busData, setBusData] = useState([]);
  const [showCard, setShow] = useState({});

  useEffect(() => {
    const url = "/api/bus/" + uuid;
    // const x = JSON.stringify(data)
    // alert(`Submitted ${x}`);
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        // alert(`result ${result}`);
        setBusData(result);
        setIsLoaded(true);
        const showCardResults = {};
        result.map((bus) => (showCardResults[bus.id] = true));
        setShow(showCardResults);
      });
  }, [uuid]);

  const handleLove = (businessId) => {
    return (event) => {
      // console.log(businessId);
      const newShowCard = {
        ...showCard
      };
      newShowCard[businessId] = false;
      setShow(newShowCard);
      console.log(showCard);
      const data = { uuid: uuid, busid: businessId, love: true, };
      alert(data)
      fetch("/api/createlove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "same-origin",
      })
      .then((response) => response.json())
      .then(
           (result) => {
              alert(result)
           }
      );
    }
  };

  const handleNope = (businessId) => {
    return (event) => {
      // console.log(businessId);
      const newShowCard = {
        ...showCard
      };
      newShowCard[businessId] = false;
      setShow(newShowCard);
      console.log(showCard)
    }
  };

  return (
    <div>
      <h1>Like the resturants</h1>

      <div id="resturant-widgets">
        {busData.map((business) => {
          const id = business.id
          return(
            (showCard[id]) ? 
            <div key={business.id} className="card2">
              <h3>{business.name}</h3>
              <img src={business.image_url} height="150" />
              <p>Review Count: {business.review_count}</p>
              <p>Rating: {business.rating}</p>
              <p>Price: {business.price}</p>
              <p>showcard: {String(showCard[id])}</p>

              <div className="love-nope-buttons">
              {/* need to use button later */}
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
            : <div key={business.id} className="card3"> hide </div>
          )
        })}
      </div>
    </div>
  );
}
