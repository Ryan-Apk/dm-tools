import {Route, Routes} from 'react-router-dom'
import NotFound from "./NotFound.jsx";
import Button from "../components/Button.jsx";

function BugsList() {
    return (
        <div>
        <h1>Issue with Firefox mouse cursors where clicking the button breaks them</h1>

        </div>
    );
}

/// This is the file that returns the full function of the program, should only contain routes
export default function App() {
    return (<div>
            <Routes>
                {/*The below routes to the home.jsx page */}
                <Route path="/" component={App}
                       element={<div className="flex flex-col items-center justify-center h-full p-10">
                           <h1 className="mt-4 font-bold">Test</h1>
                       </div>}/>
                <Route
                    path="/button"
                    element={<Button onClick={() => console.log('Button clicked!')}>Submit</Button>}
                />
                <Route path="/bugs" element={<BugsList/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </div>)
}