import { Offcanvas, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import { extractError } from '../../utils/extractError';
import { clearMeetingsCache } from '../../utils/dashboardCache';
import { useEffect } from 'react';
import unmount from '../../utils/unmount';

export default function EditMeetingOverlay({
  show,
  setShow,
  meeting,
  setMeeting,
}) {
  const [loading, setLoading] = useState(false);
  const nameRef = useRef();
  const descriptionRef = useRef();
  const [date, setDate] = useState(new Date());
  const history = useHistory();
  const mounted = useRef(true);

  useEffect(() => {
    if (!show) return;

    mounted.current = true;
    const startDate = new Date(meeting.startedAt);
    setDate(startDate);

    return unmount(mounted, 'EditMeetingOverlay');
  }, [show]);

  async function update() {
    try {
      setLoading(true);
      const newMeeting = Object.assign({}, meeting);
      newMeeting.name = nameRef.current.value;
      newMeeting.description = descriptionRef.current.value;
      newMeeting.startedAt = date.toISOString();
      updateDatabase(newMeeting);
      setMeeting((meeting) => ({
        ...meeting,
        name: newMeeting.name,
        description: newMeeting.description,
        startedAt: newMeeting.startedAt,
      }));
      setShow(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  async function deleteMeeting(meetingId) {
    try {
      setLoading(true);
      const response = await server.delete(
        `/meeting/${meetingId}`,
        defaultHeaders,
      );
      if (response.status === 200) {
        clearMeetingsCache();
        history.goBack();
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      console.log(`EditMeetingOverlay still mounted? ${mounted.current}`);
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <Offcanvas show={show} onHide={() => setShow(false)}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Edit Meeting</Offcanvas.Title>
      </Offcanvas.Header>
      {loading ? (
        <FullLoadingIndicator />
      ) : (
        <Offcanvas.Body>
          <Form.Group>
            <Form.Label column>Meeting Name</Form.Label>
            <Form.Control defaultValue={meeting.name} ref={nameRef} />
            <Form.Label column>Description</Form.Label>
            <Form.Control
              as="textarea"
              style={{ height: 200 }}
              defaultValue={meeting.description}
              ref={descriptionRef}
            />
            <Form.Label column>Start Date</Form.Label>
            <DatePicker
              showTimeSelect
              dateFormat="Pp"
              selected={date}
              onChange={setDate}
              customInput={<Form.Control />}
            />
          </Form.Group>
          <div className="Buffer--20px" />
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={update}>
              Update
            </Button>
            <div className="Buffer--20px" />
            <div className="Line--horizontal" />
            <div className="Buffer--20px" />
            <Button variant="danger" onClick={() => deleteMeeting(meeting.id)}>
              Delete Meeting
            </Button>
          </div>
        </Offcanvas.Body>
      )}
    </Offcanvas>
  );
}

async function updateDatabase(newMeeting) {
  await server.put(
    `/meeting/${newMeeting.id}`,
    {
      name: newMeeting.name,
      description: newMeeting.description,
      duration: newMeeting.duration,
      enableTranscription: newMeeting.enableTranscription,
      startedAt: newMeeting.startedAt,
    },
    defaultHeaders,
  );
  clearMeetingsCache();
}
