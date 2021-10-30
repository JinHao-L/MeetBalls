import { useEffect, useState } from 'react';
import { Card, Button, Modal, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { createParticipants } from '../../../services/participants';
import { extractError } from '../../../utils/extractError';
import { isValidEmail } from '../../../common/CommonFunctions';

const INVALID_EMAIL_WARNING = 'Found entries with invalid emails.';
const DUPLICATE_ENTRY_WARNING =
  'Found duplicate emails in the CSV. Only the first instance will be added.';

export default function AddParticipantsModal({
  show,
  setShow,
  candidates,
  meeting,
  setMeeting,
}) {
  const [emailSet, setEmailSet] = useState(new Set());
  const [newCandidates, setNewCandidates] = useState([]);
  const [dupeCandidates, setDupeCandidates] = useState([]);

  useEffect(() => {
    const existingEmails = meeting.participants.map((p) => p.userEmail);
    const set = new Set(existingEmails);
    setEmailSet(set);

    const eligibleUsers = candidates.filter((p) => !emailSet.has(p.userEmail));
    const ineligibleUsers = candidates.filter((p) => emailSet.has(p.userEmail));
    setDupeCandidates(ineligibleUsers);
    filterInvalidEntries(eligibleUsers);
  }, [candidates]);

  function filterInvalidEntries(eligibleUsers) {
    let invalidEmailFound = false;
    let duplicateEmailFound = false;

    const finalList = [];
    const dupeList = [];
    const invalidList = [];
    const emailSet = new Set();

    for (const person of eligibleUsers) {
      const email = person.userEmail;
      const alreadyExists = emailSet.has(email);
      const invalid = !isValidEmail(email);

      if (alreadyExists) {
        duplicateEmailFound = true;
        dupeList.push(person);
      }
      if (invalid) {
        invalidEmailFound = true;
        invalidList.push(person);
      }
      if (alreadyExists || invalid) continue;

      emailSet.add(email);
      person.userEmail = email.toLocaleLowerCase();
      finalList.push(person);
    }

    if (invalidEmailFound) toast.warning(INVALID_EMAIL_WARNING);
    if (duplicateEmailFound) toast.warning(DUPLICATE_ENTRY_WARNING);

    setDupeCandidates((prev) => [...prev, ...dupeList, ...invalidList]);
    setNewCandidates(finalList);
  }

  function CandidateItem({ candidate }) {
    return (
      <ListGroup.Item>
        <div className="Container__row--space-between">
          <div>
            {candidate?.userName} - {candidate?.userEmail}
          </div>
        </div>
      </ListGroup.Item>
    );
  }

  const eligibleCandidates = newCandidates.map((candidate, i) => {
    return <CandidateItem candidate={candidate} key={`new ${i}`} />;
  });
  const existingCandidates = dupeCandidates.map((candidate, i) => {
    return <CandidateItem candidate={candidate} key={`old ${i}`} />;
  });

  async function addParticipants(participants) {
    setShow(false);
    try {
      const response = await createParticipants(participants);
      const newParticipants = response?.data;
      const newList = meeting.participants
        .concat(newParticipants)
        .sort((p1, p2) => p1.userName.localeCompare(p2.userName));
      setMeeting((prev) => ({ ...prev, participants: newList }));

      toast.success('All new participants have been added!');
    } catch (e) {
      toast.error(extractError(e));
    }
  }

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header>
        <Modal.Title>Select Participants</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p className="Text__paragraph">
            The following participants will be added to <b>{meeting.name}</b>.
          </p>
          <Card className="Card__invite">
            <ListGroup variant="flush">{eligibleCandidates}</ListGroup>
          </Card>
          <div className="Buffer--10px" />
          <p className="Text__paragraph">
            The following participants either have duplicate or invalid emails.
          </p>
          <Card className="Card__invite">
            <ListGroup variant="flush">{existingCandidates}</ListGroup>
          </Card>
          <div className="Buffer--10px" />
          <p className="Text__paragraph">Are you sure you want to continue?</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShow(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            addParticipants(newCandidates);
          }}
          disabled={newCandidates.length === 0}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
