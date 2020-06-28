const useState = React.useState;
const Router = window.ReactRouterDOM.BrowserRouter;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;
const Switch = window.ReactRouterDOM.Switch;

function Search() {
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
    const x = JSON.stringify(formData);
    alert(`Submitted ${x}`);

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

  const shareLink = (event) => {
    const sharedUrl = document.getElementById("link");
    const shareData = {
      title: "What should we eat?",
      text: "Pick the resturants!",
      url: sharedUrl,
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
    <div>
      <div className="container mt-3" id="search">
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
              className="d-flex align-items-start mb-2"
              id="more-options-button"
            >
              <a
                data-toggle="collapse"
                data-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                More Options
              </a>
            </div>

            <div id="collapseOne" className="collapse">
              <div className="row mb-3">
                <NumCardsSec handleInputChange={handleInputChange} />
                <SearchBySec handleInputChange={handleInputChange} />
              </div>

              <div className="row mb-3">
                <PriceRangeSec
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
                <OpenNowSec handleInputChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="submit-button mb-3">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      <div>
        {isLoaded && (
          <div className="container" id="room-codes">
            <div className="input-group mb-3">
              <input
                readOnly
                className="form-control"
                type="text"
                value={roomid}
                id="room-code"
              />
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
          </div>
        )}
      </div>
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
    <div className="input-group col">
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
    <div className="input-group col">
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
    <div className="input-group col">
      <div className="input-group-prepend">
        <label className="input-group-text" htmlFor="inputGroupSelect01">
          Search by
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
    <div className="input-group col">
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
