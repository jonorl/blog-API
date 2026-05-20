import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import PostDetailPage from "./PostDetailPage";
import Signup from "./Signup"
import Login from "./Login"

const hasSubfolder = window.location.pathname.startsWith("/messaging-app");
const basename = hasSubfolder ? "/messaging-app" : "/";

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
        path: "/signup",
        element: < Signup />
    },
        {
        path: "/login",
        element: < Login />
    }
], { basename });

export default router;
