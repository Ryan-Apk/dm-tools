import {NavLink, Route, Routes} from 'react-router-dom'
import Whiteboard from "./Whiteboard.jsx";
import NotFound from "./NotFound.jsx";

/// This is the file that returns the full function of the program, should only contain routes
export default function App() {
    return (<div>
            <Routes>
                {/*The below routes to the home.jsx page */}
                <Route path="/" component={App}
                       element={<div className="flex flex-col items-center justify-center h-full p-10">
                           <NavLink to="/whiteboard/1"
                                    className="rounded-xl border-2 p-5 border-black text-xl font-bold bg-red-700 text-white">Take
                               me to the battlemap!</NavLink>
                           <h1 className="mt-4 font-bold">For now this link goes to the global whiteboard, in the future it will go elsewhere!</h1>
                       </div>}/>
                <Route path="/whiteboard" element={<Whiteboard/>}/>
                <Route path="/whiteboard/:whiteboardId" element={<Whiteboard/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>

            {/*TODO this is so temporary its not even funny, use custom button instead!*/}
        </div>)
}