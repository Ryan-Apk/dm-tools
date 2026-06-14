import {Route, Routes} from 'react-router-dom'
import NotFound from "./NotFound.jsx";

/// This is the file that returns the full function of the program, should only contain routes
export default function App() {
    return (<div>
            <Routes>
                {/*The below routes to the home.jsx page */}
                <Route path="/" component={App}
                       element={<div className="flex flex-col items-center justify-center h-full p-10">
                           <h1 className="mt-4 font-bold">Test</h1>
                       </div>}/>
                <Route path="/button" element={<NotFound/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>

            {/*TODO this is so temporary its not even funny, use custom button instead!*/}
        </div>)
}