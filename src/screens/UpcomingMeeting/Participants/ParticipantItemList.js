import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { isValidEmail } from '../../../common/CommonFunctions';
import parseCsvToObjects from '../../../utils/parseCsvToObjects';
import unmount from '../../../utils/unmount';
import ParticipantItem from './ParticipantItem';
import AddParticipantsModal from './AddParticipantsModal';
import ImportModal from './ImportModal';

const PARTICIPANTS_HEADER_ERROR =
  'Invalid header row! Columns should be labeled "Name" and "Email" (case-specific)!';
const INVALID_EMAIL_WARNING =
  'Found entries with invalid emails. Those entries have been omitted.';
const DUPLICATE_ENTRY_WARNING =
  'Found duplicate emails in the CSV. Only the first instance will be included.';

export default function ParticipantItemList({ meeting, setMeeting }) {
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipants, setNewParticipants] = useState([]);
  const mounted = useRef(true);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'ParticipantItemList');
  }, []);

  function uploadParticipants(file) {
    setLoading(true);
    if (!file) {
      setLoading(false);
      return;
    }
    const fileNameSplit = file.name.split('.');
    const fileExtension = fileNameSplit[fileNameSplit.length - 1];
    if (fileExtension !== 'csv') {
      setLoading(false);
      throw new Error('Invalid file type!');
    }
    parseCsvToObjects(
      file,
      ['Name', 'Email'],
      presentModal,
      PARTICIPANTS_HEADER_ERROR,
    );
    setShowImportModal(false);
    setShowAddModal(true);
    setLoading(false);
  }

  function presentModal(fileContents) {
    const participants = convertToParticipants(meeting.id, fileContents);
    setNewParticipants(participants);
    setLoading(false);
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
      <div className="d-grid gap-2" key="btn">
        <Button onClick={() => setShowImportModal(true)}>
          Import From CSV
        </Button>
      </div>
      <div className="Buffer--20px" />
      <ImportModal
        show={showImportModal}
        setShow={setShowImportModal}
        parseFile={uploadParticipants}
        loading={loading}
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
  const emailSet = new Set();
  const participants = res.map((p) => {
    return {
      meetingId: meetingId,
      userName: p['Name'],
      userEmail: p['Email'],
    };
  });
  const finalList = [];
  let invalidEmailFound = false;
  let duplicateEmailFound = false;

  participants.forEach((p) => {
    const email = p.userEmail;
    const alreadyExists = emailSet.has(email);
    const invalid = !isValidEmail(email);
    if (alreadyExists) duplicateEmailFound = true;
    if (invalid) invalidEmailFound = true;
    if (alreadyExists || invalid) return;

    emailSet.add(email);
    finalList.push(p);
  });

  if (invalidEmailFound) toast.warning(INVALID_EMAIL_WARNING);
  if (duplicateEmailFound) toast.warning(DUPLICATE_ENTRY_WARNING);

  return finalList;
}
