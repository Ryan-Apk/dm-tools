// eslint-disable-next-line max-len
/// TODO this currently just passes it to the default input field, but I want to customise this later

export default function InputField({
// eslint-disable-next-line react/prop-types
  type, name, id, placeholder, className,
}) {
  return (
    <div>
      <input
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}
