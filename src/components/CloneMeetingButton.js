import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router';

export default function CloneMeetingButton({ id, name }) {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  function onConfirmation() {
    history.push(`/home?clone=${id}`);
  }

  return (
    <>
      <Button variant="outline-primary" onClick={() => setShowModal(true)}>
        Clone
      </Button>
      <CloneMeetingModal
        show={showModal}
        setShow={setShowModal}
        onConfirm={onConfirmation}
        name={name}
      />
    </>
  );
}

function CloneMeetingModal({ show, setShow, onConfirm, name }) {
  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header>
        <Modal.Title>Cloning {name} into another meeting</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p className="Text__paragraph">
            This will copy the agenda and participants of this meeting over to
            another meeting and redirect you back to the dashboard.
          </p>
          <div className="Buffer--10px" />
          <p className="Text__paragraph">Are you sure you want to continue?</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShow(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
