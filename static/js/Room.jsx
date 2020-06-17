const useState = React.useState;
const useEffect = React.useEffect;
const useParams = window.ReactRouterDOM.useParams;
const useHistory = window.ReactRouterDOM.useHistory;

function Room() {
  const { uuid } = useParams();
  let history = useHistory();

  const [isError, setIsError] = useState(false);
  const [errormsg, setError] = useState(null);
  const [id, setId] = useState(uuid);
  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = { uuid: id, name: name };
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
        history.push(`/like/${id}/${result.id}`);
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
        <h2>Room</h2>
        <p>
          <label>Room ID</label>
          <input
            type="text"
            name="room-id"
            className="form-control"
            placeholder="Enter your room code"
            onChange={(event) => setId(event.target.value)}
            value={id}
            required
          />
        </p>
        <p>
          <label>Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            onChange={(event) => setName(event.target.value)}
            value={name}
            placeholder="Enter your name"
            required
          />
        </p>
        <p>
          <button className="btn btn-primary" type="submit" value="submit">
            Join
          </button>
        </p>
      </form>
    </div>
  );
}
