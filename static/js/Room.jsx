const useState = React.useState;
const useEffect = React.useEffect;
const Link = window.ReactRouterDOM.Link;
const useParams = window.ReactRouterDOM.useParams;
const useHistory = window.ReactRouterDOM.useHistory;

function Room() {
  const { roomid } = useParams();
  let history = useHistory();

  const [isError, setIsError] = useState(false);
  const [errormsg, setError] = useState(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (roomid) {
      setId(roomid);
    }
  }, [roomid]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = { roomid: id, name: name };
    const x = JSON.stringify(data);
    alert(`Submitted ${x}`);

    fetch("/api/createuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data);
        }

        return response.json();
      })
      .then((result) => {
        history.push(`/swipe/${id}/${result.id}`);
      })
      .catch((e) => {
        setIsError(true);
        setError(e.message);
      });
  };

  return (
    <div id="room">
      {isError && (
        <div className="alert alert-warning" role="alert">
          {errormsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="m-3">
          <div className="d-flex justify-content-between ">
            <div className="font-weight-bold">
              <label>Room Code </label>
            </div>
            <div className="font-weight-bold">{4 - id.length}</div>
          </div>
          <input
            type="text"
            name="room-id"
            className="form-control"
            placeholder="Enter 4-letter code"
            onChange={(event) => setId(event.target.value.toUpperCase())}
            maxLength="4"
            value={id}
            required
          />
          {id.length === 4 && (
            <small id="results-directly" className="form-text text-muted">
              <Link to={`/results/${id}`}>Go to results directly</Link>
            </small>
          )}
        </div>
        <div className="m-3">
          <div className="d-flex justify-content-between ">
            <div className="font-weight-bold">
              <label>Name </label>
            </div>
            <div className="font-weight-bold">{12 - name.length}</div>
          </div>
          <input
            type="text"
            name="name"
            className="form-control"
            onChange={(event) => setName(event.target.value.toUpperCase())}
            value={name}
            maxLength="12"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="m-3">
          <button
            className="btn btn-primary btn-block"
            type="submit"
            value="submit"
            disabled={id.length !== 4 || name === ""}
          >
            Join
          </button>
        </div>
      </form>
    </div>
  );
}
