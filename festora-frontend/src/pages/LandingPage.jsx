import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LandingPage(){

return(

<>

<Navbar/>

<section className="hero">

<div className="container">

<div className="row align-items-center">

<div className="col-md-6">

<h1>

Find Amazing Events

</h1>

<p>

Music Festivals, Workshops,
Hackathons,
Sports,
College Fests
and much more.

</p>

<button className="btn btn-primary btn-lg">

Explore Events

</button>

</div>

<div className="col-md-6">

<img

src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"

className="img-fluid rounded"

alt="Event"

 />

</div>

</div>

</div>

</section>

<section className="container">

<div className="row">

<div className="col-md-4">

<div className="card p-4">

<h4>100+ Events</h4>

<p>

Discover trending events.

</p>

</div>

</div>

<div className="col-md-4">

<div className="card p-4">

<h4>Secure Booking</h4>

<p>

Book tickets securely.

</p>

</div>

</div>

<div className="col-md-4">

<div className="card p-4">

<h4>Verified Organizers</h4>

<p>

Only trusted organizers.

</p>

</div>

</div>

</div>

</section>

<Footer/>

</>

)

}

export default LandingPage;