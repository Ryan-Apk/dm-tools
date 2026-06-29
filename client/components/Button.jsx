// button component use example:
/// <Button onClick={() => console.log('Button clicked!')}>Submit</Button>}/>

export default function Button({ children, onClick, type = 'button' }) {
  return (
    <div className="button-bg inline-block rounded-3xl">
      <button
        onClick={onClick}
        type={type}
        className="fantasy-button text-white font-bold text-lg"
      >
        <span className="select-none">{children}</span>
      </button>
    </div>
  );
}
