import { Modal, Button, Form } from 'react-bootstrap';
import { useRef } from 'react';
import { toast } from 'react-toastify';

export default function ImportModal({ show, setShow, parseFile, loading }) {
  const fileRef = useRef(null);

  function handleChange(event) {
    const file = event.target.files[0];
    try {
      parseFile(file);
    } catch (error) {
      toast.error(error.message);
    } finally {
      event.target.value = null;
    }
  }

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header>
        <Modal.Title>Import Participants</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please download and fill in the template below:</p>
        <Button onClick={downloadTemplateCSV}>CSV Template</Button>
        <div className="Buffer--20px" />
        <p>Then, upload the file here:</p>
        <Form.Control
          type="file"
          ref={fileRef}
          onChange={handleChange}
          accept=".csv"
        />
        <div className="Buffer--20px" />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShow(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function downloadTemplateCSV() {
  const csvString = encodeURI('data:text/csv;charset=utf-8,Name,Email\n');
  const link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', csvString);
  link.setAttribute('download', 'MeetBallsParticipantTemplate');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
