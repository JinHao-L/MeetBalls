import { Card } from 'react-bootstrap';
import { blankAgenda, blankParticipant } from '../../common/ObjectTemplates';
import { FaUserPlus, FaRegPlusSquare } from 'react-icons/fa';

export default function AddToggle({
  currentTab,
  meeting,
  setMeeting,
  isReordering,
}) {
  var participantsLength = meeting?.participants?.length;
  var agendaLength = meeting?.agendaItems?.length;
  if (
    currentTab === Tabs.PARTICIPANTS &&
    (participantsLength === 0 ||
      meeting.participants[participantsLength - 1].userName !== '')
  ) {
    return (
      <div className="Container__padding--vertical-small">
        <Card
          onClick={() => addParticipant(meeting, setMeeting)}
          border="primary"
          className="Container__center--vertical Clickable"
          style={{ borderStyle: 'dashed' }}
        >
          <div className="Buffer--20px" />
          <FaUserPlus size={24} color="#8F6B58" />
          <div className="Buffer--10px" />
          <p className="Text__subsubheader" style={{ color: '#8F6B58' }}>
            Add Participant
          </p>
          <div className="Buffer--20px" />
        </Card>
      </div>
    );
  } else if (
    !isReordering &&
    currentTab === Tabs.AGENDA &&
    (agendaLength === 0 || meeting.agendaItems[agendaLength - 1].name !== '')
  )
    return (
      <div className="Container__padding--vertical-small">
        <Card
          onClick={() => {
            addAgenda(meeting, setMeeting);
          }}
          border="primary"
          className="Container__center--vertical Clickable"
          style={{ borderStyle: 'dashed' }}
        >
          <div className="Buffer--20px" />
          <FaRegPlusSquare size={24} color="#8F6B58" style={{ margin: 2 }} />
          <div className="Buffer--10px" />
          <p className="Text__subsubheader" style={{ color: '#8F6B58' }}>
            Add Agenda Item
          </p>
          <div className="Buffer--20px" />
        </Card>
      </div>
    );

  return null;
}

function addParticipant(meeting, setMeeting) {
  scrollToBottom();
  if (meeting.participants.findIndex((item) => item.userEmail === '') >= 0)
    return;
  const newMeeting = Object.assign({}, meeting);
  const newParticipant = Object.assign({}, blankParticipant);
  newParticipant.meetingId = newMeeting.id;
  newMeeting.participants = [...newMeeting.participants, newParticipant];
  setMeeting(newMeeting);
}

async function addAgenda(meeting, setMeeting) {
  scrollToBottom();
  if (meeting.agendaItems.findIndex((item) => item.name === '') >= 0) return;
  const newMeeting = Object.assign({}, meeting);
  const newAgenda = Object.assign({}, blankAgenda);
  newAgenda.meetingId = newMeeting.id;
  const size = newMeeting.agendaItems.length;
  if (size > 0) {
    const lastItem = newMeeting.agendaItems[size - 1];
    newAgenda.position = lastItem.position + 1;
  } else {
    newAgenda.position = 0;
  }
  newAgenda.prevPosition = newAgenda.position;
  newMeeting.agendaItems = [...newMeeting.agendaItems, newAgenda];
  setMeeting(newMeeting);
}

async function scrollToBottom() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  window.scrollTo(0, window.outerHeight);
}

const Tabs = {
  AGENDA: 'agenda',
  PARTICIPANTS: 'participants',
  SUGGESTIONS: 'suggestions',
};
