import DatePicker from 'react-datepicker';
import { useState, useEffect } from 'react';
import { Offcanvas, Form, Button, Card } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { defaultHeaders } from '../../utils/axiosConfig';
import * as yup from 'yup';
import { Formik } from 'formik';

import 'react-datepicker/dist/react-datepicker.css';
import server from '../../services/server';
import {
  getFormattedDateTime,
  openLinkInNewTab,
} from '../../common/CommonFunctions';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { SmallLoadingIndicator } from '../../components/SmallLoadingIndicator';

export default function AddMeetingOverlay({
  show,
  setShow,
  onUpdate,
  checkIfExist,
  cloneMeeting,
}) {
  const [loading, setLoading] = useState(false);
  const [showZoomList, setShowZoomList] = useState(false);
  const [zoomMeetingList, setZoomMeetingList] = useState([]);
  const [isZoomMeeting, setIsZoomMeeting] = useState(false);
  const [searched, setSearched] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (showZoomList && !searched) {
      return getZoomMeetingList();
    }
  }, [showZoomList]);

  async function getZoomMeetingList() {
    try {
      setLoading(true);
      const response = await server.get(`/zoom/meetings`, defaultHeaders);
      const result = response.data;
      if (response.status !== 200) return;
      const filteredList = [];
      result.forEach((meeting) => {
        if (
          !filteredList.find((added) => added.uuid === meeting.uuid) &&
          !checkIfExist(meeting.uuid)
        ) {
          filteredList.push(meeting);
        }
      });
      setZoomMeetingList(filteredList);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  async function submit({
    name,
    desc,
    date,
    meetingId,
    meetingPassword,
    link,
    zoomUuid,
  }) {
    const newMeeting = {
      name: name,
      description: desc ? desc : null,
      startedAt: date.toISOString(),
      duration: 1800000,
      meetingId: `${meetingId}`,
      meetingPassword: meetingPassword,
      joinUrl: link,
      enableTranscription: true,
      zoomUuid: zoomUuid,
    };
    await fillItems(newMeeting, cloneMeeting);
    setLoading(true);
    return server
      .post('/meeting', newMeeting, defaultHeaders)
      .then((res) => {
        onUpdate();
        const id = res.data.id;
        setShow(false);
        logEvent(googleAnalytics, 'created_meeting', { meetingId: id });
        history.push('/meeting/' + id);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to create.');
      });
  }

  async function selectMeeting(meeting, setFieldValue) {
    try {
      setLoading(true);
      const response = await server.get(
        '/zoom/meetings/' + meeting.id,
        defaultHeaders,
      );
      const zoomMeeting = response.data;
      if (response.status !== 200) return;

      const start = meeting.start_time;
      const startField = start ? new Date(start) : new Date();
      setFieldValue('name', meeting.topic);
      setFieldValue('desc', meeting.agenda || '');
      setFieldValue('meetingId', meeting.id);
      setFieldValue('meetingPassword', zoomMeeting.password);
      setFieldValue('link', meeting.join_url);
      setFieldValue('date', startField);
      setFieldValue('zoomUuid', meeting.uuid);
      setIsZoomMeeting(true);
      setShowZoomList(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  function ManualInput({
    handleSubmit,
    handleChange,
    setFieldValue,
    values,
    touched,
    errors,
  }) {
    return (
      <>
        <Form.Group>
          <Form.Label column>Meeting Name</Form.Label>
          <Form.Control
            required
            placeholder="Please enter meeting name"
            name="name"
            onChange={handleChange}
            value={values.name}
            isValid={touched.name && !errors.name}
            isInvalid={touched.name && errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {touched.name && errors.name}
          </Form.Control.Feedback>
          <Form.Label column>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="desc"
            style={{ height: 200 }}
            placeholder="What is the meeting for?"
            onChange={handleChange}
            value={values.desc}
            isValid={touched.desc && !errors.desc}
            isInvalid={touched.desc && errors.desc}
          />
          <Form.Label column>Meeting ID</Form.Label>
          <Form.Control
            required
            name="meetingId"
            placeholder="Please enter meeting ID"
            onChange={handleChange}
            value={values.meetingId}
            isValid={touched.meetingId && !errors.meetingId}
            isInvalid={touched.meetingId && errors.meetingId}
            disabled={isZoomMeeting}
          />
          <Form.Control.Feedback type="invalid">
            {touched.meetingId && errors.meetingId}
          </Form.Control.Feedback>
          <Form.Label column>Meeting Password</Form.Label>
          <Form.Control
            required
            name="meetingPassword"
            placeholder="Please enter meeting password"
            onChange={handleChange}
            value={values.meetingPassword}
            isValid={touched.meetingPassword && !errors.meetingPassword}
            isInvalid={touched.meetingPassword && errors.meetingPassword}
            disabled={isZoomMeeting}
          />
          <Form.Control.Feedback type="invalid">
            {touched.meetingPassword && errors.meetingPassword}
          </Form.Control.Feedback>
          <Form.Label column>Meeting link</Form.Label>
          <Form.Control
            required
            name="link"
            placeholder="Please enter meeting link"
            onChange={handleChange}
            value={values.link}
            isValid={touched.link && !errors.link}
            isInvalid={touched.link && errors.link}
            disabled={isZoomMeeting}
          />
          <Form.Control.Feedback type="invalid">
            {touched.link && errors.link}
          </Form.Control.Feedback>
          <Form.Label column>Start Date</Form.Label>
          <DatePicker
            name="date"
            selected={values.date}
            showTimeSelect
            onChange={(date) => setFieldValue('date', date)}
            dateFormat="Pp"
            customInput={
              <Form.Control
                isValid={touched.date && !errors.date}
                isInvalid={touched.date && errors.date}
              />
            }
            disabled={isZoomMeeting}
          />
          <Form.Control.Feedback type="invalid">
            {touched.date && errors.date}
          </Form.Control.Feedback>
        </Form.Group>
        <div className="Buffer--20px" />
        <div className="d-grid gap-2">
          <Button variant="primary" onClick={handleSubmit}>
            Add new Meeting
          </Button>
        </div>
        <div className="Buffer--20px" />
      </>
    );
  }

  function ZoomMeetingList({ setFieldValue }) {
    const items = [];
    zoomMeetingList.forEach((meeting, idx) => {
      const startTime = meeting.start_time;
      const dateStr = startTime
        ? getFormattedDateTime(new Date(startTime))
        : 'No date available';
      items.push(
        <div className="Container__padding--vertical-small Clickable" key={idx}>
          <Card
            className="Clickable"
            onClick={() => {
              selectMeeting(meeting, setFieldValue);
            }}
          >
            <Card.Body>
              <Card.Title>{meeting.topic}</Card.Title>
              <Card.Text>{dateStr}</Card.Text>
            </Card.Body>
          </Card>
        </div>,
      );
    });
    return items;
  }

  function onClose(handleReset) {
    setShow(false);
    setSearched(false);
    setIsZoomMeeting(false);
    setShowZoomList(false);
    handleReset();
  }

  return (
    <Formik
      validationSchema={schema}
      initialValues={initialValue}
      onSubmit={submit}
    >
      {({
        handleSubmit,
        handleChange,
        setFieldValue,
        handleReset,
        values,
        touched,
        errors,
      }) => (
        <Offcanvas show={show} onHide={() => onClose(handleReset)}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              {cloneMeeting === null
                ? 'Add New Meeting'
                : 'Cloning "' + cloneMeeting.name + '"'}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                onClick={() => setShowZoomList(!showZoomList)}
              >
                {showZoomList ? 'Cancel' : 'Select from Zoom'}
              </Button>
              {!showZoomList || (
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    openLinkInNewTab('https://zoom.us/meeting/schedule');
                  }}
                >
                  New Zoom Meeting
                </Button>
              )}
            </div>
            {loading ? (
              <>
                <div className="Buffer--100px" />
                <SmallLoadingIndicator />
              </>
            ) : (
              <>
                <div className="Buffer--20px" />
                <div className="Line--horizontal" />
                <div className="Buffer--20px" />
                {!loading && showZoomList ? (
                  <>
                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-primary"
                        onClick={getZoomMeetingList}
                      >
                        Refresh
                      </Button>
                    </div>
                    <div className="Buffer--20px" />
                    <ZoomMeetingList setFieldValue={setFieldValue} />
                  </>
                ) : (
                  <ManualInput
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    setFieldValue={setFieldValue}
                    values={values}
                    touched={touched}
                    errors={errors}
                  />
                )}
              </>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      )}
    </Formik>
  );
}

const schema = yup.object().shape({
  name: yup.string().required('Meeting name is required'),
  desc: yup.string(),
  meetingId: yup
    .number('Meeting ID is must be a number')
    .required('Meeting ID is required'),
  meetingPassword: yup.string().required('Meeting password is required'),
  link: yup
    .string()
    .url('Meeting link must be a valid URL')
    .required('Meeting link is required'),
  date: yup.date().required('Meeting time is required'),
  zoomUuid: yup.string().nullable(),
});

const initialValue = {
  name: '',
  desc: '',
  meetingId: '',
  meetingPassword: '',
  link: '',
  date: new Date(),
  zoomUuid: null,
};

async function fillItems(newMeeting, cloneMeeting) {
  if (cloneMeeting === null) return;
  const response = await server.get(
    `/meeting/${cloneMeeting.id}`,
    defaultHeaders,
  );
  if (response.status !== 200) return;
  const result = response.data;
  if (result.agendaItems.length > 0) {
    result.agendaItems.forEach((item) => {
      item.speaker = null;
      item.speakerMaterials = '';
    });
    newMeeting.agendaItems = result.agendaItems;
  }
  if (result.participants.length > 0) {
    newMeeting.participants = result.participants.filter((x) => !x.isDuplicate);
  }
}
