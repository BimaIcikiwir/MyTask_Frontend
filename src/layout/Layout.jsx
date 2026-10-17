import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <div className="grid grid-cols-[auto_1fr] min-h-screen">
            <aside>
                <Sidebar />
            </aside>

            <main className="grid grid-rows-[auto_1fr]">
                <header>
                    <Header />
                </header>

                <div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;