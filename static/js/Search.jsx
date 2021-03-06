const useState = React.useState;
const Router = window.ReactRouterDOM.BrowserRouter;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;
const Switch = window.ReactRouterDOM.Switch;

function Search() {
  let history = useHistory();
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [url, setUrl] = useState("");
  const [roomid, setRoomId] = useState("");
  const [formData, setFormData] = useState({
    find: "",
    near: "",
    numsearch: "",
    pricerange: [],
    isopennow: false,
    latitude: "",
    longitude: "",
    sortby: "best_match",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.find === "") {
      formData.find = "Resturants";
    }
    if (formData.numsearch === "") {
      formData.numsearch = "5";
    }

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setRoomId(result);
          setUrl(window.location + "room/" + result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.name === "isopennow" ? target.checked : target.value;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePriceRangeInput = (event) => {
    const target = event.target;
    const value = Number(target.value);
    const pricerange = [...formData.pricerange];
    const idx = pricerange.indexOf(value);
    if (idx > -1) {
      pricerange.splice(idx, 1);
    } else {
      pricerange.push(value);
    }

    setFormData({
      ...formData,
      pricerange: pricerange,
    });
  };

  const copyLink = (event) => {
    const copyText = document.getElementById("link");
    copyText.select();
    document.execCommand("copy");
    alert("Link into clipboard!");
  };

  const newsearch = (event) => {
    setIsLoaded(false);
    setFormData({
      find: "",
      near: "",
      numsearch: "",
      pricerange: [],
      isopennow: false,
      latitude: "",
      longitude: "",
      sortby: "best_match",
    });
  };

  const copyLinkRedirect = (event) => {
    copyLink();
    history.push(`/room/${roomid}/`);
  };

  const shareLink = (event) => {
    const shareData = {
      title: "What should we eat?",
      text:
        "Click on the link to pick the restaurants we should eat at! Link expires in 90 mins.",
      url: url,
    };
    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => console.log("successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      copyLink();
    }
  };

  const getLocation = (event) => {
    const success = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const data = { lat: lat, lng: lng };
      fetch("/api/reverse_geolocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) =>
          setFormData({
            ...formData,
            near: result,
            latitude: lat,
            longitude: lng,
          })
        )
        .catch((error) => {
          console.log("error", error);
        });
    };
    const error = (error) => {
      console.log(error);
      setFormData({
        ...formData,
        near: "",
      });
      alert(
        "To use the geolocation feature, please allow your location and try again!"
      );
    };
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
      setFormData({
        ...formData,
        near: "Loading...",
      });
    }
  };

  return (
    <div id="create-selection">
      <div>
        <h2 className="text-center heading-text">Create Selection</h2>
        {isLoaded ? (
          <div className="mt-3">
            <p className="text-center">
              Share the link with your friends!
              <br />
              Or ask your friends to join at{" "}
              <a href="/room">chickentinder.me/room</a>
              <br /> Room code:{" "}
              <span className="font-weight-bold">{roomid}</span>
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-center">
              Hello! Having a hard time picking what to eat?
              <br />
              Enter a location, share your room code & start swiping!
            </p>
          </div>
        )}
      </div>

      {isLoaded ? (
        <section id="rooms-details">
          <div className="container mt-1 input-sec" id="room-codes">
            <div className="d-flex justify-content-between ">
              <div className="font-weight-bold">
                <label>Room Link </label>
              </div>
            </div>
            <div className="input-group mb-3">
              <input
                readOnly
                className="form-control"
                type="text"
                value={url}
                id="link"
              />
              <button className="btn btn-secondary" onClick={shareLink}>
                <img
                  src="/static/img/box-arrow-in-up.svg"
                  alt=""
                  width="20"
                  height="20"
                  title="share"
                />{" "}
                Share
              </button>
            </div>
            <div className="copy-room-btn">
              <button className="btn btn-pink" onClick={copyLinkRedirect}>
                Copy Link & Join Room
              </button>
            </div>
            <div className="text-center">
              <a onClick={newsearch}>
                <span className="pink-text">
                  <small>Click here to start a search</small>
                </span>
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="container mt-1 input-sec" id="search">
            <form onSubmit={handleSubmit}>
              <FindSec
                handleInputChange={handleInputChange}
                inputdata={formData.find}
              />

              <NearSec
                handleInputChange={handleInputChange}
                inputdata={formData.near}
                getLocation={getLocation}
              />

              <div id="more-options">
                <div
                  className="d-flex align-items-start mb-2 pink-text"
                  id="more-options-button"
                >
                  <a
                    data-toggle="collapse"
                    data-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                    className="more-options-link collapsed"
                  >
                    More Options
                  </a>
                </div>
                <div id="collapseOne" className="collapse">
                  <div className="row">
                    <NumCardsSec handleInputChange={handleInputChange} />
                    <SearchBySec handleInputChange={handleInputChange} />
                  </div>
                  <div className="row">
                    <PriceRangeSec
                      formData={formData}
                      handleInputChange={handleInputChange}
                    />
                    <OpenNowSec handleInputChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="submit-button mb-3">
                <button type="submit" className="btn btn-pink">
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

function NearSec({ handleInputChange, inputdata, getLocation }) {
  return (
    <div className="input-group mb-1">
      <div className="input-group-prepend">
        <span className="input-group-text" id="basic-addon1">
          Near*
        </span>
      </div>
      <input
        type="text"
        className="form-control"
        name="near"
        placeholder="address, neighborhood, city, or zip"
        onChange={handleInputChange}
        value={inputdata}
        required
      />
      <button type="button" className="btn btn-secondary" onClick={getLocation}>
        <img
          src="/static/img/cursor-fill.svg"
          alt=""
          width="20"
          height="20"
          title="current-location"
        />
      </button>
    </div>
  );
}
function PriceRangeSec({ handlePriceRangeInput, formData }) {
  return (
    <div className="input-group col-sm mb-2">
      <div
        className="btn-group btn-group-toggle"
        data-toggle="buttons"
        role="group"
      >
        <PriceRangeButton
          displayValue="$"
          value="1"
          handlePriceRangeInput={handlePriceRangeInput}
          isSelected={formData.pricerange.indexOf(1) != -1}
        />
        <PriceRangeButton
          displayValue="$$"
          value="2"
          handlePriceRangeInput={handlePriceRangeInput}
          isSelected={formData.pricerange.indexOf(2) != -1}
        />
        <PriceRangeButton
          displayValue="$$$"
          value="3"
          handlePriceRangeInput={handlePriceRangeInput}
          isSelected={formData.pricerange.indexOf(3) != -1}
        />
        <PriceRangeButton
          displayValue="$$$$"
          value="4"
          handlePriceRangeInput={handlePriceRangeInput}
          isSelected={formData.pricerange.indexOf(4) != -1}
        />
      </div>
    </div>
  );
}

function FindSec({ handleInputChange, inputdata }) {
  return (
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text" id="basic-addon1">
          Find
        </span>
      </div>
      <input
        type="text"
        className="form-control"
        name="find"
        placeholder="resturants, takeout, delivery, chinese food"
        onChange={handleInputChange}
        value={inputdata}
      />
    </div>
  );
}

// html for Num Cards
function NumCardsSec({ handleInputChange }) {
  return (
    <div className="input-group col-sm mb-3">
      <div className="input-group-prepend">
        <label className="input-group-text" htmlFor="inputGroupSelect01">
          # Cards
        </label>
      </div>
      <select
        name="numsearch"
        className="form-control"
        id="num"
        onChange={handleInputChange}
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>
  );
}

// html for Search by
function SearchBySec({ handleInputChange }) {
  return (
    <div className="input-group col-sm mb-3">
      <div className="input-group-prepend">
        <label className="input-group-text" htmlFor="inputGroupSelect01">
          Search
        </label>
      </div>
      <select
        name="sortby"
        className="form-control"
        id="sortby"
        onChange={handleInputChange}
      >
        <option value="best_match">Best Match</option>
        <option value="rating">Rating</option>
        <option value="review_count">Review Count</option>
        <option value="distance">Distance</option>
      </select>
    </div>
  );
}

// html for Open Now Button
function OpenNowSec({ handleInputChange }) {
  return (
    <div className="input-group col-sm mb-3">
      <div className="custom-control custom-switch">
        <input
          name="isopennow"
          type="checkbox"
          className="custom-control-input"
          id="opennow"
          onChange={handleInputChange}
        />
        <label className="custom-control-label" htmlFor="opennow">
          Open Now
        </label>
      </div>
    </div>
  );
}

// Price Range button - updated with refactoring
function PriceRangeButton({
  displayValue,
  value,
  isSelected,
  handlePriceRangeInput,
}) {
  return (
    <button
      type="button"
      className={`btn btn-outline-primary ${isSelected && "active"}`}
      name="pricerange"
      value={value}
      onClick={handlePriceRangeInput}
    >
      {displayValue}
    </button>
  );
}

// Num Search button - updated with refactoring
function NumSearchButton({ value, currentNumSearch, handleInputChange }) {
  return (
    <label
      className={`btn btn-outline-secondary ${
        currentNumSearch === value && "active"
      }`}
    >
      <input
        type="radio"
        className="options"
        name="numsearch"
        value={value}
        onChange={handleInputChange}
        checked={currentNumSearch === value}
      />
      {value}
    </label>
  );
}
