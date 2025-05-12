import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import PostDetailPage from "./PostDetailPage";
import Signup from "./Signup"

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
        path: "/signup/",
        element: < Signup />
    }
]);

export default router;
