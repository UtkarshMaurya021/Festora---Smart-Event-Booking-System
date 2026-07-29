import { useEffect, useState } from "react";
import { getTickets } from "../services/ticketService";

function MyTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    getTickets().then((res) => {
      setTickets(res.data);
    });
  }, []);

  return (
    <div className="container">
      <h2>My Tickets</h2>

      <div className="row">
        {tickets.map((ticket) => (
          <div className="col-md-4" key={ticket.ticketId}>
            <div className="card p-3">
              <h5>{ticket.booking.event.title}</h5>

              <p>{ticket.ticketNumber}</p>

              <img
                src={`http://localhost:8080/${ticket.qrCodePath}`}
                alt="QR"
                className="img-fluid"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTickets;
