const useState = React.useState;
const Router = window.ReactRouterDOM.BrowserRouter;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;
const Switch = window.ReactRouterDOM.Switch;
const Redirect = window.ReactRouterDOM.Redirect;

function Search() {
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [uuid, setUuid] = useState("");
  const [url, setUrl] = useState("");
  const [formData, setFormData] = useState({
    find: "",
    near: "",
    numsearch: "",
    pricerange: [],
    isopennow: false,
    //TO DO LATER sortby: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.find === "") {
      formData.find = "Resturants";
    }
    if (formData.numsearch === "") {
      formData.numsearch = "10";
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
          setUuid(result);
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
    if (idx != -1) {
      pricerange.splice(idx);
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

  return (
    <div>
      <h1>Welcome start your search</h1>

      <div id="search">
        <form onSubmit={handleSubmit}>
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
              value={formData.find}
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                Near*
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              name="near"
              placeholder="San Francisco"
              onChange={handleInputChange}
              value={formData.near}
              required
            />
          </div>

          <div className="btn-group btn-group-toggle" data-toggle="buttons">
            How many selections?
            <NumSearchButton
              value="5"
              currentNumSearch={formData.numsearch}
              handleInputChange={handleInputChange}
            />
            <NumSearchButton
              value="10"
              currentNumSearch={formData.numsearch}
              handleInputChange={handleInputChange}
            />
            <NumSearchButton
              value="15"
              currentNumSearch={formData.numsearch}
              handleInputChange={handleInputChange}
            />
            <NumSearchButton
              value="20"
              currentNumSearch={formData.numsearch}
              handleInputChange={handleInputChange}
            />
          </div>

          <div className="btn-group btn-group-toggle" role="group">
            Price Range
            <PriceRangeButton
              displayValue="$"
              value="1"
              isSelected={formData.pricerange.indexOf(1) != -1}
              handlePriceRangeInput={handlePriceRangeInput}
            />
            <PriceRangeButton
              displayValue="$$"
              value="2"
              isSelected={formData.pricerange.indexOf(2) != -1}
              handlePriceRangeInput={handlePriceRangeInput}
            />
            <PriceRangeButton
              displayValue="$$$"
              value="3"
              isSelected={formData.pricerange.indexOf(3) != -1}
              handlePriceRangeInput={handlePriceRangeInput}
            />
            <PriceRangeButton
              displayValue="$$$$"
              value="4"
              isSelected={formData.pricerange.indexOf(4) != -1}
              handlePriceRangeInput={handlePriceRangeInput}
            />
          </div>

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

          <div className="submit-button">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      <div>
        {isLoaded && (
          <div>
            <p>
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
            </p>
          </div>
        )}
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
      className={`btn btn-outline-primary ${
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
