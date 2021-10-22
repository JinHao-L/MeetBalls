import { Card, Row, Col, Button } from 'react-bootstrap';
import { getFormattedDuration } from '../../common/CommonFunctions';
import server from '../../services/server';
import { extractError } from '../../utils/extractError';
import { defaultHeaders } from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { SmallLoadingIndicator } from '../../components/SmallLoadingIndicator';

export default function SuggestionItem({
  item,
  meetingId,
  suggestions,
  setSuggestions,
}) {
  const [loading, setLoading] = useState(false);

  async function approve() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await server.put(`/suggestion/accept/${item.id}`, {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(meetingId) || '',
      });
      if (response.status !== 200 && response.status !== 201) return;
      const newSuggestions = Object.assign([], suggestions);
      const index = newSuggestions.indexOf(item);
      newSuggestions.splice(index, 1);
      setSuggestions(newSuggestions);
    } catch (err) {
      toast.error(extractError(err));
    }
    setLoading(false);
  }

  async function reject() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await server.delete(`/suggestion/${item.id}`, {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(meetingId) || '',
      });
      if (response.status !== 200 && response.status !== 201) return;
      const newSuggestions = Object.assign([], suggestions);
      const index = newSuggestions.indexOf(item);
      newSuggestions.splice(index, 1);
      setSuggestions(newSuggestions);
    } catch (err) {
      toast.error(extractError(err));
    }
    setLoading(false);
  }

  if (loading)
    return (
      <Card>
        <div className="Buffer--50px" />
        <SmallLoadingIndicator />
        <div className="Buffer--50px" />
      </Card>
    );

  return (
    <div
      className="Container__padding--vertical-small"
      style={{ paddingRight: 10 }}
      key={item.id}
    >
      <Card>
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <Card.Subtitle>
            {getFormattedDuration(item.expectedDuration)}
          </Card.Subtitle>
          <div className="Buffer--5px" />
          <Card.Text>{item.description}</Card.Text>
        </Card.Body>
        <Row>
          <Col style={{ paddingRight: 0 }}>
            <div className="d-grid gap-2">
              <Button variant="card-left-danger" onClick={() => reject(item)}>
                Reject
              </Button>
            </div>
          </Col>
          <Col style={{ paddingLeft: 0 }}>
            <div className="d-grid gap-2">
              <Button variant="card-right" onClick={() => approve(item)}>
                Approve
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
