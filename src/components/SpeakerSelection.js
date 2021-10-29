import { Dropdown, DropdownButton } from 'react-bootstrap';

export default function SpeakerSelection({
  candidates,
  current,
  onSelect,
  onClear,
}) {
  const choices = candidates.map((candidate) => (
    <Dropdown.Item
      key={candidate.userEmail}
      onClick={() => onSelect(candidate)}
    >
      {candidate.userName}
    </Dropdown.Item>
  ));
  choices.push(<ClearSpeakerOption key="null choice" onClear={onClear} />);

  return (
    <DropdownButton
      variant="outline-primary"
      placeholder="Add presenter"
      title={current?.userName || '(No speaker assigned)'}
    >
      {choices}
    </DropdownButton>
  );
}

function ClearSpeakerOption({ onClear }) {
  return <Dropdown.Item onClick={onClear}>Remove speaker</Dropdown.Item>;
}
