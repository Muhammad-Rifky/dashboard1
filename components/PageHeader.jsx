export default function PageHeader({
  title,
  buttonText,
  buttonIcon,
  onButtonClick,
}) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        {title}
      </h1>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition cursor-pointer"
        >
          {buttonIcon}
          {buttonText}
        </button>
      )}
    </div>
  );
}