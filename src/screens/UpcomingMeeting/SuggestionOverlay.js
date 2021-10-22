import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import server from '../../services/server';
import { extractError } from '../../utils/extractError';
import { defaultHeaders } from '../../utils/axiosConfig';
import SuggestionItem from './SuggestionItem';

export default function SuggestionOverlay({
  show,
  setShow,
  meeting,
  setMeeting,
}) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!show) return;
    getSuggestions();
  }, [show]);

  async function getSuggestions() {
    try {
      const response = await server.get(`/suggestion/${meeting.id}`, {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(meeting.id) || '',
      });
      if (response.status !== 200) return;
      const result = response.data;
      setSuggestions(result.filter((item) => !item?.accepted));
    } catch (err) {
      toast.error(extractError(err));
    }
  }

  function SuggestionItems() {
    const items = [];
    suggestions.forEach((item) => {
      items.push(
        <SuggestionItem
          key={item.id}
          item={item}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          meeting={meeting}
          setMeeting={setMeeting}
        />,
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
          <div className="Container__suggestion-list">
            <SuggestionItems />
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
