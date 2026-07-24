import { FaBell, FaUserCircle } from "react-icons/fa";

function DashboardNavbar() {

    const name = localStorage.getItem("name");

    return (

        <nav className="navbar bg-white shadow-sm rounded p-3 mb-4">

            <div>

                <h4 className="mb-0">
                    Dashboard
                </h4>

            </div>

            <div className="d-flex align-items-center">

                <FaBell size={20} className="me-4"/>

                <FaUserCircle size={35}/>

                <span className="ms-2 fw-bold">

                    {name}

                </span>

            </div>

        </nav>

    )

}

export default DashboardNavbar;