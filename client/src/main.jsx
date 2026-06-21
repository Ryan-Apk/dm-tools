import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './pages/App.jsx'
import {BrowserRouter} from "react-router-dom";

/// Main entry point into the program
/// Binds to the root element that is inside the index.html
createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter>
        <App/>
    </BrowserRouter>
</StrictMode>,)
