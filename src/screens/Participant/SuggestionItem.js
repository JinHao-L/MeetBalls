import { useState } from 'react';
import { Col, Card, Row, Button } from 'react-bootstrap';
import EditSuggestionItem from './EditSuggestionItem';
import { toast } from 'react-toastify';
import server from '../../services/server';
import { extractError } from '../../utils/extractError';
import { defaultHeaders } from '../../utils/axiosConfig';

export default function SuggestionItem({ item, suggestions, setSuggestions }) {
  const [editing, setEditing] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  if (!editing && item.name === '') {
    setEditing(true);
  }

  if (editing) {
    return (
      <EditSuggestionItem
        item={item}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        setEditing={setEditing}
      />
    );
  }

  async function remove() {
    if (isDeleting) return;
    setDeleting(true);
    try {
      const response = await server.delete('/suggestion/' + item.id, {
        headers: {
          ...defaultHeaders.headers,
          'X-Participant': sessionStorage.getItem(item.meetingId) || '',
        },
      });
      if (response.status !== 200) {
        toast.error('Failed to Delete');
        return;
      }
      const index = suggestions.indexOf(item);
      if (index >= 0) {
        const newSuggestions = Object.assign([], suggestions);
        newSuggestions.splice(index, 1);
        setSuggestions(newSuggestions);
      }
    } catch (err) {
      toast.error(extractError(err));
    }
    setDeleting(false);
  }

  function edit() {
    setEditing(true);
  }

  return (
    <Col lg={12} md={12} sm={12} className="Container__padding--vertical-small">
      <Card>
        <Card.Body>
          <Card.Title>{item?.name}</Card.Title>
          <div className="Buffer--5px" />
          <Card.Text>{item.description}</Card.Text>
        </Card.Body>
        <Row>
          <Col style={{ paddingRight: 0 }} onClick={remove}>
            <div className="d-grid gap-2">
              <Button variant="card-left-danger">Remove</Button>
            </div>
          </Col>
          <Col style={{ paddingLeft: 0 }}>
            <div className="d-grid gap-2" onClick={edit}>
              <Button variant="card-right">Edit</Button>
            </div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
}
