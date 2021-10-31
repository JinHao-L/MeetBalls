import { Modal, Button } from 'react-bootstrap';

export default function ConfirmDeleteModal({
  showModal,
  setShowModal,
  meeting,
  deleteMeeting,
}) {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header>
        <Modal.Title>Confirm Delete?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="Text__paragraph">
          Meeting <b>{meeting.name}</b> will be deleted and cannot be recovered.
          Are you sure you want to continue?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            setShowModal(false);
            deleteMeeting();
          }}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
