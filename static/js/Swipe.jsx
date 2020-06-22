const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;
const useParams = window.ReactRouterDOM.useParams;
const Router = window.ReactRouterDOM.BrowserRouter;
const Redirect = window.ReactRouterDOM.Redirect;

// what percent of the width needs to be crossed for a swipe to register
const SWIPE_WIDTH_THRESHOLD = 0.08;

function SwipeApp() {
  const { uuid, userid } = useParams();

  const [busData, setBusData] = useState([]);
  const [isCardsLoaded, setIsCardsLoaded] = useState(false);
  const [isUserCompleted, setIsUserCompleted] = useState(false);

  const [swipeable, setSwipeable] = useState(true);
  const [dragStyle, setDragStyle] = useState({});
  const [likeStyle, setLikeStyle] = useState({});
  const [likeSymbol, setLikeSymbol] = useState("");
  const [dragging, setDragging] = useState(false);
  const [elementBounds, setElementBounds] = useState(null);
  const [initMousePos, setInitMousePos] = useState(null);

  const appElement = useRef(null);

  //set elementBounds
  useEffect(() => {
    setElementBounds(appElement.current.getBoundingClientRect());
  }, []);

  //load business data to be render to cards
  useEffect(() => {
    const url = "/api/bus/" + uuid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setBusData(result);
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
        setIsUserCompleted(result.completed);
      });
  }, []);

  // check if completed
  useEffect(
    function checkCompleted() {
      // if completed all cards  & show results
      if (isCardsLoaded && busData.length === 0) {
        setIsUserCompleted(true);
        fetch(`/api/user_completed/${userid}`, {
          method: "POST",
        })
          .then((response) => response.json())
          .then((result) => {});
      }
    },
    [busData]
  );

  /* swiping love and hate - used guiding codes from 
  https://codepen.io/dylangggg/full/aeoEpQ 
  https://codepen.io/RobVermeer/full/japZpY
  https://codepen.io/loringdodge/full/BNmRrK
  */
  const mouseMove = (event) => {
    if (dragging && swipeable) {
      const leftValue = event.clientX - initMousePos.x;
      let likeWord = "",
        likeStyle = {};

      if (leftValue < 0) {
        likeWord = "x";
        likeStyle.opacity = map(leftValue, -elementBounds.width, 0, 2, 0);
        likeStyle.background = "#cdd6dd";
      } else if (leftValue > 0) {
        likeWord = "♥";
        likeStyle.opacity = map(leftValue, 0, elementBounds.width, 0, 2);
        likeStyle.background = "#FFACE4";
      }
      const rotation = leftValue * 0.2;

      setDragStyle({
        left: leftValue,
        top: event.clientY - initMousePos.y,
        transform: `rotate(${rotation}deg)`,
      });
      setLikeStyle(likeStyle);
      setLikeSymbol(likeWord);
    }
  };

  const mouseDown = (event) => {
    if (swipeable) {
      setElementBounds(appElement.current.getBoundingClientRect());
      setDragging(true);
      setInitMousePos({
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const mouseUp = (event) => {
    if (swipeable) {
      setDragging(false);
      const leftValue = event.clientX - initMousePos.x;
      if (leftValue < -elementBounds.width * SWIPE_WIDTH_THRESHOLD) {
        swipeLeft();
      } else if (leftValue > elementBounds.width * SWIPE_WIDTH_THRESHOLD) {
        swipeRight();
      } else {
        setDragStyle({
          top: 0,
          transform: "rotate(0)",
          transition: "all 0.5s",
        });
        setLikeStyle({
          ...likeStyle,
          opacity: 0,
          transition: "all 0.5s",
        });
      }
    }
  };

  const swipeRight = () => {
    setDragStyle({
      ...dragStyle,
      left: "40rem",
      transform: "rotate(30deg)",
      transition: "all 0.5s",
    });
    setSwipeable(false);
    setTimeout(() => dataSplice(), 500);
    handleLove(busData[0].id);
  };

  const swipeLeft = () => {
    setDragStyle({
      ...dragStyle,
      left: "-40rem",
      transform: "rotate(-30deg)",
      transition: "all 0.5s",
    });
    setSwipeable(false);
    setTimeout(() => dataSplice(), 500);
    handleNope(busData[0].id);
  };

  //remove busData and reset the swiping records for a new card
  const dataSplice = () => {
    setBusData(busData.splice(1));
    setDragStyle({});
    setLikeStyle({});
    setLikeSymbol("");
    setSwipeable(true);
    setDragging(false);
    setInitMousePos({});
  };

  //send love to server
  const handleLove = (busid) => {
    console.log(`LOVE(Swipe right): ${uuid}, ${busid}`);
    const data = { uuid, busid, love: true };
    fetch(`/api/createlove/${userid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  //send nope to server
  const handleNope = (busid) => {
    console.log(`HATE(Swipe left): ${uuid}, ${busid}`);
    const data = { uuid, busid, love: false };
    fetch(`/api/createlove/${userid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  //background card
  const stationaryItem =
    busData.length > 1 ? (
      <div className="draggable-wrapper">
        <div className="bus-card">
          <div className="content-image-wrapper">
            <img
              src={busData[1].image_url}
              className="content-image"
              draggable="false"
            />
          </div>
          <div className="content-name">
            <h3>{busData[1].name}</h3>
          </div>
          <div className="content-info">
            <div>Review Count: {busData[1].review_count}</div>
            <div>Rating: {busData[1].rating}</div>
            <div>Price: {busData[1].price}</div>
          </div>
        </div>
      </div>
    ) : (
      <div className="draggable-wrapper">
        <div>That's all folks</div>
      </div>
    );

  //swiping card
  const swipeableItem = busData.length > 0 && (
    <div
      onMouseMove={mouseMove}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      className="draggable-wrapper noselect"
    >
      <div key={busData[0].id} className="bus-card" style={dragStyle}>
        <div className="content-image-wrapper">
          <img
            src={busData[0].image_url}
            className="content-image"
            draggable="false"
          />
        </div>
        <div className="content-name">
          <h3>{busData[0].name}</h3>
        </div>
        <div className="content-info">
          <div>Review Count: {busData[0].review_count}</div>
          <div>Rating: {busData[0].rating}</div>
          <div>Price: {busData[0].price}</div>
        </div>
        <div className="like-dislike-label" style={likeStyle}>
          {likeSymbol}
        </div>
      </div>
    </div>
  );

  //the love and nop buttons
  const buttonsLoveNope = busData.length > 0 && (
    <div className="tinder--buttons">
      <button id="nope">
        <img src="/static/img/x.svg" title="nope" onClick={swipeLeft} />
      </button>

      <button id="love">
        <img
          src="/static/img/heart-fill.svg"
          title="love"
          onClick={swipeRight}
        />
      </button>
    </div>
  );

  //rendering
  return isUserCompleted ? (
    <div id="completed">
      <Redirect to={`/results/${uuid}`} />
    </div>
  ) : (
    <div id="not-completed">
      not completed
      <div ref={appElement} className="swipe-app">
        <div>
          <h1>Like the resturants</h1>
          <div>Cards remaining: {busData.length}</div>
        </div>

        <div className="draggable-row">
          {stationaryItem}
          {swipeableItem}
        </div>
        <div className="buttons">{buttonsLoveNope}</div>
      </div>
    </div>
  );
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
