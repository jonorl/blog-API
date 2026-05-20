import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import PostDetailPage from "./PostDetailPage";
import New from "./New";
import Login from "./Login.jsx"

const hasSubfolder = window.location.pathname.startsWith("/blog-cms");
const basename = hasSubfolder ? "/blog-cms" : "/";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/posts/:id",
        element: < PostDetailPage />
    },
        {
        path: "/new/",
        element: < New />
    },
        {
        path: "/login/",
        element: < Login />
    } 
], { basename });

export default router;
