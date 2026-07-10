// button component use example:
/// <Button onClick={() => console.log('Button clicked!')}>Submit</Button>}/>

export default function Button({
  children, onClick, type = 'button', ariaLabel, className = '',
}) {
  const style = `${className} fantasy-button text-white font-bold text-lg`;
  return (
    <div className="button-bg inline-block rounded-3xl">
      <button
        onClick={onClick}
        type={type}
        aria-label={ariaLabel}
        className={style}
      >
        <span className="select-none">{children}</span>
      </button>
    </div>
  );
}
