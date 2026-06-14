export default function Button({children, onClick}) {
    return (<div className="button-bg inline-block rounded-3xl">
            <button onClick={onClick} className="fantasy-button text-white font-bold text-lg">
                <span className="select-none">{children}</span>
            </button>
        </div>);
}