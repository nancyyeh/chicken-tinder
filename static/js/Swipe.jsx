const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;
const useParams = window.ReactRouterDOM.useParams;
const Router = window.ReactRouterDOM.BrowserRouter;
const Redirect = window.ReactRouterDOM.Redirect;

// what percent of the width needs to be crossed for a swipe to register
const SWIPE_WIDTH_THRESHOLD = 0.08;

function SwipeApp() {
  const { roomid, userid } = useParams();

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

  //set elementBounds - do not load if user completed
  useEffect(() => {
    setElementBounds(appElement.current.getBoundingClientRect());
  }, []);

  //load business data to be render to cards - do not load if user completed
  useEffect(() => {
    const url = "/api/bus/" + roomid;
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setBusData(result);
        setIsCardsLoaded(true);
      });
  }, [roomid]);

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
          .then((result) => {})
          .catch((error) => console.log("Error sharing", error));
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
        likeStyle.background = "#7f7c8d";
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
      left: "25rem",
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
      left: "-25rem",
      transform: "rotate(-30deg)",
      transition: "all 0.5s",
    });
    setSwipeable(false);
    setTimeout(() => dataSplice(), 500);
    handleNope(busData[0].id);
  };

  //remove busData and reset the swiping records for a new card
  const dataSplice = () => {
    setDragStyle({});
    setLikeStyle({});
    setLikeSymbol("");
    setSwipeable(true);
    setDragging(false);
    setInitMousePos({});
    setBusData(busData.splice(1));
  };

  //send love to server
  const handleLove = (busid) => {
    // console.log(`LOVE(Swipe right): ${roomid}, ${busid}`);
    const data = { roomid, busid, love: true };
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
    //console.log(`HATE(Swipe left): ${roomid}, ${busid}`);
    const data = { roomid, busid, love: false };
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
              className="content-image img-thumbnail"
              draggable="false"
            />
          </div>

          <div className="container">
            <div className="row">
              <div className="col">
                <span class="font-weight-bold">{busData[1].name}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-auto mr-auto">
                <div
                  className="stars"
                  style={{ "--rating": `${busData[1].rating}` }}
                ></div>
                <small>{busData[1].review_count} Reviews</small>
              </div>
              <div className="col-auto">
                <small>{busData[1].price}</small>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <small>{busData[1].display_address}</small>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <small>{busData[1].categories}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="draggable-wrapper">
        <div>That's all the cards</div>
      </div>
    );

  //swiping card
  const swipeableItem = busData.length > 0 && isUserCompleted === false && (
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
            className="content-image img-thumbnail"
            draggable="false"
          />
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              <span class="font-weight-bold">{busData[0].name}</span>
            </div>
          </div>
          <div className="row">
            <div className="col-auto mr-auto">
              <div
                className="stars"
                style={{ "--rating": `${busData[0].rating}` }}
              ></div>
              <small>{busData[0].review_count} Reviews</small>
            </div>
            <div className="col-auto">
              <small>{busData[0].price}</small>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <small>{busData[0].display_address}</small>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <small>{busData[0].categories}</small>
            </div>
          </div>
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
      <Redirect to={`/results/${roomid}`} />
    </div>
  ) : (
    <div ref={appElement} className="swipe-app" id="not-completed">
      <div>
        <h2 className="text-center heading-text">Start Swiping</h2>
        <div className="mt-3">
          <p className="text-center">Cards remaining: {busData.length}</p>
        </div>
      </div>
      <div className="draggable-row">
        {stationaryItem}
        {swipeableItem}
      </div>
      <div className="buttons">{buttonsLoveNope}</div>
    </div>
  );
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
