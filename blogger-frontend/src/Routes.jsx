import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import PostDetailPage from "./PostDetailPage";
import New from "./New";
// import Signup from "./Signup"
import Login from "./Login.jsx"

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
/*         {
        path: "/signup/",
        element: < Signup />
    },*/
        {
        path: "/login/",
        element: < Login />
    } 
]);

export default router;
