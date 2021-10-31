import { Modal, Button, Form } from 'react-bootstrap';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import downloadFile from '../../../utils/downloadFile';

export default function ImportModal({ show, setShow, parseFile }) {
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
        <p>Upload your list of participants here:</p>
        <Form.Control
          type="file"
          ref={fileRef}
          onChange={handleChange}
          accept=".csv"
        />
        <div className="Buffer--20px" />
        <p>A blank template can be downloaded here:</p>
        <div className="d-grid gap-2">
          <Button variant="outline-primary" onClick={downloadTemplateCSV}>
            CSV Template
          </Button>
        </div>
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
  const fileName = 'MeetBallsParticipantTemplate.csv';
  downloadFile(csvString, fileName);
}
