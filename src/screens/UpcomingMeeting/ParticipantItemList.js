import ParticipantItem from './ParticipantItem';

export default function ParticipantItemList({
  meeting,
  setMeeting,
  hostEmail,
}) {
  const items = [];
  for (let i = 0; i < meeting.participants.length; i++) {
    items.push(
      <ParticipantItem
        key={'participant' + i}
        meeting={meeting}
        setMeeting={setMeeting}
        position={i}
        hostEmail={hostEmail}
      />,
    );
  }
  return items;
}
