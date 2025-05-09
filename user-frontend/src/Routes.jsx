import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import PostDetailPage from "./PostDetailPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/posts/:id",
        element: < PostDetailPage />
    }
]);

export default router;
