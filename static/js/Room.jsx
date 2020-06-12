const useState = React.useState;
const useEffect = React.useEffect;
const useParams = window.ReactRouterDOM.useParams;
const useHistory = window.ReactRouterDOM.useHistory;

function Room() {
  let { uuid } = useParams();
  let history = useHistory();

  const [id, setId] = useState(uuid);
  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = { uuid: uuid, name: name };
    // const x = JSON.stringify(data)
    // alert(`Submitted ${x}`);
    fetch("/api/createuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then(
        (result) => {
          // alert(`id: ${result.id}, name: ${result.name}, search_id: ${result.search_id}`)
        }
    );
    history.push(`/like/${uuid}`)

  };

  return (
    <div id="room">
      <form onSubmit={handleSubmit}>
        <h2>Room</h2>
        <h3>UUID: {uuid}</h3>
        <p>
          Room ID
          <input
            type="text"
            name="room-id"
            onChange={(event) => setId(event.target.value)}
            value={id}
            required
          />
        </p>
        <p>
          Name
          <input
            type="text"
            name="name"
            onChange={(event) => setName(event.target.value)}
            value={name}
            required
          />
        </p>
        <p>
          <button type="submit" value="submit">
            Join
          </button>
        </p>
      </form>
    </div>
  );
}
