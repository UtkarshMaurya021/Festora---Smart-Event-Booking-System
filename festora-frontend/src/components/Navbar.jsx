import {Link} from "react-router-dom";

function Navbar(){

return(

<nav className="navbar navbar-expand-lg">

<div className="container">

<Link className="navbar-brand fw-bold fs-3" to="/">

Festora

</Link>

<button
className="navbar-toggler"
data-bs-toggle="collapse"
data-bs-target="#menu">

<span className="navbar-toggler-icon"></span>

</button>

<div className="collapse navbar-collapse" id="menu">

<ul className="navbar-nav ms-auto">

<li className="nav-item">

<Link className="nav-link" to="/">Home</Link>

</li>

<li className="nav-item">

<Link className="nav-link">Events</Link>

</li>

<li className="nav-item">

<Link className="nav-link">About</Link>

</li>

<li className="nav-item">

<Link className="btn btn-primary ms-3" to="/login">

Login

</Link>

</li>

<li className="nav-item">

<Link className="btn btn-outline-primary ms-2" to="/signup">

Signup

</Link>

</li>

</ul>

</div>

</div>

</nav>

)

}

export default Navbar;