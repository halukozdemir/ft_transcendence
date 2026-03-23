import { createBrowserRouter } from "react-router";
import GamePage from "../pages/Game";
import GameLayout from "../layouts/Game";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/game",
    element: <GameLayout/>,
	children: [
		{
			path: "/game",
			element: <GamePage/>
		}
	]
  },
]);

export default router;
