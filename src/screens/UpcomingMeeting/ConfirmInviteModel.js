import { Modal, Button, ListGroup, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { UserContext } from '../../context/UserContext';
import { useContext } from 'react';

const INVITE_SUCCESS = 'Invitations sent!';
const INVITE_SOME_FAIL =
  'Not all invitations sent! Check your invitation list.';

export default function ConfirmInviteModel({
  showModal,
  setShowModal,
  meeting,
  setMeeting,
  setInviteLoading,
  inviteList,
  setInviteList,
}) {
  const user = useContext(UserContext);

  async function sendInvitation(participants) {
    if (inviteList.length === 0) return;
    try {
      setInviteLoading(true);
      const inviteResponse = await server.post(
        `/participant/send-multiple-invites`,
        { participants },
        defaultHeaders,
      );
      const inviteData = inviteResponse.data.data;
      const successes = inviteData.filter((status) => status.success).length;

      const res = await server.get(`/participant/${meeting.id}`);
      setMeeting((prev) => ({ ...prev, participants: res.data }));

      if (successes === participants.length) toast.success(INVITE_SUCCESS);
      else toast.warn(INVITE_SOME_FAIL);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setInviteLoading(false);
    }
  }

  function ParticipantItem({ participant }) {
    return (
      <ListGroup.Item
        className="Clickable"
        onClick={() => {
          if (!inviteList.some((p) => p === participant)) {
            var newList = [];
            newList = newList.concat(inviteList);
            newList.push(participant);
            setInviteList(newList);
          } else if (inviteList.some((p) => p === participant)) {
            var newList = [];
            newList = newList.concat(inviteList);
            const position = inviteList.indexOf(participant);
            newList.splice(position, 1);
            setInviteList(newList);
          }
        }}
      >
        <div className="Container__row--space-between">
          {participant?.userEmail}
          <Form.Check
            checked={inviteList.some((p) => p === participant)}
            readOnly
          />
        </div>
      </ListGroup.Item>
    );
  }

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header>
        <Modal.Title>Send Invitation?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p className="Text__paragraph">
            Invitation to meeting - <b>{meeting.name}</b> - will be sent to
            these participants.
          </p>
          <Card className="Card__invite">
            <ListGroup variant="flush">
              {meeting.participants.length > 0 ? (
                meeting.participants.map((participant, id) => {
                  if (participant?.role === 2) return;
                  return <ParticipantItem key={id} participant={participant} />;
                })
              ) : (
                <p
                  className="Text__hint"
                  style={{ textAlign: 'center', height: '100px' }}
                >
                  All participants invited
                </p>
              )}
            </ListGroup>
          </Card>
          <p className="Text__paragraph">Are you sure you want to continue?</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            setShowModal(false);
            sendInvitation(inviteList);
          }}
          disabled={inviteList.length === 0}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
