import { Button } from 'react-bootstrap';
import { markParticipantDuplicate } from '../../../services/participants';
import { toast } from 'react-toastify';
import { extractError } from '../../../utils/extractError';
import { useState } from 'react';
import ConfirmDupeModal from './ConfirmDupeModal';
import { FaTrash } from 'react-icons/fa';

export default function MarkDuplicateButton({
  meeting,
  setMeeting,
  position,
  variant,
}) {
  const participant = meeting.participants[position];
  const [showModal, setShowModal] = useState(false);
  const markDupe = () => markDuplicate(meeting, setMeeting, position);
  return (
    <>
      <Button
        variant={variant}
        onClick={() => setShowModal(true)}
        style={{ width: 50 }}
      >
        <FaTrash />
      </Button>
      <ConfirmDupeModal
        participant={participant}
        showModal={showModal}
        setShowModal={setShowModal}
        onMarkDuplicate={markDupe}
      />
    </>
  );
}

async function markDuplicate(meeting, setMeeting, position) {
  try {
    await markParticipantDuplicate(
      meeting.id,
      meeting.participants[position].id,
    );
    delete meeting.participants[position];
    setMeeting(meeting);
  } catch (error) {
    toast.error(extractError(error));
  }
}
