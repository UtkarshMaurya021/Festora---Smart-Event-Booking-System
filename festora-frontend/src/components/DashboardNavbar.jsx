import { FaBell, FaUserCircle, FaCheckCircle } from "react-icons/fa";

function DashboardNavbar() {
    const name = localStorage.getItem("name") || "User";
    const role = localStorage.getItem("role") || "USER";

    const getRoleBadge = (r) => {
        if (r === "ROLE_ADMIN") return "bg-danger";
        if (r === "ROLE_ORGANIZER") return "bg-warning text-dark";
        return "bg-primary";
    };

    return (
        <nav className="navbar bg-white shadow-sm rounded-4 p-3 mb-4 border d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
                <h4 className="mb-0 fw-bold text-dark">Festora Dashboard</h4>
                <span className="badge text-dark border px-3 py-2 rounded-pill fw-semibold small d-none d-md-inline-flex align-items-center gap-1" style={{ background: "linear-gradient(135deg, #e0f2fe, #bae6fd)" }}>
                    <FaCheckCircle color="#0284c7" /> Official Event Platform
                </span>
            </div>

            <div className="d-flex align-items-center gap-3">
                <div className="position-relative cursor-pointer">
                    <FaBell size={20} className="text-secondary" />
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">New alerts</span>
                    </span>
                </div>

                <div className="d-flex align-items-center gap-2 border-start ps-3">
                    <FaUserCircle size={32} className="text-primary" />
                    <div>
                        <div className="fw-bold lh-1 text-dark" style={{ fontSize: "0.9rem" }}>{name}</div>
                        <span className={`badge ${getRoleBadge(role)} mt-1`} style={{ fontSize: "0.65rem" }}>
                            {role.replace("ROLE_", "")}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default DashboardNavbar;