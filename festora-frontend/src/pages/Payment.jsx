import { useNavigate,useParams } from "react-router-dom";

import { pay } from "../services/paymentService";

function Payment(){

    const {bookingId}=useParams();

    const navigate=useNavigate();

    const payment=async()=>{

        await pay(bookingId);

        alert("Payment Successful");

        navigate("/my-bookings");

    }

    return(

        <div className="container mt-5">

            <h2>

                Payment

            </h2>

            <button

            className="btn btn-success"

            onClick={payment}

            >

                Pay Now

            </button>

        </div>

    )

}

export default Payment;