import { useState } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { FaStar, FaRegStar } from 'react-icons/fa';

export default function FeedbackOverlay({
  showModal,
  setShowModal,
  meetingId,
}) {
  const [rating, setRating] = useState(5);
  const [textFeedback, setTextFeedback] = useState('');

  function RatingStars() {
    const items = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        items.push(
          <FaStar
            color="orange"
            size={24}
            onClick={() => setRating(i)}
            className="Clickable"
            key={'Star ' + i}
          />,
        );
      } else {
        items.push(
          <FaRegStar
            color="orange"
            size={24}
            onClick={() => setRating(i)}
            className="Clickable"
            key={'Star ' + i}
          />,
        );
      }
    }
    return items;
  }

  function submit() {
    var feedback = {
      rating: rating,
      description: textFeedback,
      meetingId: meetingId,
    };
    server
      .post('/feedback', feedback, defaultHeaders)
      .finally(setShowModal(false));
  }

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>Give Us Feedback</Modal.Header>
      <Modal.Body>
        <p className="Text__subsubheader" style={{ marginTop: 0 }}>
          Rate Your Experience
        </p>
        <div
          className="Container__row--space-between"
          style={{ padding: 10, maxWidth: 300 }}
        >
          <RatingStars />
        </div>
        <div className="Buffer--20px" />
        <p className="Text__subsubheader">Share Your Experience</p>
        <p className="Text__hint" style={{ justifyContent: 'start' }}>
          *optional
        </p>
        <Form.Control
          as="textarea"
          onChange={(event) => setTextFeedback(event.target.value)}
        />
        <div className="Buffer--20px" />
        <div className="d-grid gap-2">
          <Button onClick={submit}>Submit</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
