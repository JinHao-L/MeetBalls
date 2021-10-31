import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import parseCsvToObjects from '../../../utils/parseCsvToObjects';
import unmount from '../../../utils/unmount';
import ParticipantItem from './ParticipantItem';
import AddParticipantsModal from './AddParticipantsModal';
import ImportModal from './ImportModal';

const PARTICIPANTS_HEADER_ERROR =
  'Invalid header row! Columns should be labeled "Name" and "Email" (case-specific)!';

export default function ParticipantItemList({ meeting, setMeeting }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipants, setNewParticipants] = useState([]);
  const mounted = useRef(true);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'ParticipantItemList');
  }, []);

  function uploadParticipants(file) {
    if (!file) return;

    const fileNameSplit = file.name.split('.');
    const fileExtension = fileNameSplit[fileNameSplit.length - 1];
    if (fileExtension !== 'csv') throw new Error('Invalid file type!');
    parseCsvToObjects(
      file,
      ['Name', 'Email'],
      presentModal,
      PARTICIPANTS_HEADER_ERROR,
    );
  }

  function presentModal(fileContents) {
    const participants = convertToParticipants(meeting.id, fileContents);
    setNewParticipants(participants);
    setShowImportModal(false);
    setShowAddModal(true);
  }

  const items = [];

  for (let i = 0; i < meeting.participants.length; i++) {
    items.push(
      <ParticipantItem
        key={'participant' + i}
        meeting={meeting}
        setMeeting={setMeeting}
        position={i}
      />,
    );
  }
  return (
    <>
      <div className="d-grid gap-2">
        <Button onClick={() => setShowImportModal(true)}>
          Import From CSV
        </Button>
      </div>
      <div className="Buffer--20px" />
      <ImportModal
        show={showImportModal}
        setShow={setShowImportModal}
        parseFile={uploadParticipants}
      />
      <AddParticipantsModal
        key={'add_participant_modal'}
        show={showAddModal}
        setShow={setShowAddModal}
        candidates={newParticipants}
        meeting={meeting}
        setMeeting={setMeeting}
      />
      {items}
    </>
  );
}

function convertToParticipants(meetingId, res) {
  const participants = res.map((p) => {
    return {
      meetingId: meetingId,
      userName: p['Name'],
      userEmail: p['Email'],
    };
  });
  return participants;
}
