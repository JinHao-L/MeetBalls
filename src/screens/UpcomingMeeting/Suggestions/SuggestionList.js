import SuggestionItem from './SuggestionItem';

export default function SuggestionList({
  meeting,
  setMeeting,
  suggestions,
  setSuggestions,
}) {
  function SuggestionItems() {
    const items = [];
    suggestions.forEach((item) => {
      items.push(
        <SuggestionItem
          key={item.id}
          item={item}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          meeting={meeting}
          setMeeting={setMeeting}
        />,
      );
    });
    return items;
  }

  return (
    <>
      <p className="Text__subsubheader" key={'Header'}>
        Suggestions by this meeting's attendees will appear here.
      </p>
      <div className="Buffer--20px" />
      <SuggestionItems />
    </>
  );
}
