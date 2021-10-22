import { useEffect, useState } from 'react';
import { Modal, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import server from '../../services/server';
import { extractError } from '../../utils/extractError';
import { defaultHeaders } from '../../utils/axiosConfig';
import { getFormattedDuration } from '../../common/CommonFunctions';

export default function SuggestionOverlay({ show, setShow, meetingId }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!show) return;
    getSuggestions();
  }, [show]);

  async function getSuggestions() {
    try {
      const response = await server.get(`/suggestion/${meetingId}`, {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(meetingId) || '',
      });
      if (response.status !== 200) return;
      const result = response.data;
      setSuggestions(result);
    } catch (err) {
      toast.error(extractError(err));
    }
  }

  function SuggestionItems() {
    const items = [];
    suggestions.forEach((item) => {
      items.push(
        <Card>
          <Card.Body>
            <Card.Title>{item.name}</Card.Title>
            <Card.Subtitle>
              {getFormattedDuration(item.expectedDuration)}
            </Card.Subtitle>
            <Card.Text>{item.description}</Card.Text>
          </Card.Body>
        </Card>,
      );
    });
    return items;
  }

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header>
        <Modal.Title>Suggestions by Participants</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="Text__paragraph">
          Suggestions by this meeting's attendees will appear here. Approve them
          to add them to the existing agenda. Click anywhere outside to return
          to the meeting screen.
        </p>
        {suggestions.length === 0 ? (
          'You have no suggestions.'
        ) : (
          <SuggestionItems />
        )}
      </Modal.Body>
    </Modal>
  );
}
