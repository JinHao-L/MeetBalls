import { Card, Col, Row, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import { isValidUrl } from '../../common/CommonFunctions';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import { openFile, uploadFile } from '../../services/files';

export default function UploadItem({ agendaItem, speakerId }) {
  const [isUpload, setIsUpload] = useState(false);
  const [materials, setMaterials] = useState(agendaItem.speakerMaterials || '');
  const [file, setFile] = useState(null);
  const [isEditing, setEditing] = useState(
    agendaItem.speakerMaterials === null || agendaItem.speakerMaterials === '',
  );

  function EditButton() {
    return (
      <Row>
        <Col className="d-grid gap-2">
          <Button
            onClick={() =>
              openFile(
                materials,
                agendaItem.meetingId,
                speakerId,
              ).catch((_err) => {
                toast.error('File not found');
              })
            }
          >
            Open File
          </Button>
        </Col>
        <Col className="d-grid gap-2">
          <Button variant="secondary" onClick={() => remove()}>
            Remove File
          </Button>
        </Col>
      </Row>
    );
  }

  async function remove() {
    try {
      const data = {
        name: agendaItem.name,
        description: agendaItem.description,
        startTime: null,
        expectedDuration: agendaItem.duration,
        actualDuration: null,
        isCurrent: false,
        speakerMaterials: null,
        speakerId: speakerId,
      };
      await server.put(
        `/agenda-item/${agendaItem.meetingId}/${agendaItem.position}`,
        data,
        defaultHeaders,
      );
      setMaterials('')
    } catch (err) {
      toast.error(extractError(err));
      return;
    }
    setEditing(true);
  }

  async function submit() {
    const linkSubmitted = materials !== '';
    let speakerMaterials = materials;
    if (isUpload) {
      try {
        const fileName = await uploadFile(
          file,
          agendaItem.meetingId,
          speakerId,
        );
        setMaterials(fileName);
        speakerMaterials = fileName;
      } catch (err) {
        if (err.response?.status === 400) {
          toast.error(extractError(err) || 'Failed to upload file');
        } else {
          toast.error('Failed to upload file');
        }
        return;
      }
    } else if (linkSubmitted && !isValidUrl(materials)) {
      toast.error('Attempted to submit an invalid URL');
      setMaterials('');
      return;
    }
    try {
      const data = {
        name: agendaItem.name,
        description: agendaItem.description,
        startTime: null,
        expectedDuration: agendaItem.duration,
        actualDuration: null,
        isCurrent: false,
        speakerId: speakerId,
        speakerMaterials: speakerMaterials,
      };
      await server.put(
        `/agenda-item/${agendaItem.meetingId}/${agendaItem.position}`,
        data,
        defaultHeaders,
      );
      agendaItem.speakerMaterials = speakerMaterials;
      setEditing(false);
    } catch (err) {
      toast.error(extractError(err));
    }
  }

  return (
    <Col
      lg={6}
      md={12}
      sm={12}
      style={{ paddingLeft: 10, paddingRight: 10 }}
      className="Container__padding--vertical-small"
    >
      <Card>
        <Card.Body>
          <Card.Title>{agendaItem?.name}</Card.Title>
          <Card.Text>{agendaItem?.description}</Card.Text>
          {isEditing ? (
            <>
              <Form.Group as={Row}>
                <Form.Label column>Materials (optional)</Form.Label>
                <Form.Label
                  column
                  onClick={() => setIsUpload((prev) => !prev)}
                  className="Clickable"
                  variant="primary"
                  style={{ textAlign: 'right', color: '#725546' }}
                >
                  {isUpload ? 'Use url' : 'Upload local file'}
                </Form.Label>
              </Form.Group>
              <Form.Control
                type="file"
                hidden={!isUpload}
                onChange={(e) => setFile(e.target.files[0])}
              />
              <Form.Control
                value={materials}
                hidden={isUpload}
                placeholder="Add a URL to your presentation materials"
                onChange={(event) => setMaterials(event.target.value)}
              />
              <div className="Buffer--20px" />
              <div className="d-grid gap-2">
                <Button onClick={submit}>Submit</Button>
              </div>
            </>
          ) : (
            <EditButton />
          )}
        </Card.Body>
      </Card>
    </Col>
  );
}
