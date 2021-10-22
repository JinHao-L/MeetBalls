import { useEffect, useState } from 'react';
import { Modal, Card } from 'react-bootstrap';

export default function SuggestionOverlay({ show, setShow }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!show) return;
  }, [show]);

  function SuggestionItems() {
    const items = [];
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
