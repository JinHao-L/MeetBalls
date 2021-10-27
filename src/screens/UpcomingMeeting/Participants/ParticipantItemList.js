import ParticipantItem from './ParticipantItem';
import ImportParticipantButton from './ImportParticipantsButton'
import parseCsvToObjects from '../../../utils/parseCsvToObjects';
import { useEffect, useRef, useState } from 'react';
import unmount from '../../../utils/unmount';
import AddParticipantsModal from './AddParticipantsModal';

const PARTICIPANTS_HEADER_ERROR = 'Invalid header row! Columns should be labeled "Name" and "Email" (case-specific)!';

export default function ParticipantItemList({ meeting, setMeeting }) {
  const handleFile = (file) => uploadParticipants(file, meeting.id, setMeeting);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipants, setNewParticipants] = useState([])
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'ParticipantItemList');
  }, []);

  function uploadParticipants(file) {
    setLoading(true);
    if (!file) {
      console.log('No file uploaded');
      return;
    } else if (file.type !== 'text/csv') {
      throw new Error('Invalid file type!');
    }
  
    parseCsvToObjects(file, ['Name', 'Email'], presentModal, PARTICIPANTS_HEADER_ERROR);
  }

  function presentModal(fileContents) {
    const participants = convertToParticipants(meeting.id, fileContents);
    setNewParticipants(participants);
    setLoading(false);
    setShowAddModal(true);
  }
  
  const items = [];
  items.push(
    <ImportParticipantButton loading={loading} key="btn" handleFile={handleFile}/>
  );
  items.push(
    <AddParticipantsModal
      show={showAddModal}
      setShow={setShowAddModal}
      candidates={newParticipants}
      meeting={meeting}
      setMeeting={setMeeting}
    />
  );

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
  return items;
}

function convertToParticipants(meetingId, res) {
  const participants = res.map((p) => {
    return {
      meetingId: meetingId,
      userName: p['Name'],
      userEmail: p['Email']
    };
  });
  return participants;
}
